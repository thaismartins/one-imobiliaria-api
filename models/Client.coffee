'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema
config = require '../config'

ClientSchema = new Schema
  name: type: String, required: true
  email: type: String, unique: true, required: true
  phones:
    cell: type: String, required: true
    home: type: String
    commercial: type: String
  created: type: Date
  updated: type: Date, default: Date.now

ClientSchema.methods.withoutId = () ->
  obj = this.toObject()
  delete obj._id
  return obj

ClientSchema.methods.forUpdate = () ->
  obj = this.toObject()
  for item, value of obj
      delete obj[item] if value == '' or value.length == 0
  delete obj._id
  return obj

ClientSchema.methods.validateFields = () ->
  obj = this.toObject()
  errors = []

  errors.push('Email') if not this.email? or typeof this.email isnt 'string'
  errors.push('Name') if not this.tynamepe? or typeof this.name isnt 'string'
  errors.push('Cellphone') if not this.phones.cell? or typeof this.phones.cell isnt 'string'

  return errors

module.exports = mongoose.model 'Client', ClientSchema