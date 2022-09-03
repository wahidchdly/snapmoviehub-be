'use strict';

// IMPORT ALL PACKAGES
const client = require('../connection');

// HELPER MODULE
const helperModule = require('../helpers/module');
const folderPath = helperModule.folderPath;
const sendResponse = helperModule.sendResponse;

// IMAGE ROUTE CONFIG
const filePath = (req, folder, file) => {
  const filePath = `${req.protocol}://${req.get('host')}/${folderPath(
    folder
  )}/${file}`;
  return filePath;
};

// API UPLOAD A NEW IMAGE
exports.uploadImage = (req, res) => {
  try {
    const { name } = req.body;
    const created_at = new Date();

    const image = req.file;
    let imagePath;

    if (image) {
      imagePath = filePath(req, 'image', image.filename);
    } else {
      imagePath = null;
    }

    client.query(
      `INSERT INTO images (name, image, created_at) VALUES ($1, $2, $3) RETURNING *`,
      [name, imagePath, created_at],
      (error, result) => {
        if (error) {
          sendResponse(res, 400, error, false, 2, 'image');
        } else {
          sendResponse(res, 200, null, true, 1, 'image', result);
        }
      }
    );
  } catch (error) {
    sendResponse(res, 500, error, false, 1);
  }
};

// API SEARCH IMAGES DATA BY ID OR KEYWORDS
exports.searchImages = async (req, res) => {
  try {
    const { id, keyword, orderBy, order, currentPage, perPage } = req.query;

    const sql = `SELECT *
      FROM images ${id || keyword ? 'WHERE' : ''}
      ${id ? 'id = ' + id : ''} ${
      keyword ? "LOWER(name) LIKE '%" + keyword.toLowerCase() + "%'" : ''
    }`;

    const totalData = await client.query(sql);

    client.query(
      `${sql} ORDER BY ${orderBy || 'name'} ${order || 'ASC'} LIMIT ${
        +perPage || 10
      } OFFSET ${((+currentPage || 1) - 1) * (perPage || 10)}`,
      (error, result) => {
        if (result.rows.length === 0) {
          sendResponse(res, 400, error, false, 5, 'image');
        } else {
          sendResponse(
            res,
            200,
            null,
            true,
            2,
            'image',
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
