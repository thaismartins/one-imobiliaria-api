'use strict'

mongoose = require 'mongoose'
Schema = mongoose.Schema

NotificationSchema = new Schema
  broker: type: String, required: true
  property: type: Schema.Types.ObjectId, ref: 'Property', required: true
  interest: type: Schema.Types.ObjectId, ref: 'Property', required: true
  message: type: String, required: true
  seen: type: Boolean, default: false
  created: type: Date, default: Date.now

module.exports = mongoose.model 'Notification', NotificationSchema