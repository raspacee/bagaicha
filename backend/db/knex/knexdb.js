const knex = require("knex");
const knexfile = require("./knexfile");

let db;

if (process.env.NODE_ENV == "development") {
  db = knex(knexfile.development);
} else {
  db = knex(knexfile.production);
}

module.exports = db;
