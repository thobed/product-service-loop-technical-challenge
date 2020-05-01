// Load external modules
const express = require('express');
const basicAuth = require('express-basic-auth')
const compression = require('compression');
const bodyParser = require('body-parser');
const config = require('./config/config.js');
const logger = require('./logger.js');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const swaggerDocument = require('./swagger.json');

// Start express service
const app = express();
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

app.use(compression({ filter: shouldCompress }));
app.use(bodyParser.json());
app.use(cors());

var whitelist = ['http://localhost:3000/']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.options(corsOptions, cors());


const port = process.env.PORT || config.application.port;
app.listen(port);
logger.log('info', 'Express server listening on port %d', port);

// Connect router
const router = express.Router();

// Connect swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// check user authorization
app.use(basicAuth({
  users: config.users
}))

app.use(config.application.endpointPrefix, router);
require('./server/routes/')(router);



module.exports = app;
