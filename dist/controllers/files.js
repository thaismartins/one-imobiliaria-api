'use strict';
var express, fs, path, router;

express = require('express');

fs = require('fs');

path = require('path');

router = express.Router();

router.get('/:path/:id', function(req, res) {
  var filename;
  filename = path.join(process.cwd(), 'public/uploads/' + req.params.path, req.params.id);
  return fs.exists(filename, function(exists) {
    if (exists) {
      return res.sendFile(filename);
    }
    return res.send(null);
  });
});

module.exports = router;
