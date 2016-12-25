express = require 'express'
router = express.Router()
auth = require '../services/auth'
utils = require '../services/utils'
City = require '../models/City'

# GET ALL CITIES
router.get '/', auth.isAuthenticated, (req, res) ->
  City.find (err, citiesFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(citiesFound)

# GET ALL STATES
router.get '/states', auth.isAuthenticated, (req, res) ->
  City.distinct 'state', (err, citiesFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(citiesFound)

# GET ALL STATES
router.get '/states/:state', auth.isAuthenticated, (req, res) ->
  City.find({state: req.params.state}) (err, citiesFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(citiesFound)

# SEARCH SPECIFIC CITY
router.get '/search', (req, res) ->

  search = {}
  search.name = { $regex: utils.regexStringAccents(req.query.name) + '|' + req.query.name, $options: 'i' } if req.query.name?
  search.state = req.query.state if req.query.state?
  limit = if req.query.limit? then req.query.limit else 5

  City.find(search).limit(limit).sort('name').exec (err, citiesFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(citiesFound)

# GET SPECIFIC CITY
router.get '/:id', auth.isAuthenticated, (req, res) ->
  City.findOne {'_id': req.params.id}, (err, cityFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(cityFound) if cityFound
    res.with(res.type.itemNotFound)


module.exports = router