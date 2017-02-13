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
  return Property.find(function(err, propertysFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](propertysFound);
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
    var client, property, search, type;
    if (data[0] === 'codigo') {
      return next(null, false);
    }
    type = '';
    if (data[6] !== '') {
      switch (data[6].toLowerCase()) {
        case 'apartamento':
          type = 'apart';
          break;
        case 'casa':
          type = 'house';
          break;
        case 'carro':
          type = 'car';
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
    if (data[17] !== '') {
      property.hasSubway = true;
      property.subwayStation = data[17];
    }
    search = [];
    search[0] = {
      'email': data[2]
    };
    search[1] = {
      'phones.home': data[3]
    };
    search[2] = {
      'phones.cell': data[4]
    };
    search[3] = {
      'phones.commercial': data[5]
    };
    client = new Client();
    client.name = data[1];
    client.email = data[2];
    client.phones = {
      cell: data[4],
      home: data[3],
      commercial: data[5]
    };
    client.created = new Date();
    return Client.findOne({
      $or: search
    }, function(err, clientFound) {
      if (err) {
        return next(err);
      }
      if (clientFound) {
        errors.push({
          client: clientFound,
          property: property,
          error: {
            message: 'Client exists',
            code: 1
          }
        });
        return next(null, false);
      } else {
        return client.save(function(err, clientSaved) {
          if (err) {
            errors.push({
              client: clientFound,
              property: property,
              error: {
                message: 'Error on save client',
                code: 2
              }
            });
            return next(err);
          }
          property.client = clientSaved._id;
          return property.save(function(err, propertySaved) {
            if (err) {
              errors.push({
                client: clientFound,
                property: property,
                error: {
                  message: 'Error on save property',
                  code: 3
                }
              });
              return next(err);
            }
            success.push({
              client: clientSaved,
              property: propertySaved
            });
            return next(null, true);
          });
        });
      }
    });
  }).on('data', function(data) {
    return console.log('Entrou data');
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
