'use strict';
module.exports = {
  messages: {
    'createSuccess': {
      'text': 'Item created with success',
      'code': 0,
      'status': 200,
      'success': true
    },
    'updateSuccess': {
      'text': 'Item updated with success',
      'code': 0,
      'status': 200,
      'success': true
    },
    'deleteSuccess': {
      'text': 'Object deleted with success',
      'code': 0,
      'status': 200,
      'success': true
    },
    'foundSuccess': {
      'text': 'Objects found with success',
      'code': 0,
      'status': 200,
      'success': true
    },
    'loginSuccess': {
      'text': 'Login with success',
      'code': 0,
      'status': 200,
      'success': true
    },
    'rememberSuccess': {
      'text': 'Code sended with success',
      'code': 0,
      'status': 200,
      'success': true
    },
    'dbError': {
      'text': 'Error on database',
      'code': 1,
      'status': 500,
      'success': false
    },
    'fieldsMissing': {
      'text': 'Required fields are missing',
      'code': 2,
      'status': 500,
      'success': false
    },
    'itemExists': {
      'text': 'This item already exists',
      'code': 3,
      'status': 500,
      'success': false
    },
    'itemNotFound': {
      'text': 'Item not found',
      'code': 4,
      'status': 500,
      'success': false
    },
    'itemsNotFound': {
      'text': 'Items not found',
      'code': 4,
      'status': 500,
      'success': false
    },
    'wrongPassword': {
      'text': 'Wrong password',
      'code': 5,
      'status': 500,
      'success': false
    },
    'emailError': {
      'text': 'Error on send email',
      'code': 6,
      'status': 500,
      'success': false
    },
    'codeError': {
      'text': 'Error on validate remember code',
      'code': 7,
      'status': 500,
      'success': false
    },
    'couponNotAvailable': {
      'text': 'Coupon is no available for rescue',
      'code': 8,
      'status': 500,
      'success': false
    },
    'couponNotPermitted': {
      'text': 'User can\'t rescue this coupon',
      'code': 9,
      'status': 500,
      'success': false
    },
    'couponRescued': {
      'text': 'Coupon has already been rescued',
      'code': 10,
      'status': 500,
      'success': false
    }
  },
  "with": function(message, data) {
    var responseJson;
    responseJson = {};
    if ((message != null ? message.text : void 0) != null) {
      responseJson.message = message.text;
      responseJson.code = message.code;
      responseJson.success = message.success;
      this.status(message.status);
      if (data) {
        responseJson.content = data;
      }
    } else {
      responseJson = message;
    }
    return this.json(responseJson);
  },
  factory: function(req, res, next) {
    res.type = response.messages;
    res.message = response.response;
    next();
  }
};
