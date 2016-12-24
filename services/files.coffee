'use strict'

fs = require 'fs'

module.exports =
  deletePathRecursive: (path) ->
    if fs.existsSync(path)
      fs.readdirSync(path).forEach (file) ->
        curPath = path + "/" + file
        if fs.lstatSync(curPath).isDirectory()
          deleteFolderRecursive(curPath);
        else
          fs.unlinkSync(curPath);
      fs.rmdirSync(path)