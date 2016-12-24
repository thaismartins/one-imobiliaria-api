'use strict';
var winston;

winston = require('winston');

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console(), new winston.transports.File({
      filename: 'contact-error.log'
    })
  ]
});
