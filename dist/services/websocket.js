'use strict';
var Message, auth, online, socket,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

socket = require('socket.io');

auth = require('../services/auth');

Message = require('../models/Message');

online = [];

module.exports.listen = function(app) {
  var io;
  io = socket.listen(app);
  return io.on('connection', function(peer) {
    var room;
    room = null;
    peer.on('openchat', function(data) {
      if (data.code != null) {
        peer.join(data.code);
        room = data.code;
        online.push(room);
        return io.sockets.emit('userconnected', {
          client: data.code,
          online: online
        });
      }
    });
    peer.on('message', function(data) {
      var message;
      if ((data.to == null) || (data.from == null) || (data.message == null)) {
        return false;
      }
      message = new Message(data);
      return message.save(function(err, messageSaved) {
        var ref;
        if (err) {
          return peer.emit('error', {
            message: 'message not sent',
            type: 'error'
          });
        } else {
          if (ref = data.to, indexOf.call(peer.rooms, ref) >= 0) {
            peer.join(data.to);
          }
          return io.to(data.to).emit('message', messageSaved);
        }
      });
    });
    peer.on('visualized', function(data) {
      if (data._id == null) {
        return false;
      }
      return Message.findOneAndUpdate({
        '_id': data._id
      }, {
        $set: {
          'visualized': true
        }
      }, function(err) {
        if (err) {
          return peer.emit('error', {
            message: 'message not mark as visualized',
            type: 'error'
          });
        } else {
          return true;
        }
      });
    });
    return peer.on('disconnect', function() {
      online.splice(online.indexOf(room), 1);
      return io.sockets.emit('userdisconnected', {
        user: room
      });
    });
  });
};
