'use strict';

// IMPORT ALL PACKAGES
const client = require('../connection');

// HELPER MODULE
const helperModule = require('../helpers/module');
const sendResponse = helperModule.sendResponse;

// API POST A NEW MOVIE DATA
exports.postMovie = (req, res) => {
  try {
    const { name, description, featured, image_id } = req.body;
    const created_at = new Date();

    client.query(
      `INSERT INTO movies (name, description, featured, image_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, featured, image_id, created_at],
      (error, result) => {
        if (error) {
          sendResponse(res, 400, error, false, 2, 'movie');
        } else {
          sendResponse(res, 200, null, true, 1, 'movie', result);
        }
      }
    );
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};

// API SEARCH MOVIES DATA BY KEYWORDS
exports.searchMovies = async (req, res) => {
  try {
    const { id, keyword, featured, orderBy, order, currentPage, perPage } =
      req.query;

    const sql = `SELECT *
      FROM movies_v ${id || keyword || featured ? 'WHERE' : ''} ${
      keyword ? "LOWER(name) LIKE '%" + keyword.toLowerCase() + "%'" : ''
    } ${featured ? `${keyword ? 'AND ' : ''} featured = ${featured}` : ''} ${
      id ? `${keyword || featured ? 'AND ' : ''} id = ${id}` : ''
    }`;

    const totalData = await client.query(sql);

    client.query(
      `${sql} ORDER BY ${orderBy || 'id'} ${order || 'ASC'} LIMIT ${
        +perPage || 10
      } OFFSET ${((+currentPage || 1) - 1) * (perPage || 10)}`,
      (error, result) => {
        if (result.rows.length === 0) {
          sendResponse(res, 400, error, false, 5, 'movie');
        } else {
          sendResponse(
            res,
            200,
            null,
            true,
            2,
            'movie',
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
