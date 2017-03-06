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

#  console.log(propertyQuery);
#  console.log(interestQuery);

  Property.find propertyQuery, (err, propertiesFound) ->
    return res.with(res.type.dbError, err) if err

    Property.find interestQuery, (err, propertiesInterestFound) ->
      return res.with(res.type.dbError, err) if err

      results = []
      for property in propertiesFound
        for propertyInterest in propertiesInterestFound
          result.push {
            property: property
            interest: propertyInterest
          }

      res.with(results)

module.exports = router