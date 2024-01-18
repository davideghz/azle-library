import { Canister, query, text, update, Record, Void, nat, Principal, Vec, StableBTreeMap, bool, ic, Opt } from 'azle';

const Book = Record({
    title: text,
    author: text,
    isbn: text,
    publicationYear: nat,
    genre: text,
    summary: text,
    availableCopies: nat,
});

const SearchFilters = Record({
    title: text,
    author: text,
    isbn: text,
    publicationYearFrom: nat,
    publicationYearTo: nat,
    genre: text,
    minAvailableCopies: nat
});

const BorrowRecord = Record({
    userId: Principal,
    bookId: nat,
    checkoutDate: nat,
    returnDate: nat,
});

let books = StableBTreeMap<nat, typeof Book>(0);
let borrowedRecords = StableBTreeMap<nat, typeof BorrowRecord>(1);

export default Canister({
    searchBooks: query([SearchFilters], Vec(Book), (filters) => {
        const filteredBooks = books.values().filter((el: typeof Book) => {
            return el.title.toString().toLowerCase().includes(filters.title.toLowerCase()) &&
                el.author.toString().toLowerCase().includes(filters.author.toLowerCase()) &&
                (el.isbn.toString() === filters.isbn || filters.isbn === "") &&
                BigInt(el.publicationYear.toString()) >= filters.publicationYearFrom &&
                BigInt(el.publicationYear.toString()) <= filters.publicationYearTo &&
                (el.genre.toString() === filters.genre || filters.genre === "") &&
                BigInt(el.availableCopies.toString()) >= filters.minAvailableCopies;
        }).map(book => {
            return {
                title: book.title.toString(),
                author: book.author.toString(),
                isbn: book.isbn.toString(),
                publicationYear: BigInt(book.publicationYear.toString()),
                genre: book.genre.toString(),
                summary: book.summary.toString(),
                availableCopies: BigInt(book.availableCopies.toString())
            };
        });
        return filteredBooks;
    }),
    checkoutBook: update([nat], bool, (bookId) => {
        const book = books.get(bookId);
        if ('None' in book) {
            return false;
        }
        const bookSome = book.Some;
        if (BigInt(bookSome.availableCopies.toString()) === BigInt(0)) {
            return false;
        }
        const previousRecords = borrowedRecords.values().filter((el) => {
            return el.userId.toString() === ic.caller().toString() &&
                BigInt(el.bookId.toString()) === bookId &&
                BigInt(el.returnDate.toString()) == BigInt(0);
        });
        if (previousRecords.length > 0) {
            return false;
        }
        const nextKey = borrowedRecords.len();
        const newRecord = {
            userId: ic.caller(),
            bookId: BigInt(bookId),
            checkoutDate: ic.time(),
            returnDate: BigInt(0),
        };
        const newBook = {
            title: bookSome.title.toString(),
            author: bookSome.author.toString(),
            isbn: bookSome.isbn.toString(),
            publicationYear: BigInt(bookSome.publicationYear.toString()),
            genre: bookSome.genre.toString(),
            summary: bookSome.summary.toString(),
            availableCopies: BigInt(bookSome.availableCopies.toString()) - BigInt(1),
        };
        borrowedRecords.insert(
            nextKey,
            // @ts-ignore
            newRecord
        );
        // @ts-ignore
        books.insert(bookId, newBook);
        return true;
    }),
    //@ts-ignore
    getBorrowRecords: query([bool, bool], Vec(BorrowRecord), (activeOnly, allUsers) => {
        return borrowedRecords.values().filter((el) => {
            return (allUsers || el.userId.toString() === ic.caller().toString()) &&
                (!activeOnly || BigInt(el.returnDate.toString()) == BigInt(0));
        }).map((el) => {
            return {
                userId: el.userId,
                bookId: BigInt(el.bookId.toString()),
                checkoutDate: BigInt(el.checkoutDate.toString()),
                returnDate: BigInt(el.returnDate.toString()),
            }
        });
    }),
    addBook: update([Book], Void, (book) => {
        const nextKey = books.len();
        // @ts-ignore
        books.insert(nextKey, book);
    }),
    // @ts-ignore
    getBook: query([nat], Opt(Book), (bookId) => {
        return books.get(bookId);
    }),
    returnBorrowed: update([nat], bool, (bookId) => {
        const res = borrowedRecords.items().find((el) => {
            const tmpRecord = el[1];
            return BigInt(tmpRecord.bookId.toString()) === bookId &&
                BigInt(tmpRecord.returnDate.toString()) === BigInt(0);
        });
        if (!res) {
            return false;
        }
        const borrowRecordId = res[0];
        const record = res[1];
        if ('None' in record) {
            return false;
        }
        if (BigInt(record.returnDate.toString()) > BigInt(0)) {
            return false;
        }
        //@ts-ignore
        record.returnDate = ic.time();
        borrowedRecords.insert(borrowRecordId, record);
        const book = books.get(BigInt(record.bookId.toString()));
        if ('None' in book) {
            return false;
        }
        const bookSome = book.Some;
        const updatedBook = {
            title: bookSome.title.toString(),
            author: bookSome.author.toString(),
            isbn: bookSome.isbn.toString(),
            publicationYear: BigInt(bookSome.publicationYear.toString()),
            genre: bookSome.genre.toString(),
            summary: bookSome.summary.toString(),
            availableCopies: BigInt(bookSome.availableCopies.toString()) + BigInt(1),
        }
        // @ts-ignore
        books.insert(BigInt(record.bookId.toString()), updatedBook);
        return true;
    })
});

