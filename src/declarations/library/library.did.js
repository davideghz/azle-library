export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addBook' : IDL.Func(
        [
          IDL.Record({
            'title' : IDL.Text,
            'availableCopies' : IDL.Nat,
            'isbn' : IDL.Text,
            'author' : IDL.Text,
            'summary' : IDL.Text,
            'genre' : IDL.Text,
            'publicationYear' : IDL.Nat,
          }),
        ],
        [],
        [],
      ),
    'checkoutBook' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getBook' : IDL.Func(
        [IDL.Nat],
        [
          IDL.Opt(
            IDL.Record({
              'title' : IDL.Text,
              'availableCopies' : IDL.Nat,
              'isbn' : IDL.Text,
              'author' : IDL.Text,
              'summary' : IDL.Text,
              'genre' : IDL.Text,
              'publicationYear' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'getBorrowRecords' : IDL.Func(
        [IDL.Bool],
        [
          IDL.Vec(
            IDL.Record({
              'userId' : IDL.Principal,
              'bookId' : IDL.Nat,
              'returnDate' : IDL.Nat,
              'checkoutDate' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'returnBorrowed' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'searchBooks' : IDL.Func(
        [
          IDL.Record({
            'title' : IDL.Text,
            'publicationYearFrom' : IDL.Nat,
            'isbn' : IDL.Text,
            'author' : IDL.Text,
            'genre' : IDL.Text,
            'minAvailableCopies' : IDL.Nat,
            'publicationYearTo' : IDL.Nat,
          }),
        ],
        [
          IDL.Vec(
            IDL.Record({
              'title' : IDL.Text,
              'availableCopies' : IDL.Nat,
              'isbn' : IDL.Text,
              'author' : IDL.Text,
              'summary' : IDL.Text,
              'genre' : IDL.Text,
              'publicationYear' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
