'use strict'

socket = require 'socket.io'
auth = require '../services/auth'
Message = require '../models/Message'

online = []
module.exports.listen = (app) ->

  io = socket.listen(app)

  io.on 'connection', (peer) ->
    room = null
    peer.on 'openchat', (data) ->
      if data.code?
        peer.join data.code
        room = data.code
        online.push(room);
        io.sockets.emit 'userconnected',
          client: data.code
          online: online

    peer.on 'message', (data) ->
      return false if not data.to? or not data.from? or not data.message?
      message = new Message(data);
      message.save (err, messageSaved) ->
        if err
          peer.emit 'error',
            message: 'message not sent',
            type: 'error'
        else
          peer.join data.to if data.to in peer.rooms
          io.to(data.to).emit 'message', messageSaved

    peer.on 'visualized', (data) ->
      return false if not data._id?
      Message.findOneAndUpdate {'_id': data._id}, {$set: {'visualized': true}}, (err) ->
        if err
          peer.emit 'error',
            message: 'message not mark as visualized',
            type: 'error'
        else
          return true

    peer.on 'disconnect', () ->
      online.splice(online.indexOf(room), 1);
      io.sockets.emit 'userdisconnected',
        user: room