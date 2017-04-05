var Client, NodeGeocoder, Property, auth, config, csv, express, fs, geocoder, geocoderOptions, multer, router, upload, uploadPath;

express = require('express');

router = express.Router();

auth = require('../services/auth');

Property = require('../models/Property');

Client = require('../models/Client');

config = require('../config');

NodeGeocoder = require('node-geocoder');

geocoderOptions = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: config.googleapi,
  formatter: null
};

geocoder = NodeGeocoder(geocoderOptions);

multer = require('multer');

uploadPath = './public/uploads/properties';

upload = multer({
  'dest': uploadPath
});

fs = require('fs');

csv = require('fast-csv');

router.get('/', auth.isAuthenticated, function(req, res) {
  return Property.find(function(err, propertiesFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](propertiesFound);
  });
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
  return Property.findOne({
    '_id': req.params.id
  }, function(err, propertyFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (propertyFound) {
      return res["with"](propertyFound);
    }
    return res["with"](res.type.itemNotFound);
  });
});

router.post('/', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    '_id': req.body.client
  }, function(err, clientFound) {
    var property;
    if (clientFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    property = new Property(req.body);
    property.created = new Date();
    return geocoder.geocode(property.fullAddress()).then(function(points) {
      if (!(points.length > 0)) {
        return res["with"](res.type.addressNotFound);
      }
      property.address.lat = points[0].latitude;
      property.address.lng = points[0].longitude;
      return property.save(function(err, propertySaved) {
        if (err) {
          return res["with"](res.type.dbError, err);
        }
        return res["with"](propertySaved);
      });
    })["catch"](function(err) {
      return res["with"](res.type.mapsError, err);
    });
  });
});

router.post('/import/csv', auth.isAuthenticated, upload.single('csv'), function(req, res) {
  var errors, success;
  if (req.file == null) {
    return res["with"](res.type.csvNotSended);
  }
  errors = [];
  success = [];
  return csv.fromPath(req.file.path).validate(function(data, next) {
    var client, clientErrors, hasError, property, propertyErrors, search, type;
    hasError = false;
    if (data[0] === 'codigo') {
      next(null, false);
      hasError = true;
      return false;
    }
    type = '';
    if (data[6] !== '') {
      switch (data[6].toLowerCase()) {
        case 'apartamento':
          type = 'apartment';
          break;
        case 'casa':
          type = 'house';
          break;
        case 'carro':
          type = 'car';
          break;
        case 'terreno':
          type = 'land';
          break;
        default:
          type = 'others';
      }
    }
    property = new Property();
    property.address.street = data[7];
    property.address.number = data[8];
    property.address.complement = data[9];
    property.address.neighborhood = data[10];
    property.address.city = data[11];
    property.address.state = data[12];
    property.address.cep = data[13];
    property.type = type;
    property.code = data[0];
    property.floor = data[14];
    property.vacancy = data[16];
    property.meters = data[15];
    property.value = data[18];
    property.condominium = data[19];
    property.iptu = data[20];
    property.location = data[21];
    property.broker = data[22];
    if (data[17] !== '') {
      property.hasSubway = true;
      property.subwayStation = data[17];
    }
    client = new Client();
    client.name = data[1];
    client.email = data[2];
    client.phones = {};
    if ((data[4] != null) && data[4] !== '') {
      client.phones.cell = data[4];
    }
    if ((data[3] != null) && data[3] !== '') {
      client.phones.home = data[3];
    }
    if ((data[5] != null) && data[5] !== '') {
      client.phones.commercial = data[5];
    }
    client.created = new Date();
    clientErrors = client.validateFields();
    if (clientErrors.length > 0) {
      if (!hasError) {
        errors.push({
          client: client,
          property: property,
          error: {
            message: 'Error on validate client: ' + clientErrors.join(', '),
            code: 3
          }
        });
        hasError = true;
      }
      next(null, false);
      return false;
    }
    propertyErrors = property.validateFields();
    if (propertyErrors.length > 0) {
      if (!hasError) {
        errors.push({
          client: client,
          property: property,
          error: {
            message: 'Error on validate property: ' + propertyErrors.join(', '),
            code: 3
          }
        });
        hasError = true;
      }
      next(null, false);
      return false;
    }
    search = [];
    search.push({
      'email': data[2]
    });
    if ((data[3] != null) && data[3] !== '') {
      search.push({
        'phones.home': data[3]
      });
    }
    if ((data[4] != null) && data[4] !== '') {
      search.push({
        'phones.cell': data[4]
      });
    }
    if ((data[5] != null) && data[5] !== '') {
      search.push({
        'phones.commercial': data[5]
      });
    }
    return Client.findOne({
      $or: search
    }, function(err, clientFound) {
      if (err) {
        if (!hasError) {
          errors.push({
            client: client,
            property: property,
            error: {
              message: 'Error on find client',
              code: 2
            }
          });
          hasError = true;
        }
        next(null, false);
        return false;
      }
      if (clientFound) {
        if (!hasError) {
          errors.push({
            client: clientFound,
            property: property,
            error: {
              message: 'Client exists',
              code: 1
            }
          });
          hasError = true;
        }
        next(null, false);
        return false;
      } else {
        return geocoder.geocode(property.fullAddress()).then(function(points) {
          var ref;
          if (points.length < 1 || (points[0] == null) || (points[0].latitude == null) || (((ref = points[0]) != null ? ref.longitude : void 0) == null)) {
            if (!hasError) {
              errors.push({
                client: clientFound,
                property: property,
                error: {
                  message: 'Error on find latitude and longitude property',
                  code: 4
                }
              });
              hasError = true;
            }
            next(null, false);
            return false;
          }
          property.address.lat = points[0].latitude;
          property.address.lng = points[0].longitude;
          return client.save(function(err, clientSaved) {
            if (err) {
              if (!hasError) {
                errors.push({
                  client: client,
                  property: property,
                  error: {
                    message: 'Error on save client',
                    code: 2
                  }
                });
                hasError = true;
              }
              next(null, false);
              return false;
            }
            property.client = clientSaved._id;
            return property.save(function(err, propertySaved) {
              if (err) {
                if (!hasError) {
                  errors.push({
                    client: clientSaved,
                    property: property,
                    error: {
                      message: 'Error on save property',
                      code: 3
                    }
                  });
                }
                next(null, false);
                return false;
              }
              success.push({
                client: clientSaved,
                property: propertySaved
              });
              next(null, true);
              return true;
            });
          });
        });
      }
    });
  }).on('data', function(data) {
    return console.log('Data OK');
  }).on('end', function() {
    console.log('Imported successfully');
    return res["with"](res.type.importedSuccess, {
      errors: errors,
      success: success
    });
  });
});

router.put('/:id', auth.isAuthenticated, function(req, res) {
  return Client.findOne({
    '_id': req.body.client
  }, function(err, clientFound) {
    if (clientFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    return Property.findOne({
      '_id': req.params.id
    }, function(err, propertyFound) {
      var property;
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      if (propertyFound == null) {
        return res["with"](res.type.itemNotFound);
      }
      property = new Property(req.body);
      return Property.findOneAndUpdate({
        _id: req.params.id
      }, {
        $set: property.forUpdate()
      }, {
        "new": true
      }).populate('client').exec(function(err, propertyUpdated) {
        if (err) {
          return res["with"](res.type.dbError, err);
        }
        return res["with"](propertyUpdated);
      });
    });
  });
});

router["delete"]('/:id', auth.isAuthenticated, function(req, res) {
  return Property.findOneAndRemove({
    '_id': req.params.id
  }, function(err) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](res.type.deleteSuccess);
  });
});

module.exports = router;
