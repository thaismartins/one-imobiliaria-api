'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema
config = require '../config'

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
    cep: type: String, required: true
    lat: type: String
    lng: type: String
  floor: type: String
  vacancy: type: Number
  meters: type: Number
  hasSubway: type: Boolean
  subwayStation: type: String
  value: type: Number
  condominium: type: Number
  iptu: type: Number
  location: type: Number
  payments: [type: String, enum: ['financing', 'money', 'others']]
  exchange: type: Number
  settled: type: Boolean
  difference: type: Number
  car: type: Boolean
  carValue: type: Number
  interest:
    type: [type: String, enum: ['house', 'apartment', 'car', 'others']],
    meters:
      min: type: Number
      max: type: Number
    vacancy:
      min: type: Number
      max: type: Number
    floor:
      min: type: Number
      max: type: Number
    value:
      min: type: Number
      max: type: Number
    address:
      street: type: String
      number: type: String
      complement: type: String
      neighborhood: type: String
      city: type: String
      state: type: String
      cep: type: String
    hasSubway: type: Boolean
    subwayStation: type: String
    radius: type: Number
    condominium: type: Number
    iptu: type: Number
    location: type: Number
    payments: [type: String, enum: ['financing', 'money', 'others']]
  created: type: Date
  updated: type: Date, default: Date.now

PropertySchema.methods.withoutId = () ->
  obj = this.toObject()
  delete obj._id
  return obj

PropertySchema.methods.fullAddress = () ->
  obj = this.toObject()
  address = obj.address.street + ', '
  address += obj.address.number + ' - '
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

module.exports = mongoose.model 'Property', PropertySchema