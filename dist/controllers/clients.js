var Client, auth, config, express, router;

express = require('express');

router = express.Router();

auth = require('../services/auth');

Client = require('../models/Client');

config = require('../config');

router.get('/', auth.isAuthenticated, function(req, res) {
  return Client.find(function(err, clientsFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](clientsFound);
  });
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    '_id': req.params.id
  }, function(err, clientFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (clientFound) {
      return res["with"](clientFound);
    }
    return res["with"](res.type.itemNotFound);
  });
});

router.post('/', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    email: req.body.email
  }, function(err, clientFound) {
    var client;
    if (clientFound) {
      return res["with"](res.type.itemExists);
    }
    client = new Client(req.body);
    client.created = new Date();
    return client.save(function(err, clientSaved) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      return res["with"](clientSaved);
    });
  });
});

router.put('/:id', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    _id: req.params.id
  }, function(err, clientFound) {
    var client;
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (clientFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    client = new Client(req.body);
    return Client.findOneAndUpdate({
      _id: req.params.id
    }, {
      $set: client.forUpdate()
    }, {
      "new": true
    }).populate('group').exec(function(err, clientUpdated) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      return res["with"](clientUpdated);
    });
  });
});

router["delete"]('/:id', auth.isAuthenticated, function(req, res) {
  return Client.findOneAndRemove({
    '_id': req.params.id
  }, function(err) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](res.type.deleteSuccess);
  });
});

module.exports = router;
