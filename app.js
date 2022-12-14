'use strict';

// IMPORT ALL PACKAGES
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const client = require('./connection');

// CORS CONFIG START //
app.use(cors());
app.options('*', cors());
// CORS CONFIG END //

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
app.use('/public/images', express.static(__dirname + '/public/images'));

// IINTEGRATE FROM routes FOLDER
const castCharactersRoutes = require('./routes/cast-characters');
const categoriesRoutes = require('./routes/categories');
const imagesRoutes = require('./routes/images');
const moviesRoutes = require('./routes/movies');

// INTEGRATE FROM FILE .env
const api = process.env.API_URL;

// ROUTERS
app.use(`${api}/casts-characters`, castCharactersRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/images`, imagesRoutes);
app.use(`${api}/movies`, moviesRoutes);

// RUN SERVER AT PORT 3000
const PORT = process.env.PORT || 3300;

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

// CONNECT TO POSTGRESQL DATABASE
client.connect(error => {
  if (error) {
    console.log(error);
  } else {
    console.log('Database Connected');
  }
});
