'use strict';

// IMPORT ALL PACKAGES
const express = require('express');
const router = express.Router();

// HELPER MODULE
const helperModule = require('../helpers/module');
const { IMAGE_TYPE_MAP, setStorage, multerOptions } = helperModule;

// FILE STORAGE CONFIG
const imageStorage = setStorage(IMAGE_TYPE_MAP);
const imageMaxSize = 5 * 1024 * 1024;
const imageUpload = multerOptions(imageStorage, imageMaxSize);

// ERROR HANDLER
const errorHandler = require('../helpers/error-handler');
const { fileSizeLimitErrorHandler } = errorHandler;

// IMPORT image.js FILE FROM controllers FOLDER
const { uploadImage, searchImages } = require('../controllers/image');

// API UPLOAD A NEW IMAGE ROUTE
router.post(
  '/',
  imageUpload.single('image'),
  fileSizeLimitErrorHandler,
  uploadImage
);

// API SEARCH IMAGES DATA BY ID OR KEYWORDS ROUTE
router.post('/search', searchImages);

module.exports = router;
