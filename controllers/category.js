'use strict';

// IMPORT ALL PACKAGES
const client = require('../connection');

// HELPER MODULE
const helperModule = require('../helpers/module');
const sendResponse = helperModule.sendResponse;

// API POST A NEW CATEGORY DATA
exports.postCategory = (req, res) => {
  try {
    const { name } = req.body;
    const created_at = new Date();

    client.query(
      `INSERT INTO categories (name, created_at) VALUES ($1, $2) RETURNING *`,
      [name, created_at],
      (error, result) => {
        if (error) {
          sendResponse(res, 400, error, false, 2, 'category');
        } else {
          sendResponse(res, 200, null, true, 1, 'category', result);
        }
      }
    );
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};

// API SEARCH CATEGORIES DATA BY ID OR KEYWORDS
exports.searchCategories = async (req, res) => {
  try {
    const { id, keyword, orderBy, order, currentPage, perPage } = req.query;

    const sql = `SELECT *
      FROM categories ${keyword || id ? 'WHERE' : ''} ${
      id ? `${keyword ? 'AND ' : ''} id = ${id}` : ''
    } ${keyword ? "LOWER(name) LIKE '%" + keyword.toLowerCase() + "%'" : ''} `;

    const totalData = await client.query(sql);

    client.query(
      `${sql} ORDER BY ${orderBy || 'id'} ${order || 'ASC'} LIMIT ${
        +perPage || 10
      } OFFSET ${((+currentPage || 1) - 1) * (perPage || 10)}`,
      (error, result) => {
        if (result.rows.length === 0) {
          sendResponse(res, 400, error, false, 5, 'category');
        } else {
          sendResponse(
            res,
            200,
            null,
            true,
            2,
            'category',
            result,
            totalData,
            perPage,
            currentPage
          );
        }
      }
    );
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};

// API POST MOVIE CATEGORIES
exports.postMovieCategories = async (req, res) => {
  try {
    const { movie_id, category_id } = req.body;

    const totalMovieCategories = await client.query(
      `SELECT * FROM movie_categories LEFT JOIN categories ON movie_categories.category_id = categories.id WHERE movie_categories.movie_id = ${movie_id}`
    );

    if (totalMovieCategories.rows.length === 3) {
      sendResponse(res, 400, null, false, 4, '3 categories');
    } else {
      let error;

      for (let i = 0; i < totalMovieCategories.rows.length; i++) {
        if (category_id === totalMovieCategories.rows[i].category_id) {
          error = true;
        }
      }

      if (error) {
        sendResponse(res, 400, null, false, 3, 'category');
      } else {
        client.query(
          `INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2) RETURNING *`,
          [movie_id, category_id],
          (error, result) => {
            if (error) {
              sendResponse(res, 400, error, false, 2, 'movie category');
            } else {
              sendResponse(res, 200, null, true, 1, 'movie category', result);
            }
          }
        );
      }
    }
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};
