express = require 'express'
router = express.Router()
auth = require '../services/auth'
Notification = require '../models/Notification'

# GET ALL NOTIFICATIONS
router.get '/', auth.isAuthenticated, (req, res) ->
  Notification.find().populate('property').populate('interest').exec (err, notificationsFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(notificationsFound)

# GET ALL NOTIFICATIONS OF PROPERTIES
router.get '/property/:propertyId/interest/:interestId', auth.isAuthenticated, (req, res) ->
  Notification.find({property: req.params.propertyId, interest: req.params.interestId}).sort({created: 'desc'}).exec (err, notificationsFound) ->
    return res.with(res.type.dbError, err) if err

    for notification in notificationsFound
      notification.seen = true
      notification.save()

    res.with(notificationsFound)

# GET SPECIFIC NOTIFICATION
router.get '/user/:userId', auth.isAuthenticated, (req, res) ->

  query = {}
  query.broker = req.params.userId
  query.seen = false if req.query.seen?

  Notification.find(query).populate('property').populate('interest').exec (err, notificationsFound) ->
    return res.with(res.type.dbError, err) if err

    notifications = []
    messages = []
    notificationsObj = []

    if notificationsFound
      for notification in notificationsFound
        if not messages[notification.property._id]?
          messages[notification.property._id] = []
          notifications[notification.property._id] = []

        if not messages[notification.property._id][notification.interest._id]?
          messages[notification.property._id][notification.interest._id] = []
          notifications[notification.property._id][notification.interest._id] = {
            property: notification.property
            interest: notification.interest
          }

        messages[notification.property._id][notification.interest._id].push {
          message: notification.message
          created: notification.created
        }

      for idProperty, notification of notifications
        for idInterest, notificationObj of notification
          notificationObj.messages = messages[idProperty][idInterest]
          notificationsObj.push notificationObj

    res.with(notificationsObj)

# GET SPECIFIC NOTIFICATION
router.get '/:id', auth.isAuthenticated, (req, res) ->
  Notification.findOne({'_id': req.params.id}).populate('property').populate('interest').exec (err, notificationFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(notificationFound) if notificationFound
    res.with(res.type.itemNotFound)

# ADD NEW NOTIFICATION
router.post '/', auth.isAuthenticated, (req, res) ->
  notification = new Notification(req.body)
  notification.broker = req.user._id

  notification.save (err, notificationSaved) ->
    return res.with(res.type.dbError, err) if err
    res.with(notificationSaved)

# DELETE NOTIFICATION
router.delete '/:id', auth.isAuthenticated, (req, res) ->
  Notification.findOneAndRemove {'_id': req.params.id}, (err) ->
    return res.with(res.type.dbError, err) if err
    res.with(res.type.deleteSuccess)

module.exports = router