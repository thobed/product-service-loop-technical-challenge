// Load external modules
const config = require('../../config/config.js');
const path = require('path');

const camelizeColumns = (data) => {
  const template = data[0];
  for (const prop in template) { // eslint-disable-line no-restricted-syntax guard-for-in
    const camel = pgp.utils.camelize(prop);
    if (!(camel in template)) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        d[camel] = d[prop];
        delete d[prop];
      }
    }
  }
};

const initOptions = {
  noLocking: true,
  receive: (data, result, e) => {
    camelizeColumns(data);
  },
};

const pgp = require('pg-promise')(initOptions);

// Configure and initialize database connection
const cn = {};
cn.host = config.postgres.host;
cn.port = config.postgres.port;
cn.database = config.postgres.database;
cn.user = config.postgres.user;
cn.password = config.postgres.password;
if (config.postgres.host !== 'localhost') {
  cn.ssl = true;
}
const db = pgp(cn);


// Define options for queryfile (schema)
const options = {
  minify: true,
  params: {
    schema: config.postgres.schema,
  },
};
console.log(`DB SCHEMA: ${JSON.stringify(options)}`);

// Function that retrieves queryfile from ./sql
function fetchQueryfile(filename) {
  const fullpath = path.join(__dirname, 'sql', filename);
  return new pgp.QueryFile(fullpath, options);
}

// Function that returns the database connection
function getConnection() {
  return db;
}

// Export database properties and helper functions for other modules
module.exports = {
  fetchQueryfile,
  getConnection,
  db,
};
