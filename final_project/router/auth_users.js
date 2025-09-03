const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users (popunjava se registracijom u general.js)
let users = [];

/**
 * isValid(username)
 * Vraća true ako username već postoji (zauzet).
 */
const isValid = (username) => {
  return users.some(user => user.username === username);
};

/**
 * authenticatedUser(username, password)
 * Vraća true ako postoji točan par username/password.
 */
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ===================== LOGIN =====================
// POST /customer/login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Kreiraj JWT (1h) i spremi ga u session
  const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// ========== ADD / UPDATE REVIEW (auth protected) ==========
// PUT /customer/auth/review/:isbn?review=tekst
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  // Lab traži review kroz query parametar
  const reviewText = req.query.review;
  if (!reviewText || typeof reviewText !== "string") {
    return res.status(400).json({ message: "Review text is required via ?review=" });
  }

  // Username iz auth middleware-a ili sessiona
  const username = req.user || req.session?.authorization?.username;
  if (!username) return res.status(403).json({ message: "User not authenticated" });

  if (!book.reviews) book.reviews = {};
  const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
  book.reviews[username] = reviewText;

  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    isbn,
    reviewer: username,
    reviews: book.reviews
  });
});

// ========== DELETE OWN REVIEW (auth protected) ==========
// DELETE /customer/auth/review/:isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const username = req.user || req.session?.authorization?.username;
  if (!username) return res.status(403).json({ message: "User not authenticated" });

  if (!book.reviews || !Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: "No review by this user for the selected book" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    isbn,
    reviewer: username,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
