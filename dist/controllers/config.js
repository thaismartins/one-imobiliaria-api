var City, Client, Group, Promise, User, express, router, setOnlyNumbers, states, utils;

express = require('express');

router = express.Router();

states = require('../configs/states');

utils = require('../services/utils');

Promise = require('q');

City = require('../models/City');

User = require('../models/User');

Group = require('../models/UserGroup');

Client = require('../models/Client');

setOnlyNumbers = function(value) {
  return Number(value.toString().replace(/[^0-9]+/g, ""));
};

router.post('/cities', function(req, res) {
  var i, len, promises, state;
  promises = [];
  for (i = 0, len = states.length; i < len; i++) {
    state = states[i];
    state.cities.forEach(function(city) {
      var d, newCity;
      if (city.name != null) {
        d = Promise.defer();
        newCity = {
          state: state.shortname,
          name: city.name
        };
        City.findOneAndUpdate({
          slug: utils.createSlug(city.name)
        }, {
          $set: newCity
        }, {
          "new": true,
          upsert: true
        }, function(err, cityUpdated) {
          if (err) {
            return d.reject(err);
          } else {
            return d.resolve(cityUpdated);
          }
        });
        return promises.push(d.promise);
      }
    });
  }
  Promise.allSettled(promises).then(function(cities) {
    return res["with"]({
      success: true,
      message: 'All cities created with success'
    });
  }, function(err) {
    return res.message(res.type.dbError, err);
  });
});

router.post('/groups', function(req, res) {
  var groups, promises;
  promises = [];
  groups = [
    {
      title: 'Admin'
    }, {
      title: 'Broker'
    }
  ];
  groups.forEach(function(group) {
    var d;
    d = Promise.defer();
    Group.findOneAndUpdate({
      type: utils.createSlug(group.title)
    }, {
      $set: group
    }, {
      "new": true,
      upsert: true
    }, function(err, groupUpdated) {
      if (err) {
        return d.reject(err);
      } else if (groupUpdated != null) {
        return d.resolve(groupUpdated);
      } else {
        return d.resolve(false);
      }
    });
    return promises.push(d.promise);
  });
  Promise.allSettled(promises).then(function(groups) {
    return res["with"]({
      success: true,
      message: 'All groups created with success'
    });
  }, function(err) {
    return res.message(res.type.dbError, err);
  });
});

router.post('/users', function(req, res) {
  var user;
  user = new User();
  user.name = 'Admin';
  user.email = 'admin@one';
  user.username = 'admin@one';
  user.password = '!one@159';
  user.created = Date.now();
  return Group.findOne({
    'type': 'admin'
  }, function(err, groupFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (groupFound != null) {
      user.group = groupFound._id;
    } else {
      return res["with"]({
        success: false,
        message: 'Create all groups before insert users'
      });
    }
    return User.findOneAndUpdate({
      username: 'admin'
    }, {
      $set: user.withoutId()
    }, {
      "new": true,
      upsert: true
    }, function(err, userUpdated) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      return res["with"]({
        success: true,
        message: 'All users created with success'
      });
    });
  });
});

router.post('/clients/phones', function(req, res) {
  return Client.find(function(err, clientsFound) {
    var errors, promises, success;
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (!clientsFound) {
      return res["with"]({
        success: true,
        message: 'No clients found.'
      });
    }
    promises = [];
    errors = [];
    success = 0;
    clientsFound.forEach(function(client) {
      var d;
      if (client.phones != null) {
        if (client.phones.cell) {
          client.phones.cell = setOnlyNumbers(client.phones.cell);
        }
        if (client.phones.home) {
          client.phones.home = setOnlyNumbers(client.phones.home);
        }
        if (client.phones.commercial) {
          client.phones.commercial = setOnlyNumbers(client.phones.commercial);
        }
        d = Promise.defer();
        Client.findOneAndUpdate({
          _id: client._id
        }, {
          $set: client.withoutId()
        }, {
          "new": true,
          upsert: true
        }, function(err, clientUpdated) {
          if (err) {
            errors.push(clientUpdated);
          } else {
            success++;
          }
          return d.resolve();
        });
        return promises.push(d.promise);
      }
    });
    return Promise.allSettled(promises).then(function(data) {
      return res["with"]({
        success: true,
        message: success + ' client(s) phones updated with success and ' + errors.length + ' with errors.',
        errors: errors
      });
    });
  });
});

module.exports = router;
