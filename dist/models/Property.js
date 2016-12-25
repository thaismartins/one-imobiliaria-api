'use strict';
var PropertySchema, Schema, config, mongoose;

mongoose = require('mongoose');

Schema = mongoose.Schema;

config = require('../config');

PropertySchema = new Schema({
  type: {
    type: String,
    required: true
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
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    cep: {
      type: String,
      required: true
    }
  },
  floor: {
    type: String
  },
  vacancy: {
    type: Number
  },
  meters: {
    type: Number
  },
  hasSubway: {
    type: Boolean
  },
  subwayStation: {
    type: String
  },
  value: {
    type: Number
  },
  condominium: {
    type: Number
  },
  iptu: {
    type: Number
  },
  location: {
    type: Number
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

module.exports = mongoose.model('Property', PropertySchema);
