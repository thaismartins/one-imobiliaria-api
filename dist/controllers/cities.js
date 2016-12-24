var City, auth, express, router, utils;

express = require('express');

router = express.Router();

auth = require('../services/auth');

utils = require('../services/utils');

City = require('../models/City');

router.get('/', auth.isAuthenticated, function(req, res) {
  return City.find(function(err, citiesFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](citiesFound);
  });
});

router.get('/search', function(req, res) {
  var limit, search;
  search = {};
  if (req.query.name != null) {
    search.name = {
      $regex: utils.regexStringAccents(req.query.name) + '|' + req.query.name,
      $options: 'i'
    };
  }
  if (req.query.state != null) {
    search.state = req.query.state;
  }
  limit = req.query.limit != null ? req.query.limit : 5;
  return City.find(search).limit(limit).sort('name').exec(function(err, citiesFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](citiesFound);
  });
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
  return City.findOne({
    '_id': req.params.id
  }, function(err, cityFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (cityFound) {
      return res["with"](cityFound);
    }
    return res["with"](res.type.itemNotFound);
  });
});

module.exports = router;
