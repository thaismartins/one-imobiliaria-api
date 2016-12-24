'use strict'

jwt = require 'jsonwebtoken'
config = require '../config'
User = require '../models/User'

module.exports =
  isAuthenticated: (req, res, next) ->

    token = req.headers['x-access-token']

    if token
      jwt.verify token, config.jwt.secret, (err, decoded) ->
        if err
          return res.status(403).json
            success: false,
            message: 'Failed to authenticate token.',
            error : err
        else
          User.findOne({email: decoded.email}, '-password').populate('group').populate('companies').populate('coupons').exec (err, userFound) ->
            if err || not userFound?
              return res.status(403).json
                success: false,
                message: 'Failed to authenticate token.',
                error : err
            else
                req.user = userFound
                next()
    else
      return res.status(403).send
        success: false,
        message: 'No token provided.'