'use strict'

module.exports =
  messages:
    'createSuccess':
      'text': 'Item created with success',
      'code': 0,
      'status': 200,
      'success': true
    'updateSuccess':
      'text': 'Item updated with success',
      'code': 0,
      'status': 200,
      'success': true
    'deleteSuccess':
      'text': 'Object deleted with success',
      'code': 0,
      'status': 200,
      'success': true
    'foundSuccess':
      'text': 'Objects found with success',
      'code': 0,
      'status': 200,
      'success': true
    'loginSuccess':
      'text': 'Login with success',
      'code': 0,
      'status': 200,
      'success': true
    'rememberSuccess':
      'text': 'Code sended with success',
      'code': 0,
      'status': 200,
      'success': true
    'dbError':
      'text': 'Error on database',
      'code': 1,
      'status': 500,
      'success': false
    'fieldsMissing':
      'text': 'Required fields are missing',
      'code': 2,
      'status': 500,
      'success': false
    'itemExists':
      'text': 'This item already exists',
      'code': 3,
      'status': 500,
      'success': false
    'itemNotFound':
      'text': 'Item not found',
      'code': 4,
      'status': 500,
      'success': false
    'itemsNotFound':
      'text': 'Items not found',
      'code': 4,
      'status': 500,
      'success': false
    'wrongPassword':
      'text': 'Wrong password',
      'code': 5,
      'status': 500,
      'success': false
    'emailError':
      'text': 'Error on send email',
      'code': 6,
      'status': 500,
      'success': false
    'codeError':
      'text': 'Error on validate remember code',
      'code': 7,
      'status': 500,
      'success': false
    'addressNotFound':
      'text': 'The address was not found in google maps API',
      'code': 8,
      'status': 500,
      'success': false
    'mapsError':
      'text': 'Error extract maps API latitude and logitude',
      'code': 9,
      'status': 500,
      'success': false
    'csvNotSended':
      'text': 'Error any csv was sended',
      'code': 10,
      'status': 500,
      'success': false
  with: (message, data) ->
    responseJson = {}
    if message?.text?
      responseJson.message = message.text;
      responseJson.code = message.code;
      responseJson.success = message.success;
      this.status(message.status);

      if data
        responseJson.content = data
    else
      responseJson = message
    this.json(responseJson)
  factory: (req, res, next) ->
    res.type = response.messages
    res.message = response.response
    next()
    return