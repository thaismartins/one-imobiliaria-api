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
  value = setOnlyNumbers(value).toString()
  number = '00000000'
  number.substring(0, number.length - value.length) + value

setState = (value) ->
  return '' if value.length != 2
  value

PropertySchema = new Schema
  type: type: String, required: true, enum: ['house', 'apartment', 'car', 'land', 'others']
  code: type: String, required: true
  client: type: Schema.Types.ObjectId, ref: 'Client', required: true
  address:
    street: type: String, required: true
    number: type: String, required: true
    complement: type: String
    neighborhood: type: String, required: true
    city: type: String, required: true
    state: type: String, required: true, set: setState
    cep: type: String, required: true, set: setCEP
    lat: type: String, required: true
    lng: type: String, required: true
  floor: type: Number, set: setOnlyNumbers
  vacancy: type: Number, set: setOnlyNumbers
  meters: type: Number, set: setOnlyNumbers
  broker: type: String
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
    types: [type: String, enum: ['house', 'apartment', 'car', 'land', 'others']],
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
      state: type: String, set: setState
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
  address = obj.address.street + ', ' if obj.address.street?
  address += obj.address.number + ' - ' if obj.address.number? and  obj.address.number > 0
  address += obj.address.city + ' - ' if obj.address.city?
  address += obj.address.state + ', ' if obj.address.state?
  address += obj.address.cep + ', Brazil' if obj.address.cep?
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

  errors.push('Código') if not this.code? or typeof this.code isnt 'string'
  errors.push('Tipo de Imóvel') if not this.type? or typeof this.type isnt 'string'
  errors.push('Rua') if not this.address.street? or typeof this.address.street isnt 'string'
  errors.push('Número (Endereço)') if not this.address.number? or typeof this.address.number isnt 'string'
  errors.push('Bairro') if not this.address.neighborhood? or typeof this.address.neighborhood isnt 'string'
  errors.push('Cidade') if not this.address.city? or typeof this.address.city isnt 'string'
  errors.push('Estado') if not this.address.state? or typeof this.address.state isnt 'string'
  errors.push('CEP') if not this.address.cep? or this.address.cep == ''
  errors.push('Valor do Imóvel') if not this.value? or this.value == ''

  return errors


PropertySchema.methods.generatePropertyQuery = (reqQuery) ->

  newQuery = {}
  newQuery.interest = {}

  if reqQuery.property.type?
    newQuery.type = {$or: reqQuery.property.type}

  if reqQuery.property.meters?
    newQuery.meters = {$gte: reqQuery.property.meters.min, $lte: reqQuery.property.meters.max}

  if reqQuery.property.vacancy?
    newQuery.vacancy = {$gte: reqQuery.property.vacancy.min, $lte: reqQuery.property.vacancy.max}

  if reqQuery.property.floor?
    newQuery.floor = {$gte: reqQuery.property.floor.min, $lte: reqQuery.property.floor.max}

  if reqQuery.property.address?.street?
    newQuery.address.street = new RegExp('^' + reqQuery.property.address.street + '$', "i")

  if reqQuery.property.address?.number?
    newQuery.address.number = new RegExp('^' + reqQuery.property.address.number + '$', "i")

  if reqQuery.property.address?.neighborhood?
    newQuery.address.neighborhood = new RegExp('^' + reqQuery.property.address.neighborhood + '$', "i")

  if reqQuery.property.address?.city?
    newQuery.address.city = reqQuery.property.address.city

  if reqQuery.property.hasSubway?
    newQuery.hasSubway = reqQuery.property.hasSubway

  if reqQuery.property.subwayStation?
    newQuery.subwayStation = reqQuery.property.subwayStation

  if reqQuery.property.value?
    newQuery.value = {$gte: reqQuery.property.value.min, $lte: reqQuery.property.value.max}

  if reqQuery.property.condominium?
    newQuery.condominium = {$gte: reqQuery.property.condominium.min, $lte: reqQuery.property.condominium.max}

  if reqQuery.property.iptu?
    newQuery.iptu = {$gte: reqQuery.property.iptu.min, $lte: reqQuery.property.iptu.max}

  if reqQuery.property.location?
    newQuery.location = {$gte: reqQuery.property.location.min, $lte: reqQuery.property.location.max}

  if reqQuery.property.payments?
    newQuery.payments = {$in: reqQuery.property.payments}

  if reqQuery.property.exchange?
    newQuery.exchange = reqQuery.property.exchange

  if reqQuery.property.settled?
    newQuery.settled = reqQuery.property.settled

  if reqQuery.property.difference?
    newQuery.difference = reqQuery.property.difference

  if reqQuery.property.car?
    newQuery.car = reqQuery.property.car

  if reqQuery.property.carValue?
    newQuery.carValue = reqQuery.property.carValue

  # Building query for interest property
  if reqQuery.interest.type?
    newQuery.interest.type = {$or: reqQuery.interest.type}

  if reqQuery.interest.meters?
    newQuery.interest.meters = {$gte: reqQuery.interest.meters.min, $lte: reqQuery.interest.meters.max}

  if reqQuery.interest.vacancy?
    newQuery.interest.vacancy = {$gte: reqQuery.interest.vacancy.min, $lte: reqQuery.interest.vacancy.max}

  if reqQuery.interest.floor?
    newQuery.interest.floor = {$gte: reqQuery.interest.floor.min, $lte: reqQuery.interest.floor.max}

  if reqQuery.interest.address?.street?
    newQuery.interest.address.street = new RegExp('^' + reqQuery.interest.address.street + '$', "i")

  if reqQuery.interest.address?.number?
    newQuery.interest.address.number = new RegExp('^' + reqQuery.interest.address.number + '$', "i")

  if reqQuery.interest.address?.neighborhood?
    newQuery.interest.address.neighborhood = new RegExp('^' + reqQuery.interest.address.neighborhood + '$', "i")

  if reqQuery.interest.address?.city?
    newQuery.interest.address.city = reqQuery.interest.address.city

  if reqQuery.interest.hasSubway?
    newQuery.interest.hasSubway = reqQuery.interest.hasSubway

  if reqQuery.interest.subwayStation?
    newQuery.interest.subwayStation = reqQuery.interest.subwayStation

  if reqQuery.interest.value?
    newQuery.interest.value = {$gte: reqQuery.interest.value.min, $lte: reqQuery.interest.value.max}

  if reqQuery.interest.condominium?
    newQuery.interest.condominium = {$gte: reqQuery.interest.condominium.min, $lte: reqQuery.interest.condominium.max}

  if reqQuery.interest.iptu?
    newQuery.interest.iptu = {$gte: reqQuery.interest.iptu.min, $lte: reqQuery.interest.iptu.max}

  if reqQuery.interest.location?
    newQuery.interest.location = {$gte: reqQuery.interest.location.min, $lte: reqQuery.interest.location.max}

  if reqQuery.interest.payments?
    newQuery.interest.payments = {$in: reqQuery.interest.payments}

  if reqQuery.interest.exchange?
    newQuery.interest.exchange = reqQuery.interest.exchange

  if reqQuery.interest.settled?
    newQuery.interest.settled = reqQuery.interest.settled

  if reqQuery.interest.difference?
    newQuery.interest.difference = reqQuery.interest.difference

  if reqQuery.interest.car?
    newQuery.interest.car = reqQuery.interest.car

  if reqQuery.interest.carValue?
    newQuery.interest.carValue = reqQuery.interest.carValue

  return newQuery


PropertySchema.methods.generateInterestQuery = (reqQuery) ->

  newQuery = {}
  newQuery.interest = {}

  if reqQuery.property.type?
    newQuery.interest.type = {$or: reqQuery.property.type}

  if reqQuery.property.meters?
    newQuery.interest.meters = {$gte: reqQuery.property.meters.min, $lte: reqQuery.property.meters.max}

  if reqQuery.property.vacancy?
    newQuery.interest.vacancy = {$gte: reqQuery.property.vacancy.min, $lte: reqQuery.property.vacancy.max}

  if reqQuery.property.floor?
    newQuery.interest.floor = {$gte: reqQuery.property.floor.min, $lte: reqQuery.property.floor.max}

  if reqQuery.property.address?.street?
    newQuery.interest.address.street = new RegExp('^' + reqQuery.property.address.street + '$', "i")

  if reqQuery.property.address?.number?
    newQuery.interest.address.number = new RegExp('^' + reqQuery.property.address.number + '$', "i")

  if reqQuery.property.address?.neighborhood?
    newQuery.interest.address.neighborhood = new RegExp('^' + reqQuery.property.address.neighborhood + '$', "i")

  if reqQuery.property.address?.city?
    newQuery.interest.address.city = reqQuery.property.address.city

  if reqQuery.property.hasSubway?
    newQuery.interest.hasSubway = reqQuery.property.hasSubway

  if reqQuery.property.subwayStation?
    newQuery.interest.subwayStation = reqQuery.property.subwayStation

  if reqQuery.property.value?
    newQuery.interest.value = {$gte: reqQuery.property.value.min, $lte: reqQuery.property.value.max}

  if reqQuery.property.condominium?
    newQuery.interest.condominium = {$gte: reqQuery.property.condominium.min, $lte: reqQuery.property.condominium.max}

  if reqQuery.property.iptu?
    newQuery.interest.iptu = {$gte: reqQuery.property.iptu.min, $lte: reqQuery.property.iptu.max}

  if reqQuery.property.location?
    newQuery.interest.location = {$gte: reqQuery.property.location.min, $lte: reqQuery.property.location.max}

  if reqQuery.property.payments?
    newQuery.interest.payments = {$in: reqQuery.property.payments}

  if reqQuery.property.exchange?
    newQuery.interest.exchange = reqQuery.property.exchange

  if reqQuery.property.settled?
    newQuery.interest.settled = reqQuery.property.settled

  if reqQuery.property.difference?
    newQuery.interest.difference = reqQuery.property.difference

  if reqQuery.property.car?
    newQuery.interest.car = reqQuery.property.car

  if reqQuery.property.carValue?
    newQuery.interest.carValue = reqQuery.property.carValue

  # Building query for interest property
  if reqQuery.interest.type?
    newQuery.interest.type = {$or: reqQuery.interest.type}

  if reqQuery.interest.meters?
    newQuery.meters = {$gte: reqQuery.interest.meters.min, $lte: reqQuery.interest.meters.max}

  if reqQuery.interest.vacancy?
    newQuery.vacancy = {$gte: reqQuery.interest.vacancy.min, $lte: reqQuery.interest.vacancy.max}

  if reqQuery.interest.floor?
    newQuery.floor = {$gte: reqQuery.interest.floor.min, $lte: reqQuery.interest.floor.max}

  if reqQuery.interest.address?.street?
    newQuery.address.street = new RegExp('^' + reqQuery.interest.address.street + '$', "i")

  if reqQuery.interest.address?.number?
    newQuery.address.number = new RegExp('^' + reqQuery.interest.address.number + '$', "i")

  if reqQuery.interest.address?.neighborhood?
    newQuery.address.neighborhood = new RegExp('^' + reqQuery.interest.address.neighborhood + '$', "i")

  if reqQuery.interest.address?.city?
    newQuery.address.city = reqQuery.interest.address.city

  if reqQuery.interest.hasSubway?
    newQuery.hasSubway = reqQuery.interest.hasSubway

  if reqQuery.interest.subwayStation?
    newQuery.subwayStation = reqQuery.interest.subwayStation

  if reqQuery.interest.value?
    newQuery.value = {$gte: reqQuery.interest.value.min, $lte: reqQuery.interest.value.max}

  if reqQuery.interest.condominium?
    newQuery.condominium = {$gte: reqQuery.interest.condominium.min, $lte: reqQuery.interest.condominium.max}

  if reqQuery.interest.iptu?
    newQuery.iptu = {$gte: reqQuery.interest.iptu.min, $lte: reqQuery.interest.iptu.max}

  if reqQuery.interest.location?
    newQuery.location = {$gte: reqQuery.interest.location.min, $lte: reqQuery.interest.location.max}

  if reqQuery.interest.payments?
    newQuery.payments = {$in: reqQuery.interest.payments}

  if reqQuery.interest.exchange?
    newQuery.exchange = reqQuery.interest.exchange

  if reqQuery.interest.settled?
    newQuery.settled = reqQuery.interest.settled

  if reqQuery.interest.difference?
    newQuery.difference = reqQuery.interest.difference

  if reqQuery.interest.car?
    newQuery.car = reqQuery.interest.car

  if reqQuery.interest.carValue?
    newQuery.carValue = reqQuery.interest.carValue

  return newQuery


module.exports = mongoose.model 'Property', PropertySchema