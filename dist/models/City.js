'use strict';
var CitySchema, Schema, generateSlug, mongoose, utils;

mongoose = require('mongoose');

Schema = mongoose.Schema;

utils = require('../services/utils');

generateSlug = function(name) {
  this.slug = utils.createSlug(name);
  return name;
};

CitySchema = new Schema({
  name: {
    type: String,
    required: true,
    set: generateSlug
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  state: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    "default": Date.now
  }
});

CitySchema.methods.toObjWithoutId = function() {
  var obj;
  obj = this.toObject();
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('City', CitySchema);
