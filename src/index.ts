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
        // Validate input data
        if (!isValidSearchFilters(filters)) {
            // Handle invalid input gracefully or throw an error
            return [];
        }

        // Filter books based on search criteria
        const filteredBooks = books.values().filter((book: typeof Book) => {
            const lowercaseTitle = book.title.toString().toLowerCase();
            const lowercaseAuthor = book.author.toString().toLowerCase();

            return lowercaseTitle.includes(filters.title.toLowerCase()) &&
                lowercaseAuthor.includes(filters.author.toLowerCase()) &&
                (book.isbn.toString() === filters.isbn || filters.isbn === "") &&
                BigInt(book.publicationYear.toString()) >= filters.publicationYearFrom &&
                BigInt(book.publicationYear.toString()) <= filters.publicationYearTo &&
                (book.genre.toString() === filters.genre || filters.genre === "") &&
                BigInt(book.availableCopies.toString()) >= filters.minAvailableCopies;
        }).map(book => ({
            title: book.title.toString(),
            author: book.author.toString(),
            isbn: book.isbn.toString(),
            publicationYear: BigInt(book.publicationYear.toString()),
            genre: book.genre.toString(),
            summary: book.summary.toString(),
            availableCopies: BigInt(book.availableCopies.toString())
        }));

        // Limit the number of results to prevent potential abuse
        const limitedResults = filteredBooks.slice(0, MAX_RESULTS);
        return limitedResults;
    }),

        return filteredBooks;
    }),
    export default Canister({
    checkoutBook: update([nat], bool, (bookId) => {
        // Validate bookId input
        if (!isValidBookId(bookId)) {
            // Handle invalid input gracefully or throw an error
            return false;
        }

        // Check for potential reentrancy issues
        if (isReentrantCall()) {
            // Handle reentrancy gracefully or throw an error
            return false;
        }

        const book = books.get(bookId);

        // Check if the book exists and has available copies
        if ('None' in book || BigInt(book.Some.availableCopies.toString()) === BigInt(0)) {
            // Handle unavailable book gracefully or throw an error
            return false;
        }

        // Check for previous borrowing records by the user
        const previousRecords = borrowedRecords.values().filter((record) => {
            return record.userId.toString() === ic.caller().toString() &&
                BigInt(record.bookId.toString()) === bookId &&
                BigInt(record.returnDate.toString()) === BigInt(0);
        });

        if (previousRecords.length > 0) {
            // Handle existing borrow record gracefully or throw an error
            return false;
        }

        // Proceed with checkout
        const nextKey = borrowedRecords.len();
        const newRecord = {
            userId: ic.caller(),
            bookId: BigInt(bookId),
            checkoutDate: ic.time(),
            returnDate: BigInt(0),
        };

        const updatedBook = {
            title: book.Some.title.toString(),
            author: book.Some.author.toString(),
            isbn: book.Some.isbn.toString(),
            publicationYear: BigInt(book.Some.publicationYear.toString()),
            genre: book.Some.genre.toString(),
            summary: book.Some.summary.toString(),
            availableCopies: BigInt(book.Some.availableCopies.toString()) - BigInt(1),
        };

        // Insert new borrowing record and update book information
        borrowedRecords.insert(nextKey, newRecord);
        books.insert(bookId, updatedBook);

        return true;
    }),
});

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
    export default Canister({
    getBorrowRecords: query([bool, bool], Vec(BorrowRecord), (activeOnly, allUsers) => {
        // Validate input data
        if (typeof activeOnly !== 'boolean' || typeof allUsers !== 'boolean') {
            // Handle invalid input gracefully or throw an error
            return [];
        }

        // Ensure proper authentication and authorization
        if (!isValidCaller()) {
            // Handle unauthorized access gracefully or throw an error
            return [];
        }

        // Filter borrowing records based on criteria
        const records = borrowedRecords.values().filter((record) => {
            return (allUsers || record.userId.toString() === ic.caller().toString()) &&
                (!activeOnly || BigInt(record.returnDate.toString()) === BigInt(0));
        }).map((record) => ({
            userId: record.userId,
            bookId: BigInt(record.bookId.toString()),
            checkoutDate: BigInt(record.checkoutDate.toString()),
            returnDate: BigInt(record.returnDate.toString()),
        }));

        return records;
    }),
    // ... other functions
});

        });
    }),
    export default Canister({
    addBook: update([Book], Void, (book) => {
        // Validate book details
        if (!isValidBookDetails(book) || isDuplicateBook(book)) {
            // Handle invalid input or duplicate book gracefully or throw an error
            return;
        }

        // Proceed with adding the book to the library
        const nextKey = books.len();
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

