var City, Group, Promise, User, express, router, states, utils;

express = require('express');

router = express.Router();

states = require('../configs/states');

utils = require('../services/utils');

Promise = require('q');

City = require('../models/City');

User = require('../models/User');

Group = require('../models/UserGroup');

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
    console.log(group);
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
  user.name = 'Administrador';
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

module.exports = router;
