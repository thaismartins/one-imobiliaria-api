'use strict';

express = require('express')
fs = require('fs')
path = require('path')
router = express.Router()

router.get '/:path/:id', (req, res) ->
  filename = path.join process.cwd(), 'public/uploads/' + req.params.path, req.params.id
  fs.exists filename, (exists) ->
    return res.sendFile(filename) if exists
    res.send(null)

module.exports = router