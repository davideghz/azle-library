import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'addBook' : ActorMethod<
    [
      {
        'title' : string,
        'availableCopies' : bigint,
        'isbn' : string,
        'author' : string,
        'summary' : string,
        'genre' : string,
        'publicationYear' : bigint,
      },
    ],
    undefined
  >,
  'checkoutBook' : ActorMethod<[bigint], boolean>,
  'getBook' : ActorMethod<
    [bigint],
    [] | [
      {
        'title' : string,
        'availableCopies' : bigint,
        'isbn' : string,
        'author' : string,
        'summary' : string,
        'genre' : string,
        'publicationYear' : bigint,
      }
    ]
  >,
  'getBorrowRecords' : ActorMethod<
    [boolean],
    Array<
      {
        'userId' : Principal,
        'bookId' : bigint,
        'returnDate' : bigint,
        'checkoutDate' : bigint,
      }
    >
  >,
  'returnBorrowed' : ActorMethod<[bigint], boolean>,
  'searchBooks' : ActorMethod<
    [
      {
        'title' : string,
        'publicationYearFrom' : bigint,
        'isbn' : string,
        'author' : string,
        'genre' : string,
        'minAvailableCopies' : bigint,
        'publicationYearTo' : bigint,
      },
    ],
    Array<
      {
        'title' : string,
        'availableCopies' : bigint,
        'isbn' : string,
        'author' : string,
        'summary' : string,
        'genre' : string,
        'publicationYear' : bigint,
      }
    >
  >,
}
