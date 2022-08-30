'use strict';

const { Client } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'Production';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const client = new Client({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: { rejectUnauthorized: false },
});

module.exports = client;
