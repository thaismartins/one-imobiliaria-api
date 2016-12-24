'use strict';
var User, config, jwt;

jwt = require('jsonwebtoken');

config = require('../config');

User = require('../models/User');

module.exports = {
  isAuthenticated: function(req, res, next) {
    var token;
    token = req.headers['x-access-token'];
    if (token) {
      return jwt.verify(token, config.jwt.secret, function(err, decoded) {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Failed to authenticate token.',
            error: err
          });
        } else {
          return User.findOne({
            email: decoded.email
          }, '-password').populate('group').populate('companies').populate('coupons').exec(function(err, userFound) {
            if (err || (userFound == null)) {
              return res.status(403).json({
                success: false,
                message: 'Failed to authenticate token.',
                error: err
              });
            } else {
              req.user = userFound;
              return next();
            }
          });
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  }
};
