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
  searchCasts,
  postCast,
  getAllCastsOfMovie,
  postMovieCasts,
} = require('../controllers/movie/cast');

// API SEARCH MOVIE DATA BY KEYWORDS
router.post('/search', searchCasts);

// API POST A CAST DATA
router.post(
  '/',
  imageUpload.single('images'),
  fileSizeLimitErrorHandler,
  postCast
);

// API GET ALL CASTS OF A MOVIE DATA
router.get('/movie/:id', getAllCastsOfMovie);

// POST MOVIE CAST
router.post('/movie', postMovieCasts);

module.exports = router;
