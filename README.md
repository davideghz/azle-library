# Typescript 101 Submission

## Library manager system

### Introduction

This repository uses the typescript Azle package to create an ICP backend canister for managing a simple library, including books registration and renting.

### Functionalities

- **addBook**: Registers a new book in the library.
- **checkoutBook**: Allows users to rent a book, if available, giving in input the book id.
- **getBook**: Gets all the information of a book, given the book id.
- **getBorrowRecords**: Returns a list of all the borrow records, filtering by active (meaning that books are not returned), or allUsers (if false, only records of the caller will be shown).
- **returnBorrowed**: Returns a book to the library giving the id of the book.
- **searchBooks**: Returns a filtered list of books registered in the library.

### Setup

`dfx` is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

```bash
npm run dfx_install
```

Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

```bash
npm run replica_start
```

If you ever want to stop the replica:

```bash
npm run replica_stop
```

Now you can deploy your canister locally:

```bash
npm install
npm run canister_deploy_local
```
