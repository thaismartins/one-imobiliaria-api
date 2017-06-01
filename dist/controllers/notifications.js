var Notification, auth, express, router;

express = require('express');

router = express.Router();

auth = require('../services/auth');

Notification = require('../models/Notification');

router.get('/', auth.isAuthenticated, function(req, res) {
  return Notification.find().populate('property').populate('interest').exec(function(err, notificationsFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](notificationsFound);
  });
});

router.get('/property/:propertyId/interest/:interestId', auth.isAuthenticated, function(req, res) {
  return Notification.find({
    property: req.params.propertyId,
    interest: req.params.interestId
  }).sort({
    created: 'desc'
  }).exec(function(err, notificationsFound) {
    var i, len, notification;
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    for (i = 0, len = notificationsFound.length; i < len; i++) {
      notification = notificationsFound[i];
      notification.seen = true;
      notification.save();
    }
    return res["with"](notificationsFound);
  });
});

router.get('/user/:userId', auth.isAuthenticated, function(req, res) {
  var query;
  query = {};
  query.broker = req.params.userId;
  if (req.query.seen != null) {
    query.seen = false;
  }
  return Notification.find(query).populate('property').populate('interest').exec(function(err, notificationsFound) {
    var i, idInterest, idProperty, len, messages, notification, notificationObj, notifications, notificationsObj;
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    notifications = [];
    messages = [];
    notificationsObj = [];
    if (notificationsFound) {
      for (i = 0, len = notificationsFound.length; i < len; i++) {
        notification = notificationsFound[i];
        if (messages[notification.property._id] == null) {
          messages[notification.property._id] = [];
          notifications[notification.property._id] = [];
        }
        if (messages[notification.property._id][notification.interest._id] == null) {
          messages[notification.property._id][notification.interest._id] = [];
          notifications[notification.property._id][notification.interest._id] = {
            property: notification.property,
            interest: notification.interest
          };
        }
        messages[notification.property._id][notification.interest._id].push({
          message: notification.message,
          created: notification.created
        });
      }
      for (idProperty in notifications) {
        notification = notifications[idProperty];
        for (idInterest in notification) {
          notificationObj = notification[idInterest];
          notificationObj.messages = messages[idProperty][idInterest];
          notificationsObj.push(notificationObj);
        }
      }
    }
    return res["with"](notificationsObj);
  });
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
  return Notification.findOne({
    '_id': req.params.id
  }).populate('property').populate('interest').exec(function(err, notificationFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (notificationFound) {
      return res["with"](notificationFound);
    }
    return res["with"](res.type.itemNotFound);
  });
});

router.post('/', auth.isAuthenticated, function(req, res) {
  var notification;
  notification = new Notification(req.body);
  notification.broker = req.user._id;
  return notification.save(function(err, notificationSaved) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](notificationSaved);
  });
});

router["delete"]('/:id', auth.isAuthenticated, function(req, res) {
  return Notification.findOneAndRemove({
    '_id': req.params.id
  }, function(err) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](res.type.deleteSuccess);
  });
});

module.exports = router;
