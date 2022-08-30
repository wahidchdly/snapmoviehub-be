'use strict';

// IMPORT ALL PACKAGES
const express = require('express');
const router = express.Router();

// HELPER MODULE
const helperModule = require('../helpers/module');
const { IMAGE_TYPE_MAP, setStorage, multerOptions } = helperModule;

// ERROR HANDLER
const errorHandler = require('../helpers/error-handler');
const { fileSizeLimitErrorHandler } = errorHandler;

// FILE STORAGE CONFIG
const imageStorage = setStorage(IMAGE_TYPE_MAP);
const imageMaxSize = 5 * 1024 * 1024;
const imageUpload = multerOptions(imageStorage, imageMaxSize);

// IMPORT movie.js FILE FROM controllers FOLDER
const {
  searchMovies,
  postMovie,
  searchCategories,
  postCategory,
  getAllCategoriessOfMovie,
  postMovieCategories,
} = require('../controllers/movie/movie');

// API SEARCH MOVIE DATA BY KEYWORDS
router.post('/search', searchMovies);

// API POST A MOVIE DATA
router.post(
  '/',
  imageUpload.single('images'),
  fileSizeLimitErrorHandler,
  postMovie
);

// API SEARCH CATEGORY DATA BY KEYWORDS
router.post('/category/search', searchCategories);

// API POST A CATEGORY DATA
router.post('/category', postCategory);

// API GET ALL CATEGORIES OF A MOVIE DATA
router.get('/categories/:id', getAllCategoriessOfMovie);

// API POST A CATEGORY DATA
router.post('/categories', postMovieCategories);

module.exports = router;
