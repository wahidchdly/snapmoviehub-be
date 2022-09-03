'use strict';

// IMPORT ALL PACKAGES
const express = require('express');
const router = express.Router();

// IMPORT category.js FILE FROM controllers FOLDER
const {
  postCategory,
  searchCategories,
  postMovieCategories,
} = require('../controllers/category');

// POST A NEW CATEGORY DATA ROUTE
router.post('/', postCategory);

// SEARCH CATEGORIES DATA BY ID OR KEYWORDS ROUTE
router.post('/search', searchCategories);

// POST MOVIE CATEGORIES ROUTE
router.post('/movie', postMovieCategories);

module.exports = router;
