var Group, auth, express, router, utils;

express = require('express');

router = express.Router();

auth = require('../services/auth');

Group = require('../models/UserGroup');

utils = require('../services/utils');

router.post('/', function(req, res) {
  return Group.findOne({
    type: utils.createSlug(req.body.title)
  }, function(err, groupFound) {
    var group;
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (groupFound) {
      return res["with"](res.type.itemExists);
    }
    group = new Group(req.body);
    return group.save(function(err) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      return res["with"](group);
    });
  });
});

router.get('/', auth.isAuthenticated, function(req, res) {
  return Group.find(function(err, groupsFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](groupsFound);
  });
});

module.exports = router;
