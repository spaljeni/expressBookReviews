const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ========== Task 6: Register a new user ==========
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  // Validacija inputa
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Provjeri postoji li već korisnik
  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Dodaj novog usera u memoriju
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// ========== Task 1: Get all books ==========
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// ========== Task 2: Get book details based on ISBN ==========
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// ========== Task 3: Get book details based on author ==========
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const filteredBooks = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );
  if (filteredBooks.length > 0) {
    res.send(JSON.stringify(filteredBooks, null, 4));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// ========== Task 4: Get all books based on title ==========
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );
  if (filteredBooks.length > 0) {
    res.send(JSON.stringify(filteredBooks, null, 4));
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// ========== Task 5: Get book reviews ==========
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
