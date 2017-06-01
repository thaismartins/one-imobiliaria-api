express = require 'express'
router = express.Router()
auth = require '../services/auth'
Property = require '../models/Property'
config = require '../config'
url = require('url')

# GET ALL PROPERTIES
router.get '/', auth.isAuthenticated, (req, res) ->

  reqQuery = url.parse(req.url, true).query
  reqQuery.property = JSON.parse reqQuery.property
  reqQuery.interest = JSON.parse reqQuery.interest

  property = new Property()
  propertyQuery = property.generatePropertyQuery(reqQuery)
  interestQuery = property.generateInterestQuery(reqQuery)

  propertyQuery = {} if Object.keys(propertyQuery.interest).length == 0 && propertyQuery.interest.constructor == Object
  interestQuery = {} if Object.keys(interestQuery.interest).length == 0 && interestQuery.interest.constructor == Object

  Property.find(propertyQuery).populate('client').exec (err, propertiesFound) ->
    return res.with(res.type.dbError, err) if err

    Property.find(interestQuery).populate('client').exec (err, propertiesInterestFound) ->
      return res.with(res.type.dbError, err) if err

      results = []
      for property in propertiesFound
        for propertyInterest in propertiesInterestFound
          if !property._id.equals(propertyInterest._id)
            results.push {
              property: property
              interest: propertyInterest
            }

      res.with(results)

module.exports = router