const winston = require('winston');
const config = require('./config/config.js');

// Set up logger
const customColors = {
  trace: 'white',
  debug: 'green',
  info: 'green',
  warn: 'yellow',
  critical: 'red',
  fatal: 'red',
};

const logger = new (winston.Logger)({
  colors: customColors,
  levels: {
    fatal: 0,
    critical: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 0,
  },
  transports: [
    new (winston.transports.Console)({
      level: config.application.logLevel,
      colorize: true,
      timestamp: true,
    }),
  // new (winston.transports.File)({ filename: 'somefile.log' })
  ],
});

winston.addColors(customColors);

module.exports = logger;
