'use strict';
var ClientSchema, Schema, config, mongoose;

mongoose = require('mongoose');

Schema = mongoose.Schema;

config = require('../config');

ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phones: {
    cell: {
      type: String,
      required: true
    },
    home: {
      type: String
    },
    commercial: {
      type: String
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

ClientSchema.methods.withoutId = function() {
  var obj;
  obj = this.toObject();
  delete obj._id;
  return obj;
};

ClientSchema.methods.forUpdate = function() {
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

ClientSchema.methods.validateFields = function() {
  var errors, obj;
  obj = this.toObject();
  errors = [];
  if ((this.email == null) || typeof this.email !== 'string') {
    errors.push('Email');
  }
  if ((this.tynamepe == null) || typeof this.name !== 'string') {
    errors.push('Name');
  }
  if ((this.phones.cell == null) || typeof this.phones.cell !== 'string') {
    errors.push('Cellphone');
  }
  return errors;
};

module.exports = mongoose.model('Client', ClientSchema);
