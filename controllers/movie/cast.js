'use strict';

// IMPORT ALL PACKAGES
const client = require('../../connection');

// HELPER MODULE
const helperModule = require('../../helpers/module');
const folderPath = helperModule.folderPath;

// IMAGE ROUTE CONFIG
const filePath = (req, folder, file) => {
  const filePath = `${req.protocol}://${req.get('host')}/${folderPath(
    folder
  )}/${file}`;
  return filePath;
};

// API SEARCH CASTS DATA BY KEYWORDS
exports.searchCasts = async (req, res) => {
  try {
    const { id, keyword, main_role, orderBy, order, currentPage, perPage } =
      req.query;

    const sql = `SELECT *
      FROM casts ${keyword || main_role || id ? 'WHERE' : ''} ${
      keyword ? "LOWER(name) LIKE '%" + keyword.toLowerCase() + "%'" : ''
    } ${main_role ? `${keyword ? 'AND ' : ''} main_role = ${main_role}` : ''} ${
      id ? `${keyword || main_role ? 'AND ' : ''} id = ${id}` : ''
    }`;

    const totalData = await client.query(sql);

    client.query(
      `${sql} ORDER BY ${orderBy || 'name'} ${order || 'ASC'} LIMIT ${
        +perPage || 10
      } OFFSET ${((+currentPage || 1) - 1) * (perPage || 10)}`,
      (error, result) => {
        if (result.rows.length === 0) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: 'There is no cast found.',
          });
        } else {
          function sendResponse(param1, param2) {
            const response = {
              success: true,
              message: param1,
              statistics: param2,
              data: result.rows,
            };
            return response;
          }

          const resp = {
            totalData: totalData.rowCount,
            resultData: result.rowCount,
            perPage: perPage,
            currentPage: currentPage,
          };

          if (keyword || main_role) {
            return res.status(200).json(sendResponse('Cast was found', resp));
          }
          if (id && !keyword && !main_role) {
            return res
              .status(200)
              .json(
                sendResponse('Cast was found with this id.', result.rowCount)
              );
          }
          if (!id && !keyword && !main_role) {
            return res
              .status(200)
              .json(sendResponse('All Casts were found.', result.rowCount));
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: 'Something error on server.' });
  }
};

// API POST A CAST DATA
exports.postCast = (req, res) => {
  try {
    const { name, character, main_role } = req.body;

    const created_at = new Date();

    const image = req.file;

    let imagePath;

    if (image) {
      imagePath = filePath(req, 'images', image.filename);
    } else {
      imagePath = null;
    }

    client.query(
      `INSERT INTO casts (name, character, created_at, images, main_role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, character, created_at, imagePath, main_role],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: 'The cast was not created.',
          });
        } else {
          const {
            rows: [movie],
          } = result;

          return res.status(200).json({
            success: true,
            message: 'Created the cast successfully.',
            data: movie,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: 'Something error on server.' });
  }
};

// API GET ALL CASTS OF A MOVIE DATA
exports.getAllCastsOfMovie = (req, res) => {
  try {
    client.query(
      `SELECT * FROM movie_casts JOIN casts ON movie_casts.cast_id = casts.id WHERE movie_casts.movie_id = ${req.params.id}`,
      (error, result) => {
        if (result.rows.length === 0) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: 'There is no data found with this Id.',
          });
        } else {
          return res.status(200).json({
            success: true,
            message: 'Got the data successfully.',
            data: result.rows,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: 'There is no data found.' });
  }
};

// POST MOVIE CAST
exports.postMovieCasts = async (req, res) => {
  try {
    const { movie_id, cast_id } = req.body;

    const created_at = new Date();

    const totalMovieCasts = await client.query(
      `SELECT * FROM movie_casts JOIN casts ON movie_casts.cast_id = casts.id WHERE movie_casts.movie_id = ${movie_id}`
    );

    if (totalMovieCasts.rows.length === 6) {
      return res.status(400).json({
        success: false,
        error: 'You are only allowed to input 6 casts of a movie.',
      });
    } else {
      let error;

      for (let i = 0; i < totalMovieCasts.rows.length; i++) {
        if (cast_id === totalMovieCasts.rows[i].cast_id) {
          error = true;
        }
      }

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Cannot choose the same data twice.',
        });
      } else {
        client.query(
          `INSERT INTO movie_casts (movie_id, cast_id, created_at) VALUES ($1, $2, $3) RETURNING *`,
          [movie_id, cast_id, created_at],
          (error, result) => {
            if (error) {
              console.log(error);
              return res.status(400).json({
                success: false,
                error: 'The data was not created.',
              });
            }
            const {
              rows: [movieCasts],
            } = result;

            return res.status(200).json({
              success: true,
              message: 'Created the data successfully.',
              data: movieCasts,
            });
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: 'Something error on server.' });
  }
};
