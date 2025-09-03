const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (exists in array)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Kreiraj JWT token
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  // Spremi u session
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Add or modify a book review
// Endpoint: PUT /customer/auth/review/:isbn?review=tekst
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviewText = req.query.review;
  if (!reviewText || typeof reviewText !== "string") {
    return res.status(400).json({ message: "Review text is required via ?review=" });
  }

  // Username iz sessiona (ili middlewarea)
  const username = req.user || req.session?.authorization?.username;
  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
  book.reviews[username] = reviewText;

  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    isbn,
    reviewer: username,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
