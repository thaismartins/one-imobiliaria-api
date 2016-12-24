'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema
jwt = require 'jsonwebtoken'
bcrypt = require 'bcrypt'
config = require '../config'
salt = bcrypt.genSaltSync(10)
Group = require './UserGroup'


generatePassword = (password) ->
  bcrypt.hashSync(password, salt)

setGroupDefault = (obj, type, callback) ->
  Group.findOne {'type': type}, (err, groupFound) ->
    if(groupFound)
      obj.group = groupFound._id
      callback()

UserSchema = new Schema
  name: type: String, required: true
  email: type: String, unique: true, required: true
  username: type: String
  group: type: Schema.Types.ObjectId, ref: 'UserGroup', required: true
  token: type: String
  photo: type: String
  password: type: String, required: true, set: generatePassword
  remember:
    code: type: String
    expiresIn: type: Date, default: Date.now
  created: type: Date
  updated: type: Date, default: Date.now

UserSchema.pre 'validate', (next) ->
  if not this.group? then setGroupDefault(this, 'admin', next)
  else next()

UserSchema.methods.withoutId = () ->
  obj = this.toObject()
  delete obj._id
  return obj

UserSchema.methods.withoutPassword = () ->
  obj = this.toObject()
  delete obj.password
  delete obj.remember
  return obj

UserSchema.methods.forUpdate = () ->
  obj = this.toObject()
  for item, value of obj
      delete obj[item] if value == '' or value.length == 0
  delete obj._id
  return obj

UserSchema.methods.comparePassword = (password) ->
  return false unless this.password
  bcrypt.compareSync(password, this.password)

UserSchema.methods.generateToken = () ->
  return false unless this.password
  jwt.sign(
    {'code': this._id, 'user': this.user, 'email': this.email, 'name': this.name},
    config.jwt.secret,
    {expiresIn: config.jwt.expires})

module.exports = mongoose.model 'User', UserSchema