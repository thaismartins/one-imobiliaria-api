express = require 'express'
router = express.Router()
auth = require '../services/auth'
Group = require '../models/UserGroup'
utils = require '../services/utils'

# ADD NEW GROUP
router.post '/', (req, res) ->
  Group.findOne {type: utils.createSlug(req.body.title)}, (err, groupFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(res.type.itemExists) if groupFound
    group = new Group(req.body)
    group.save (err) ->
      return res.with(res.type.dbError, err) if err
      res.with(group)

# GET ALL GROUPS
router.get '/', auth.isAuthenticated, (req, res) ->
  Group.find (err, groupsFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(groupsFound)

module.exports = router