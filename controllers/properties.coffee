express = require 'express'
router = express.Router()
auth = require '../services/auth'
Property = require '../models/Property'
Client = require '../models/Client'
config = require '../config'
NodeGeocoder = require('node-geocoder')
geocoderOptions =
  provider: 'google'
  httpAdapter: 'https'
  apiKey: config.googleapi
  formatter: null
geocoder = NodeGeocoder(geocoderOptions)
multer = require 'multer'
uploadPath = './public/uploads/properties'
upload = multer({ 'dest': uploadPath })
fs = require 'fs'
csv = require 'fast-csv'

# GET ALL PROPERTIES
router.get '/', auth.isAuthenticated, (req, res) ->
  Property.find  (err, propertiesFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(propertiesFound)

# GET SPECIFIC PROPERTY
router.get '/:id', auth.isAuthenticated, (req, res) ->
  Property.findOne {'_id': req.params.id}, (err, propertyFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(propertyFound) if propertyFound
    res.with(res.type.itemNotFound)

# ADD NEW PROPERTY
router.post '/', auth.isAuthenticated, (req, res) ->
  Client.findOne {'_id': req.body.client}, (err, clientFound) ->
    return res.with(res.type.itemNotFound) unless clientFound?

    property = new Property(req.body)
    property.created = new Date()
    geocoder.geocode(property.fullAddress())
    .then (points) ->
      return res.with(res.type.addressNotFound) unless points.length > 0
      property.address.lat = points[0].latitude
      property.address.lng = points[0].longitude

      property.save (err, propertySaved) ->
        return res.with(res.type.dbError, err) if err
        res.with(propertySaved)
    .catch (err) ->
      res.with(res.type.mapsError, err)

# ADD NEW PROPERTY
router.post '/import/csv', auth.isAuthenticated, upload.single('csv'), (req, res) ->

  return res.with(res.type.csvNotSended) unless req.file?

  errors = []
  success = []
  csv
  .fromPath(req.file.path)
  .validate (data, next) ->
    hasError = false
    if data[0] == 'codigo' or data[0] == ''
      next(null, false)
      return false

    type = ''
    if data[6] != ''
      switch data[6].toLowerCase()
        when 'apartamento' then type = 'apartment'
        when 'casa' then type = 'house'
        when 'carro' then type = 'car'
        when 'terreno' then type = 'land'
        else type = 'others'

    property = new Property()
    property.address.street = data[7]
    property.address.number = data[8]
    property.address.complement = data[9]
    property.address.neighborhood = data[10]
    property.address.city = data[11]
    property.address.state = data[12]
    property.address.cep = data[13]
    property.type = type
    property.code = data[0]
    property.floor = data[14]
    property.vacancy = data[16]
    property.meters = data[15]
    property.value = data[18]
    property.condominium = data[19]
    property.iptu = data[20]
    property.location = data[21]
    property.broker = data[22]

    if data[17] != ''
      property.hasSubway = true
      property.subwayStation = data[17]

    client = new Client()
    client.name = data[1]
    client.email = data[2]
    client.phones = {}
    client.phones.cell = data[4]
    client.phones.home = data[3] if data[3]? and data[3] != ''
    client.phones.commercial = data[5] if data[5]? and data[5] != ''
    client.created = new Date()

    clientErrors = client.validateFields()
    if clientErrors.length > 0
      if not hasError
        errors.push
          client: client
          property: property
          error:
            message: 'Error on validate client.'
            fields: clientErrors.join(', ')
            code: 5
        hasError = true
      next(null, false)
      return false

    propertyErrors = property.validateFields()
    if propertyErrors.length > 0
      if not hasError
        errors.push
          client: client
          property: property
          error:
            message: 'Error on validate property.'
            fields: propertyErrors.join(', ')
            code: 6
        hasError = true
      next(null, false)
      return false

    search = []
    search.push({'email': data[2]})
    search.push({'phones.home': data[3]}) if data[3]? and data[3] != ''
    search.push({'phones.cell': data[4]}) if data[4]? and data[4] != ''
    search.push({'phones.commercial': data[5]}) if data[5]? and data[5] != ''

    Client.findOne {$or: search}, (err, clientFound) ->
      if err
        if not hasError
          errors.push
            client: client
            property: property
            error:
              message: 'Error on find client'
              code: 2
              fields: err
          hasError = true
        next(null, false)
        return false
      if clientFound
        if not hasError
          errors.push
            client: clientFound
            property: property
            error:
              message: 'Client exists'
              code: 1
          hasError = true
        next(null, false)
        return false
      else
        geocoder.geocode(property.fullAddress())
        .then (points) ->
          if points.length < 1 or not points[0]? or not points[0].latitude? or not points[0]?.longitude?
            if not hasError
              errors.push
                client: client
                property: property
                error:
                  message: 'Error on find latitude and longitude property'
                  code: 4
              hasError = true
            next(null, false)
            return false
          property.address.lat = points[0].latitude
          property.address.lng = points[0].longitude

          client.save (err, clientSaved) ->
            if err
              if not hasError
                errors.push
                  client: client
                  property: property
                  error:
                    message: 'Error on save client'
                    code: 2
                    fields: err
                hasError = true
              next(null, false)
              return false
            property.client = clientSaved._id
            property.save (err, propertySaved) ->
              if err
                if not hasError
                  errors.push
                    client: clientSaved
                    property: property
                    error:
                      message: 'Error on save property'
                      code: 3
                      fields: err
                next(null, false)
                return false
              success.push
                client: clientSaved
                property: propertySaved
              next(null, true)
              return true
  .on 'data', (data) ->
    console.log('Data OK');
  .on 'end', () ->
    console.log('Imported successfully')
    res.with(res.type.importedSuccess, {errors: errors, success: success})


# UPDATE EXISTENT PROPERTY
router.put '/:id', auth.isAuthenticated, (req, res) ->
  Client.findOne {'_id': req.body.client}, (err, clientFound) ->
    return res.with(res.type.itemNotFound) unless clientFound?

    Property.findOne {'_id': req.params.id}, (err, propertyFound) ->
      return res.with(res.type.dbError, err) if err
      return res.with(res.type.itemNotFound) unless propertyFound?

      property = new Property(req.body)
      Property.findOneAndUpdate({_id: req.params.id}, {$set: property.forUpdate()}, {new: true}).populate('client').exec (err, propertyUpdated) ->
        return res.with(res.type.dbError, err) if err
        res.with(propertyUpdated)

# DELETE PROPERTY
router.delete '/:id', auth.isAuthenticated, (req, res) ->
  Property.findOneAndRemove {'_id': req.params.id}, (err) ->
    return res.with(res.type.dbError, err) if err
    res.with(res.type.deleteSuccess)

module.exports = router