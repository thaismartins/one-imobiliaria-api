var Property, auth, config, express, router, url;

express = require('express');

router = express.Router();

auth = require('../services/auth');

Property = require('../models/Property');

config = require('../config');

url = require('url');

router.get('/', auth.isAuthenticated, function(req, res) {
  var interestQuery, property, propertyQuery, reqQuery;
  reqQuery = url.parse(req.url, true).query;
  reqQuery.property = JSON.parse(reqQuery.property);
  reqQuery.interest = JSON.parse(reqQuery.interest);
  property = new Property();
  propertyQuery = property.generatePropertyQuery(reqQuery);
  interestQuery = property.generateInterestQuery(reqQuery);
  return Property.find(propertyQuery, function(err, propertiesFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return Property.find(interestQuery, function(err, propertiesInterestFound) {
      var i, j, len, len1, propertyInterest, results;
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      results = [];
      for (i = 0, len = propertiesFound.length; i < len; i++) {
        property = propertiesFound[i];
        for (j = 0, len1 = propertiesInterestFound.length; j < len1; j++) {
          propertyInterest = propertiesInterestFound[j];
          result.push({
            property: property,
            interest: propertyInterest
          });
        }
      }
      return res["with"](results);
    });
  });
});

module.exports = router;
