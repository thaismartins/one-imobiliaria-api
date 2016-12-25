var Client, Property, auth, config, express, router;

express = require('express');

router = express.Router();

auth = require('../services/auth');

Property = require('../models/Property');

Client = require('../models/Client');

config = require('../config');

router.get('/', auth.isAuthenticated, function(req, res) {
  return Property.find(function(err, propertysFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](propertysFound);
  });
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
  return Property.findOne({
    '_id': req.params.id
  }, function(err, propertyFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (propertyFound) {
      return res["with"](propertyFound);
    }
    return res["with"](res.type.itemNotFound);
  });
});

router.post('/', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    '_id': req.body.client
  }, function(err, clientFound) {
    var property;
    if (clientFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    property = new Property(req.body);
    property.created = new Date();
    return property.save(function(err, propertySaved) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      return res["with"](propertySaved);
    });
  });
});

router.put('/:id', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    '_id': req.body.client
  }, function(err, clientFound) {
    if (clientFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    return Property.findOne({
      '_id': req.params.id
    }, function(err, propertyFound) {
      var property;
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      if (propertyFound == null) {
        return res["with"](res.type.itemNotFound);
      }
      property = new Property(req.body);
      return Property.findOneAndUpdate({
        _id: req.params.id
      }, {
        $set: property.forUpdate()
      }, {
        "new": true
      }).populate('client').exec(function(err, propertyUpdated) {
        if (err) {
          return res["with"](res.type.dbError, err);
        }
        return res["with"](propertyUpdated);
      });
    });
  });
});

router["delete"]('/:id', auth.isAuthenticated, function(req, res) {
  return Property.findOneAndRemove({
    '_id': req.params.id
  }, function(err) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](res.type.deleteSuccess);
  });
});

module.exports = router;
