'use strict';

// IMPORT ALL PACKAGES
const express = require('express');
const router = express.Router();

// IMPORT cast-character.js FILE FROM controllers FOLDER
const {
  postCast,
  postCharacter,
  searchCastsOrCharacters,
} = require('../controllers/cast-character');

// POST A NEW CAST DATA ROUTE
router.post('/casts', postCast);

// POST A NEW CHARACTER DATA ROUTE
router.post('/characters', postCharacter);

// SEARCH CASTS OR CHARACTERS DATA BY ID OR KEYWORDS AND OR MAIN ROLE ROUTE
router.post('/search', searchCastsOrCharacters);

module.exports = router;
