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

// API SEARCH MOVIES DATA BY KEYWORDS
exports.searchMovies = async (req, res) => {
  try {
    const { id, keyword, featured, orderBy, order, currentPage, perPage } =
      req.query;

    const sql = `SELECT *
      FROM movies ${keyword || featured || id ? 'WHERE' : ''} ${
      keyword ? "LOWER(name) LIKE '%" + keyword.toLowerCase() + "%'" : ''
    } ${featured ? `${keyword ? 'AND ' : ''} featured = ${featured}` : ''} ${
      id ? `${keyword || featured ? 'AND ' : ''} id = ${id}` : ''
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
            error: 'There is no movie found.',
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

          if (keyword || featured) {
            return res.status(200).json(sendResponse('Movie was found', resp));
          }
          if (id && !keyword && !featured) {
            return res
              .status(200)
              .json(
                sendResponse('Movie was found with this id.', result.rowCount)
              );
          }
          if (!id && !keyword && !featured) {
            return res
              .status(200)
              .json(sendResponse('All Movies were found.', result.rowCount));
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

// API POST A MOVIE DATA
exports.postMovie = (req, res) => {
  try {
    const { name, description, featured } = req.body;
    const created_at = new Date();

    const image = req.file;
    let imagePath;

    if (image) {
      imagePath = filePath(req, 'images', image.filename);
    } else {
      imagePath = null;
    }

    client.query(
      `INSERT INTO movies (name, description, created_at, images, featured) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, created_at, imagePath, featured],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: 'The movie was not created.',
          });
        } else {
          const {
            rows: [movie],
          } = result;

          return res.status(200).json({
            success: true,
            message: 'Created the movie successfully.',
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

// API SEARCH CATEGORIES DATA BY KEYWORDS
exports.searchCategories = async (req, res) => {
  try {
    const { id, keyword, orderBy, order, currentPage, perPage } = req.query;

    const sql = `SELECT *
      FROM categories ${keyword || id ? 'WHERE' : ''} ${
      keyword ? "LOWER(title) LIKE '%" + keyword.toLowerCase() + "%'" : ''
    } ${id ? `${keyword ? 'AND ' : ''} id = ${id}` : ''}`;

    const totalData = await client.query(sql);

    client.query(
      `${sql} ORDER BY ${orderBy || 'title'} ${order || 'ASC'} LIMIT ${
        +perPage || 10
      } OFFSET ${((+currentPage || 1) - 1) * (perPage || 10)}`,
      (error, result) => {
        if (result.rows.length === 0) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: 'There is no category found.',
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

          if (keyword) {
            return res
              .status(200)
              .json(sendResponse('Category was found', resp));
          }
          if (id && !keyword) {
            return res
              .status(200)
              .json(
                sendResponse(
                  'Category was found with this id.',
                  result.rowCount
                )
              );
          }
          if (!id && !keyword) {
            return res
              .status(200)
              .json(
                sendResponse('All Categories were found.', result.rowCount)
              );
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

// API POST A CATEGORY DATA
exports.postCategory = (req, res) => {
  try {
    const { title } = req.body;

    const created_at = new Date();

    client.query(
      `INSERT INTO categories (title, created_at) VALUES ($1, $2) RETURNING *`,
      [title, created_at],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            error: 'The category was not created.',
          });
        } else {
          const {
            rows: [category],
          } = result;

          return res.status(200).json({
            success: true,
            message: 'Created the category successfully.',
            data: category,
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

// API GET ALL CATEGORIES OF A MOVIE DATA
exports.getAllCategoriessOfMovie = (req, res) => {
  try {
    client.query(
      `SELECT * FROM movie_categories JOIN categories ON movie_categories.category_id = categories.id WHERE movie_categories.movie_id = ${req.params.id}`,
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

// POST MOVIE CATEGORY
exports.postMovieCategories = async (req, res) => {
  try {
    const { movie_id, category_id } = req.body;

    const created_at = new Date();

    const totalMovieCategories = await client.query(
      `SELECT * FROM movie_categories JOIN categories ON movie_categories.category_id = categories.id WHERE movie_categories.movie_id = ${movie_id}`
    );

    if (totalMovieCategories.rows.length === 3) {
      return res.status(400).json({
        success: false,
        error: 'You are only allowed to input 3 categories of a movie.',
      });
    } else {
      let error;

      for (let i = 0; i < totalMovieCategories.rows.length; i++) {
        if (category_id === totalMovieCategories.rows[i].category_id) {
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
          `INSERT INTO movie_categories (movie_id, category_id, created_at) VALUES ($1, $2, $3) RETURNING *`,
          [movie_id, category_id, created_at],
          (error, result) => {
            if (error) {
              console.log(error);
              return res.status(400).json({
                success: false,
                error: 'The data was not created.',
              });
            }
            const {
              rows: [movieCategories],
            } = result;

            return res.status(200).json({
              success: true,
              message: 'Created the data successfully.',
              data: movieCategories,
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
