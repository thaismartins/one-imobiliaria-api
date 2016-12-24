'use strict';
var Group, Schema, UserSchema, bcrypt, config, generatePassword, jwt, mongoose, salt, setGroupDefault;

mongoose = require('mongoose');

Schema = mongoose.Schema;

jwt = require('jsonwebtoken');

bcrypt = require('bcrypt');

config = require('../config');

salt = bcrypt.genSaltSync(10);

Group = require('./UserGroup');

generatePassword = function(password) {
  return bcrypt.hashSync(password, salt);
};

setGroupDefault = function(obj, type, callback) {
  return Group.findOne({
    'type': type
  }, function(err, groupFound) {
    if (groupFound) {
      obj.group = groupFound._id;
      return callback();
    }
  });
};

UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'UserGroup',
    required: true
  },
  token: {
    type: String
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: true,
    set: generatePassword
  },
  remember: {
    code: {
      type: String
    },
    expiresIn: {
      type: Date,
      "default": Date.now
    }
  },
  created: {
    type: Date
  },
  updated: {
    type: Date,
    "default": Date.now
  }
});

UserSchema.pre('validate', function(next) {
  if (this.group == null) {
    return setGroupDefault(this, 'admin', next);
  } else {
    return next();
  }
});

UserSchema.methods.withoutId = function() {
  var obj;
  obj = this.toObject();
  delete obj._id;
  return obj;
};

UserSchema.methods.withoutPassword = function() {
  var obj;
  obj = this.toObject();
  delete obj.password;
  delete obj.remember;
  return obj;
};

UserSchema.methods.forUpdate = function() {
  var item, obj, value;
  obj = this.toObject();
  for (item in obj) {
    value = obj[item];
    if (value === '' || value.length === 0) {
      delete obj[item];
    }
  }
  delete obj._id;
  return obj;
};

UserSchema.methods.comparePassword = function(password) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateToken = function() {
  if (!this.password) {
    return false;
  }
  return jwt.sign({
    'code': this._id,
    'user': this.user,
    'email': this.email,
    'name': this.name
  }, config.jwt.secret, {
    expiresIn: config.jwt.expires
  });
};

module.exports = mongoose.model('User', UserSchema);
