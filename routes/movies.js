'use strict';

// IMPORT ALL PACKAGES
const express = require('express');
const router = express.Router();

// IMPORT movie.js FILE FROM controllers FOLDER
const { postMovie, searchMovies } = require('../controllers/movie');

// API POST A NEW MOVIE DATA
router.post('/', postMovie);

// API SEARCH MOVIE DATA BY KEYWORDS
router.post('/search', searchMovies);

module.exports = router;
