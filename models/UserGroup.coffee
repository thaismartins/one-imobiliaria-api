'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema
utils = require '../services/utils'

generateType = (name) ->
  this.type = utils.createSlug(name)
  name

UserGroupSchema   = new Schema
  title: type: String, required: true, set: generateType
  type: type: String, required: true, unique: true
  created: type: Date, default: Date.now

module.exports = mongoose.model 'UserGroup', UserGroupSchema