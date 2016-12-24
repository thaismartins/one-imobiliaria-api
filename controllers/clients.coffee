express = require 'express'
router = express.Router()
auth = require '../services/auth'
Client = require '../models/Client'
config = require '../config'

# GET ALL CLIENTS
router.get '/', auth.isAuthenticated, (req, res) ->
  Client.find  (err, clientsFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(clientsFound)

# GET SPECIFIC CLIENT
router.get '/:id', auth.isAuthenticated, (req, res) ->
  Client.findOne {'_id': req.params.id}, (err, clientFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(clientFound) if clientFound
    res.with(res.type.itemNotFound)

# ADD NEW CLIENT
router.post '/', auth.isAuthenticated, (req, res) ->
  Client.findOne {email: req.body.email}, (err, clientFound) ->
    return res.with(res.type.itemExists) if clientFound

    client = new Client(req.body)
    client.created = new Date()
    client.save (err, clientSaved) ->
      return res.with(res.type.dbError, err) if err
      res.with(clientSaved)

# UPDATE EXISTENT CLIENT
router.put '/:id', auth.isAuthenticated, (req, res) ->
  Client.findOne {_id: req.params.id}, (err, clientFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(res.type.itemNotFound) unless clientFound?

    client = new Client(req.body)
    Client.findOneAndUpdate({_id: req.params.id}, {$set: client.forUpdate()}, {new: true}).populate('group').exec (err, clientUpdated) ->
      return res.with(res.type.dbError, err) if err
      res.with(clientUpdated)

# DELETE CLIENT
router.delete '/:id', auth.isAuthenticated, (req, res) ->
  Client.findOneAndRemove {'_id': req.params.id}, (err) ->
    return res.with(res.type.dbError, err) if err
    res.with(res.type.deleteSuccess)

module.exports = router