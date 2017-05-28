'use strict'

express = require 'express'
router = express.Router()

router.use '/accounts/groups', require './controllers/groups'
router.use '/accounts', require './controllers/accounts'
router.use '/files', require './controllers/files'
router.use '/config', require './controllers/config'
router.use '/cities', require './controllers/cities'
router.use '/clients', require './controllers/clients'
router.use '/properties/search', require './controllers/search'
router.use '/properties', require './controllers/properties'
router.use '/notifications', require './controllers/notifications'

module.exports = router