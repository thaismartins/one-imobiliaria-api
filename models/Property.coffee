'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema
config = require '../config'

setValue = (value) ->
  newValue = value.toString().replace(/[^0-9]+/g, "")
  finalValue = newValue.toString().slice(0, -2) + '.' + newValue.toString().slice(-2)
  return '' if finalValue == '.'
  return Number(finalValue)

setOnlyNumbers = (value) ->
  return Number(value.toString().replace(/[^0-9]+/g, ""))

setCEP = (value) ->
  newValue = value.toString().replace(/[^0-9]+/g, "")
  return '' if newValue == ''
  return newValue.toString().slice(0, -3) + '-' + newValue.toString().slice(-3)

PropertySchema = new Schema
  type: type: String, required: true
  code: type: String, required: true
  client: type: Schema.Types.ObjectId, ref: 'Client', required: true
  address:
    street: type: String, required: true
    number: type: String, required: true
    complement: type: String
    neighborhood: type: String, required: true
    city: type: String, required: true
    state: type: String, required: true
    cep: type: String, required: true, set: setCEP
    lat: type: String
    lng: type: String
  floor: type: Number, set: setOnlyNumbers
  vacancy: type: Number, set: setOnlyNumbers
  meters: type: Number, set: setOnlyNumbers
  hasSubway: type: Boolean
  subwayStation: type: String
  value: type: Number, set: setValue
  condominium: type: Number, set: setValue
  iptu: type: Number, set: setValue
  location: type: Number, set: setValue
  payments: [type: String, enum: ['financing', 'money', 'others']]
  exchange: type: Number
  settled: type: Boolean
  difference: type: Number
  car: type: Boolean
  carValue: type: Number
  interest:
    types: [type: String, enum: ['house', 'apartment', 'car', 'others']],
    meters:
      min: type: Number, set: setOnlyNumbers
      max: type: Number, set: setOnlyNumbers
    vacancy:
      min: type: Number, set: setOnlyNumbers
      max: type: Number, set: setOnlyNumbers
    floor:
      min: type: Number, set: setOnlyNumbers
      max: type: Number, set: setOnlyNumbers
    address:
      street: type: String
      number: type: String
      complement: type: String
      neighborhood: type: String
      city: type: String
      state: type: String
      cep: type: String, set: setCEP
    value:
      min: type: Number, set: setValue
      max: type: Number, set: setValue
    condominium:
      min: type: Number, set: setValue
      max: type: Number, set: setValue
    iptu:
      min: type: Number, set: setValue
      max: type: Number, set: setValue
    location:
      min: type: Number, set: setValue
      max: type: Number, set: setValue
    hasSubway: type: Boolean
    subwayStation: type: String
    radius: type: Number
    payments: [type: String, enum: ['financing', 'money', 'others']]
    settled: type: Boolean
  created: type: Date
  updated: type: Date, default: Date.now

PropertySchema.methods.withoutId = () ->
  obj = this.toObject()
  delete obj._id
  return obj

PropertySchema.methods.fullAddress = () ->
  obj = this.toObject()
  address = obj.address.street + ', '
  address += obj.address.number + ' setValue- '
  address += obj.address.neighborhood + ', '
  address += obj.address.city + ' - '
  address += obj.address.state + ', '
  address += obj.address.cep + ', Brazil'
  return address

PropertySchema.methods.forUpdate = () ->
  obj = this.toObject()
  for item, value of obj
      delete obj[item] if value == '' or value.length == 0
  delete obj._id
  return obj


PropertySchema.methods.validateFields = () ->
  obj = this.toObject()
  errors = []

  errors.push('Code') if not this.code? or typeof this.code isnt 'string'
  errors.push('Type') if not this.type? or typeof this.type isnt 'string'
  errors.push('Street') if not this.address.street? or typeof this.address.street isnt 'string'
  errors.push('Number') if not this.address.number? or typeof this.address.number isnt 'string'
  errors.push('Neighborhood') if not this.address.neighborhood? or typeof this.address.neighborhood isnt 'string'
  errors.push('City') if not this.address.city? or typeof this.address.city isnt 'string'
  errors.push('State') if not this.address.state? or typeof this.address.state isnt 'string'
  errors.push('CEP') if not this.address.cep? or this.address.cep == ''
  errors.push('Value') if not this.value? or this.value == ''

  return errors



module.exports = mongoose.model 'Property', PropertySchema