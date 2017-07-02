'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema
config = require '../config'

setOnlyNumbers = (value) ->
  return Number(value.toString().replace(/[^0-9]+/g, ""))

ClientSchema = new Schema
  name: type: String, required: true
  email: type: String, unique: true, required: true
  phones:
    cell: type: String, required: true, set: setOnlyNumbers
    home: type: String, set: setOnlyNumbers
    commercial: type: String, set: setOnlyNumbers
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

  errors.push('Email') if not this.validateEmail() or typeof this.email isnt 'string'
  errors.push('Nome') if not this.name? or this.name == '' or typeof this.name isnt 'string'
  errors.push('Celular') if not this.phones.cell? or this.phones.cell == '' or typeof this.phones.cell isnt 'string'

  return errors

ClientSchema.methods.validateEmail = () ->
  re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  re.test(this.email)

module.exports = mongoose.model 'Client', ClientSchema