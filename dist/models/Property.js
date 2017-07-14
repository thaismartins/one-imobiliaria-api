'use strict';
var PropertySchema, Schema, config, mongoose, setCEP, setOnlyNumbers, setState, setValue;

mongoose = require('mongoose');

Schema = mongoose.Schema;

config = require('../config');

setValue = function(value) {
  var finalValue, newValue;
  finalValue = value;
  if (finalValue === '.') {
    return '';
  }
  console.log('---------------');
  console.log(finalValue);
  if (value.indexOf('.') > -1 || value.indexOf(',') > -1) {
    newValue = value.toString().replace(/[^0-9]+/g, "");
    finalValue = newValue.toString().slice(0, -2) + '.' + newValue.toString().slice(-2);
  } else {
    newValue = value.toString().replace(/[^0-9]+/g, "");
    finalValue = newValue.toString() + '.00';
  }
  console.log(finalValue);
  return Number(finalValue);
};

setOnlyNumbers = function(value) {
  return Number(value.toString().replace(/[^0-9]+/g, ""));
};

setCEP = function(value) {
  var number;
  value = setOnlyNumbers(value).toString();
  number = '00000000';
  return number.substring(0, number.length - value.length) + value;
};

setState = function(value) {
  if (value.length !== 2) {
    return '';
  }
  return value.toUpperCase();
};

PropertySchema = new Schema({
  type: {
    type: String,
    required: true,
    "enum": ['house', 'apartment', 'car', 'land', 'others', null]
  },
  code: {
    type: String,
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    complement: {
      type: String
    },
    neighborhood: {
      type: String,
      required: true
    },
    condominium: {
      type: String
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      set: setState
    },
    cep: {
      type: String,
      required: true,
      set: setCEP
    },
    lat: {
      type: String,
      required: true
    },
    lng: {
      type: String,
      required: true
    }
  },
  floor: {
    type: Number,
    set: setOnlyNumbers
  },
  vacancy: {
    type: Number,
    set: setOnlyNumbers
  },
  meters: {
    type: Number,
    set: setOnlyNumbers
  },
  broker: {
    type: String
  },
  hasSubway: {
    type: Boolean
  },
  subwayStation: {
    type: String
  },
  value: {
    type: Number,
    set: setValue
  },
  condominium: {
    type: Number,
    set: setValue
  },
  iptu: {
    type: Number,
    set: setValue
  },
  location: {
    type: Number,
    set: setValue
  },
  payments: [
    {
      type: String,
      "enum": ['financing', 'money', 'others']
    }
  ],
  exchange: {
    type: Number
  },
  settled: {
    type: Boolean
  },
  difference: {
    type: Number
  },
  car: {
    type: Boolean
  },
  carValue: {
    type: Number
  },
  interest: {
    types: [
      {
        type: String,
        "enum": ['house', 'apartment', 'car', 'land', 'others', null]
      }
    ],
    meters: {
      min: {
        type: Number,
        set: setOnlyNumbers
      },
      max: {
        type: Number,
        set: setOnlyNumbers
      }
    },
    vacancy: {
      min: {
        type: Number,
        set: setOnlyNumbers
      },
      max: {
        type: Number,
        set: setOnlyNumbers
      }
    },
    floor: {
      min: {
        type: Number,
        set: setOnlyNumbers
      },
      max: {
        type: Number,
        set: setOnlyNumbers
      }
    },
    address: {
      street: {
        type: String
      },
      number: {
        type: String
      },
      complement: {
        type: String
      },
      neighborhood: {
        type: String
      },
      condominium: {
        type: String
      },
      city: {
        type: String
      },
      state: {
        type: String,
        set: setState
      },
      cep: {
        type: String,
        set: setCEP
      }
    },
    value: {
      min: {
        type: Number,
        set: setValue
      },
      max: {
        type: Number,
        set: setValue
      }
    },
    condominium: {
      min: {
        type: Number,
        set: setValue
      },
      max: {
        type: Number,
        set: setValue
      }
    },
    iptu: {
      min: {
        type: Number,
        set: setValue
      },
      max: {
        type: Number,
        set: setValue
      }
    },
    location: {
      min: {
        type: Number,
        set: setValue
      },
      max: {
        type: Number,
        set: setValue
      }
    },
    hasSubway: {
      type: Boolean
    },
    subwayStation: {
      type: String
    },
    radius: {
      type: Number
    },
    payments: [
      {
        type: String,
        "enum": ['financing', 'money', 'others']
      }
    ],
    settled: {
      type: Boolean
    }
  },
  created: {
    type: Date
  },
  updated: {
    type: Date,
    "default": Date.now
  }
});

PropertySchema.methods.withoutId = function() {
  var obj;
  obj = this.toObject();
  delete obj._id;
  return obj;
};

PropertySchema.methods.fullAddress = function() {
  var address, obj;
  obj = this.toObject();
  if (obj.address.street != null) {
    address = obj.address.street + ', ';
  }
  if ((obj.address.number != null) && obj.address.number > 0) {
    address += obj.address.number + ' - ';
  }
  if (obj.address.city != null) {
    address += obj.address.city + ' - ';
  }
  if (obj.address.state != null) {
    address += obj.address.state + ', ';
  }
  if (obj.address.cep != null) {
    address += obj.address.cep + ', Brazil';
  }
  return address;
};

PropertySchema.methods.forUpdate = function() {
  var item, obj, value;
  obj = this.toObject();
  for (item in obj) {
    value = obj[item];
    if (value === '' || value.length === 0) {
      delete obj[item];
    }
  }
  delete obj._id;
  return obj;
};

PropertySchema.methods.validateFields = function() {
  var errors;
  errors = [];
  if ((this.code == null) || typeof this.code !== 'string') {
    errors.push('Código');
  }
  if ((this.type == null) || typeof this.type !== 'string') {
    errors.push('Tipo de Imóvel');
  }
  if ((this.address.street == null) || typeof this.address.street !== 'string') {
    errors.push('Rua');
  }
  if ((this.address.number == null) || typeof this.address.number !== 'string') {
    errors.push('Número (Endereço)');
  }
  if ((this.address.neighborhood == null) || typeof this.address.neighborhood !== 'string') {
    errors.push('Bairro');
  }
  if ((this.address.city == null) || typeof this.address.city !== 'string') {
    errors.push('Cidade');
  }
  if ((this.address.state == null) || typeof this.address.state !== 'string' || this.address.state.length !== 2) {
    errors.push('Estado');
  }
  if ((this.address.cep == null) || this.address.cep === '') {
    errors.push('CEP');
  }
  if ((this.value == null) || this.value === '') {
    errors.push('Valor do Imóvel');
  }
  return errors;
};

PropertySchema.methods.generatePropertyQuery = function(reqQuery) {
  var newQuery, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
  newQuery = {};
  if (reqQuery.property.type != null) {
    newQuery.type = {
      $or: reqQuery.property.type
    };
  }
  if (reqQuery.property.meters != null) {
    newQuery.meters = {
      $gte: reqQuery.property.meters.min,
      $lte: reqQuery.property.meters.max
    };
  }
  if (reqQuery.property.vacancy != null) {
    newQuery.vacancy = {
      $gte: reqQuery.property.vacancy.min,
      $lte: reqQuery.property.vacancy.max
    };
  }
  if (reqQuery.property.floor != null) {
    newQuery.floor = {
      $gte: reqQuery.property.floor.min,
      $lte: reqQuery.property.floor.max
    };
  }
  if (((ref = reqQuery.property.address) != null ? ref.street : void 0) != null) {
    newQuery.address.street = new RegExp('^' + reqQuery.property.address.street + '$', "i");
  }
  if (((ref1 = reqQuery.property.address) != null ? ref1.number : void 0) != null) {
    newQuery.address.number = new RegExp('^' + reqQuery.property.address.number + '$', "i");
  }
  if (((ref2 = reqQuery.property.address) != null ? ref2.neighborhood : void 0) != null) {
    newQuery.address.neighborhood = new RegExp('^' + reqQuery.property.address.neighborhood + '$', "i");
  }
  if (((ref3 = reqQuery.property.address) != null ? ref3.city : void 0) != null) {
    newQuery.address.city = reqQuery.property.address.city;
  }
  if (reqQuery.property.hasSubway != null) {
    newQuery.hasSubway = reqQuery.property.hasSubway;
  }
  if (reqQuery.property.subwayStation != null) {
    newQuery.subwayStation = reqQuery.property.subwayStation;
  }
  if (reqQuery.property.value != null) {
    newQuery.value = {
      $gte: reqQuery.property.value.min,
      $lte: reqQuery.property.value.max
    };
  }
  if (reqQuery.property.condominium != null) {
    newQuery.condominium = {
      $gte: reqQuery.property.condominium.min,
      $lte: reqQuery.property.condominium.max
    };
  }
  if (reqQuery.property.iptu != null) {
    newQuery.iptu = {
      $gte: reqQuery.property.iptu.min,
      $lte: reqQuery.property.iptu.max
    };
  }
  if (reqQuery.property.location != null) {
    newQuery.location = {
      $gte: reqQuery.property.location.min,
      $lte: reqQuery.property.location.max
    };
  }
  if (reqQuery.property.payments != null) {
    newQuery.payments = {
      $in: reqQuery.property.payments
    };
  }
  if (reqQuery.property.exchange != null) {
    newQuery.exchange = reqQuery.property.exchange;
  }
  if (reqQuery.property.settled != null) {
    newQuery.settled = reqQuery.property.settled;
  }
  if (reqQuery.property.difference != null) {
    newQuery.difference = reqQuery.property.difference;
  }
  if (reqQuery.property.car != null) {
    newQuery.car = reqQuery.property.car;
  }
  if (reqQuery.property.carValue != null) {
    newQuery.carValue = reqQuery.property.carValue;
  }
  if (reqQuery.interest != null) {
    newQuery.interest = {};
  }
  if (reqQuery.interest.type != null) {
    newQuery.interest.type = {
      $or: reqQuery.interest.type
    };
  }
  if (reqQuery.interest.meters != null) {
    newQuery.interest.meters = {
      $gte: reqQuery.interest.meters.min,
      $lte: reqQuery.interest.meters.max
    };
  }
  if (reqQuery.interest.vacancy != null) {
    newQuery.interest.vacancy = {
      $gte: reqQuery.interest.vacancy.min,
      $lte: reqQuery.interest.vacancy.max
    };
  }
  if (reqQuery.interest.floor != null) {
    newQuery.interest.floor = {
      $gte: reqQuery.interest.floor.min,
      $lte: reqQuery.interest.floor.max
    };
  }
  if (((ref4 = reqQuery.interest.address) != null ? ref4.street : void 0) != null) {
    newQuery.interest.address.street = new RegExp('^' + reqQuery.interest.address.street + '$', "i");
  }
  if (((ref5 = reqQuery.interest.address) != null ? ref5.number : void 0) != null) {
    newQuery.interest.address.number = new RegExp('^' + reqQuery.interest.address.number + '$', "i");
  }
  if (((ref6 = reqQuery.interest.address) != null ? ref6.neighborhood : void 0) != null) {
    newQuery.interest.address.neighborhood = new RegExp('^' + reqQuery.interest.address.neighborhood + '$', "i");
  }
  if (((ref7 = reqQuery.interest.address) != null ? ref7.city : void 0) != null) {
    newQuery.interest.address.city = reqQuery.interest.address.city;
  }
  if (reqQuery.interest.hasSubway != null) {
    newQuery.interest.hasSubway = reqQuery.interest.hasSubway;
  }
  if (reqQuery.interest.subwayStation != null) {
    newQuery.interest.subwayStation = reqQuery.interest.subwayStation;
  }
  if (reqQuery.interest.value != null) {
    newQuery.interest.value = {
      $gte: reqQuery.interest.value.min,
      $lte: reqQuery.interest.value.max
    };
  }
  if (reqQuery.interest.condominium != null) {
    newQuery.interest.condominium = {
      $gte: reqQuery.interest.condominium.min,
      $lte: reqQuery.interest.condominium.max
    };
  }
  if (reqQuery.interest.iptu != null) {
    newQuery.interest.iptu = {
      $gte: reqQuery.interest.iptu.min,
      $lte: reqQuery.interest.iptu.max
    };
  }
  if (reqQuery.interest.location != null) {
    newQuery.interest.location = {
      $gte: reqQuery.interest.location.min,
      $lte: reqQuery.interest.location.max
    };
  }
  if (reqQuery.interest.payments != null) {
    newQuery.interest.payments = {
      $in: reqQuery.interest.payments
    };
  }
  if (reqQuery.interest.exchange != null) {
    newQuery.interest.exchange = reqQuery.interest.exchange;
  }
  if (reqQuery.interest.settled != null) {
    newQuery.interest.settled = reqQuery.interest.settled;
  }
  if (reqQuery.interest.difference != null) {
    newQuery.interest.difference = reqQuery.interest.difference;
  }
  if (reqQuery.interest.car != null) {
    newQuery.interest.car = reqQuery.interest.car;
  }
  if (reqQuery.interest.carValue != null) {
    newQuery.interest.carValue = reqQuery.interest.carValue;
  }
  return newQuery;
};

PropertySchema.methods.generateInterestQuery = function(reqQuery) {
  var newQuery, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
  newQuery = {};
  newQuery.interest = {};
  if (reqQuery.property.type != null) {
    newQuery.interest.type = {
      $or: reqQuery.property.type
    };
  }
  if (reqQuery.property.meters != null) {
    newQuery.interest.meters = {
      $gte: reqQuery.property.meters.min,
      $lte: reqQuery.property.meters.max
    };
  }
  if (reqQuery.property.vacancy != null) {
    newQuery.interest.vacancy = {
      $gte: reqQuery.property.vacancy.min,
      $lte: reqQuery.property.vacancy.max
    };
  }
  if (reqQuery.property.floor != null) {
    newQuery.interest.floor = {
      $gte: reqQuery.property.floor.min,
      $lte: reqQuery.property.floor.max
    };
  }
  if (((ref = reqQuery.property.address) != null ? ref.street : void 0) != null) {
    newQuery.interest.address.street = new RegExp('^' + reqQuery.property.address.street + '$', "i");
  }
  if (((ref1 = reqQuery.property.address) != null ? ref1.number : void 0) != null) {
    newQuery.interest.address.number = new RegExp('^' + reqQuery.property.address.number + '$', "i");
  }
  if (((ref2 = reqQuery.property.address) != null ? ref2.neighborhood : void 0) != null) {
    newQuery.interest.address.neighborhood = new RegExp('^' + reqQuery.property.address.neighborhood + '$', "i");
  }
  if (((ref3 = reqQuery.property.address) != null ? ref3.city : void 0) != null) {
    newQuery.interest.address.city = reqQuery.property.address.city;
  }
  if (reqQuery.property.hasSubway != null) {
    newQuery.interest.hasSubway = reqQuery.property.hasSubway;
  }
  if (reqQuery.property.subwayStation != null) {
    newQuery.interest.subwayStation = reqQuery.property.subwayStation;
  }
  if (reqQuery.property.value != null) {
    newQuery.interest.value = {
      $gte: reqQuery.property.value.min,
      $lte: reqQuery.property.value.max
    };
  }
  if (reqQuery.property.condominium != null) {
    newQuery.interest.condominium = {
      $gte: reqQuery.property.condominium.min,
      $lte: reqQuery.property.condominium.max
    };
  }
  if (reqQuery.property.iptu != null) {
    newQuery.interest.iptu = {
      $gte: reqQuery.property.iptu.min,
      $lte: reqQuery.property.iptu.max
    };
  }
  if (reqQuery.property.location != null) {
    newQuery.interest.location = {
      $gte: reqQuery.property.location.min,
      $lte: reqQuery.property.location.max
    };
  }
  if (reqQuery.property.payments != null) {
    newQuery.interest.payments = {
      $in: reqQuery.property.payments
    };
  }
  if (reqQuery.property.exchange != null) {
    newQuery.interest.exchange = reqQuery.property.exchange;
  }
  if (reqQuery.property.settled != null) {
    newQuery.interest.settled = reqQuery.property.settled;
  }
  if (reqQuery.property.difference != null) {
    newQuery.interest.difference = reqQuery.property.difference;
  }
  if (reqQuery.property.car != null) {
    newQuery.interest.car = reqQuery.property.car;
  }
  if (reqQuery.property.carValue != null) {
    newQuery.interest.carValue = reqQuery.property.carValue;
  }
  if (reqQuery.interest.type != null) {
    newQuery.interest.type = {
      $or: reqQuery.interest.type
    };
  }
  if (reqQuery.interest.meters != null) {
    newQuery.meters = {
      $gte: reqQuery.interest.meters.min,
      $lte: reqQuery.interest.meters.max
    };
  }
  if (reqQuery.interest.vacancy != null) {
    newQuery.vacancy = {
      $gte: reqQuery.interest.vacancy.min,
      $lte: reqQuery.interest.vacancy.max
    };
  }
  if (reqQuery.interest.floor != null) {
    newQuery.floor = {
      $gte: reqQuery.interest.floor.min,
      $lte: reqQuery.interest.floor.max
    };
  }
  if (((ref4 = reqQuery.interest.address) != null ? ref4.street : void 0) != null) {
    newQuery.address.street = new RegExp('^' + reqQuery.interest.address.street + '$', "i");
  }
  if (((ref5 = reqQuery.interest.address) != null ? ref5.number : void 0) != null) {
    newQuery.address.number = new RegExp('^' + reqQuery.interest.address.number + '$', "i");
  }
  if (((ref6 = reqQuery.interest.address) != null ? ref6.neighborhood : void 0) != null) {
    newQuery.address.neighborhood = new RegExp('^' + reqQuery.interest.address.neighborhood + '$', "i");
  }
  if (((ref7 = reqQuery.interest.address) != null ? ref7.city : void 0) != null) {
    newQuery.address.city = reqQuery.interest.address.city;
  }
  if (reqQuery.interest.hasSubway != null) {
    newQuery.hasSubway = reqQuery.interest.hasSubway;
  }
  if (reqQuery.interest.subwayStation != null) {
    newQuery.subwayStation = reqQuery.interest.subwayStation;
  }
  if (reqQuery.interest.value != null) {
    newQuery.value = {
      $gte: reqQuery.interest.value.min,
      $lte: reqQuery.interest.value.max
    };
  }
  if (reqQuery.interest.condominium != null) {
    newQuery.condominium = {
      $gte: reqQuery.interest.condominium.min,
      $lte: reqQuery.interest.condominium.max
    };
  }
  if (reqQuery.interest.iptu != null) {
    newQuery.iptu = {
      $gte: reqQuery.interest.iptu.min,
      $lte: reqQuery.interest.iptu.max
    };
  }
  if (reqQuery.interest.location != null) {
    newQuery.location = {
      $gte: reqQuery.interest.location.min,
      $lte: reqQuery.interest.location.max
    };
  }
  if (reqQuery.interest.payments != null) {
    newQuery.payments = {
      $in: reqQuery.interest.payments
    };
  }
  if (reqQuery.interest.exchange != null) {
    newQuery.exchange = reqQuery.interest.exchange;
  }
  if (reqQuery.interest.settled != null) {
    newQuery.settled = reqQuery.interest.settled;
  }
  if (reqQuery.interest.difference != null) {
    newQuery.difference = reqQuery.interest.difference;
  }
  if (reqQuery.interest.car != null) {
    newQuery.car = reqQuery.interest.car;
  }
  if (reqQuery.interest.carValue != null) {
    newQuery.carValue = reqQuery.interest.carValue;
  }
  return newQuery;
};

module.exports = mongoose.model('Property', PropertySchema);
