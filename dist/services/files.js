'use strict';
var fs;

fs = require('fs');

module.exports = {
  deletePathRecursive: function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file) {
        var curPath;
        curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          return deleteFolderRecursive(curPath);
        } else {
          return fs.unlinkSync(curPath);
        }
      });
      return fs.rmdirSync(path);
    }
  }
};
