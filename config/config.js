const secrets = require('./secrets.js');
const config = {};
config.postgres = {};
config.application = {};
config.postgrestest = {};
config.users = secrets.users;
config.basepath = `https://${secrets.url.key}:${secrets.url.password}@universe-of-birds.myshopify.com/admin/api/2020-04/`

// Local Configuration for Postgres
config.postgres.host = process.env.postgresHost || 'localhost';
config.postgres.port = process.env.postgresPort || '5432';
config.postgres.database = process.env.postgresDatabase || 'postgres';
config.postgres.user = process.env.postgresUser || process.env.USER;
config.postgres.password = process.env.postgresPassword || 'password';
config.postgres.schema = process.env.postgresSchema || 'loop_dev';

// Application Default Configuration
config.application.endpointPrefix = '/api/v1';
config.application.port = process.env.VCAP_APP_PORT || '5000';
config.application.logLevel = 'info';

module.exports = config;
