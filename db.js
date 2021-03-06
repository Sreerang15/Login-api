const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

var con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
  });
  
module.exports = con