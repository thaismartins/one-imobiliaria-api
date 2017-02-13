express = require 'express'
router = express.Router()
states = require('../configs/states')
utils = require '../services/utils'
Promise = require('q')
City = require '../models/City'
User = require '../models/User'
Group = require '../models/UserGroup'

# ADD CITIES
router.post '/cities', (req, res) ->
  promises = []
  for state in states
    state.cities.forEach (city) ->
      if city.name?
        d = Promise.defer()
        newCity = {state: state.shortname, name: city.name}
        City.findOneAndUpdate {slug: utils.createSlug(city.name)}, {$set: newCity}, {new: true, upsert: true}, (err, cityUpdated) ->
          if err then d.reject(err)
          else d.resolve(cityUpdated)
        promises.push(d.promise)

  Promise.allSettled(promises)
  .then (cities) ->
    res.with({success: true, message: 'All cities created with success'})
  , (err) ->
    res.message(res.type.dbError, err)
  return


# ADD GROUPS USERS
router.post '/groups', (req, res) ->
  promises = []
  groups = [{title: 'Admin'}, {title: 'Broker'}]
  groups.forEach (group) ->
    d = Promise.defer()
    Group.findOneAndUpdate {type: utils.createSlug(group.title)}, {$set: group}, {new: true, upsert: true}, (err, groupUpdated) ->
      if err then d.reject(err)
      else if groupUpdated? then d.resolve(groupUpdated)
      else d.resolve(false)
    promises.push(d.promise)

  Promise.allSettled(promises)
  .then (groups) ->
    res.with({success: true, message: 'All groups created with success'})
  , (err) ->
    res.message(res.type.dbError, err)
  return

# ADD USERS
router.post '/users', (req, res) ->

  user = new User()
  user.name = 'Admin'
  user.email = 'admin@one'
  user.username = 'admin@one'
  user.password = '!one@159'
  user.created = Date.now()

  Group.findOne {'type': 'admin'}, (err, groupFound) ->
    return res.with(res.type.dbError, err) if err
    if groupFound? then user.group = groupFound._id
    else return res.with({success: false, message: 'Create all groups before insert users'})
    User.findOneAndUpdate {username:'admin'}, {$set: user.withoutId()}, {new: true, upsert: true}, (err, userUpdated) ->
      return res.with(res.type.dbError, err) if err
      res.with({success: true, message: 'All users created with success'})

module.exports = router