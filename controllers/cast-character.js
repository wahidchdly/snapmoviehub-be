'use strict';

// IMPORT ALL PACKAGES
const client = require('../connection');

// HELPER MODULE
const helperModule = require('../helpers/module');
const sendResponse = helperModule.sendResponse;

// API POST A NEW CAST DATA
exports.postCast = async (req, res) => {
  try {
    const { name, image_id } = req.body;
    const created_at = new Date();

    const existCast = await client.query(
      `SELECT * FROM casts WHERE name = '${name}' AND image_id = ${image_id}`
    );

    if (existCast.rows.length > 0) {
      sendResponse(res, 400, null, false, 3, 'cast');
    } else {
      client.query(
        `INSERT INTO casts (name, image_id, created_at) VALUES ($1, $2, $3) RETURNING *`,
        [name, image_id, created_at],
        (error, result) => {
          if (error) {
            sendResponse(res, 400, error, false, 2, 'cast');
          } else {
            sendResponse(res, 200, null, true, 1, 'cast', result);
          }
        }
      );
    }
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};

// API POST A NEW CHARACTER DATA
exports.postCharacter = async (req, res) => {
  try {
    const { name, movie_id, cast_id, main_role } = req.body;
    const created_at = new Date();

    const movieCharacters = await client.query(
      `SELECT * FROM characters WHERE movie_id = ${movie_id}`
    );

    if (movieCharacters.rows.length === 6) {
      sendResponse(res, 400, null, false, 4, '6 characters');
    } else {
      let error;

      for (let i = 0; i < movieCharacters.rows.length; i++) {
        if (cast_id === movieCharacters.rows[i].cast_id) {
          error = true;
        }
      }

      if (error) {
        sendResponse(res, 400, null, false, 3, 'cast');
      } else {
        client.query(
          `INSERT INTO characters (name, movie_id, cast_id, main_role, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [name, movie_id, cast_id, main_role, created_at],
          (error, result) => {
            if (error) {
              sendResponse(res, 400, error, false, 2, 'character');
            } else {
              sendResponse(res, 200, null, true, 1, 'character', result);
            }
          }
        );
      }
    }
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};

// API SEARCH CASTS OR CHARACTERS DATA BY ID OR KEYWORDS AND OR MAIN ROLE
exports.searchCastsOrCharacters = async (req, res) => {
  try {
    const {
      data,
      id,
      keyword,
      main_role,
      orderBy,
      order,
      currentPage,
      perPage,
    } = req.query;

    const sql = `SELECT * FROM ${type === 'cast' ? 'casts' : 'characters'} ${
      id || keyword || main_role ? 'WHERE' : ''
    } ${id ? `id = ${id}` : ''} ${
      keyword ? "LOWER(name) LIKE '%" + keyword.toLowerCase() + "%'" : ''
    } ${keyword && main_role ? 'AND' : ''} ${
      main_role ? 'main_role = ' + main_role : ''
    }`;

    const totalData = await client.query(sql);

    client.query(
      `${sql} ORDER BY ${orderBy || 'id'} ${order || 'ASC'} LIMIT ${
        +perPage || 10
      } OFFSET ${((+currentPage || 1) - 1) * (perPage || 10)}`,
      (error, result) => {
        if (result.rows.length === 0) {
          sendResponse(res, 400, error, false, 5, data);
        } else {
          sendResponse(
            res,
            200,
            null,
            true,
            2,
            data,
            result,
            totalData,
            perPage,
            currentPage
          );
        }
      }
    );
  } catch (error) {
    sendResponse(res, 500, error, false, 1, error);
  }
};
