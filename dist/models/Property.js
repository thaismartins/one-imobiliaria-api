'use strict';
var PropertySchema, Schema, config, mongoose, setCEP, setOnlyNumbers, setValue;

mongoose = require('mongoose');

Schema = mongoose.Schema;

config = require('../config');

setValue = function(value) {
  var finalValue, newValue;
  newValue = value.toString().replace(/[^0-9]+/g, "");
  finalValue = newValue.toString().slice(0, -2) + '.' + newValue.toString().slice(-2);
  if (finalValue === '.') {
    return '';
  }
  return Number(finalValue);
};

setOnlyNumbers = function(value) {
  return Number(value.toString().replace(/[^0-9]+/g, ""));
};

setCEP = function(value) {
  var newValue;
  newValue = value.toString().replace(/[^0-9]+/g, "");
  if (newValue === '') {
    return '';
  }
  return newValue.toString().slice(0, -3) + '-' + newValue.toString().slice(-3);
};

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
      required: true,
      set: setCEP
    },
    lat: {
      type: String
    },
    lng: {
      type: String
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
        "enum": ['house', 'apartment', 'car', 'others']
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
      city: {
        type: String
      },
      state: {
        type: String
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
  address = obj.address.street + ', ';
  address += obj.address.number + ' setValue- ';
  address += obj.address.neighborhood + ', ';
  address += obj.address.city + ' - ';
  address += obj.address.state + ', ';
  address += obj.address.cep + ', Brazil';
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
  var errors, obj;
  obj = this.toObject();
  errors = [];
  if ((this.code == null) || typeof this.code !== 'string') {
    errors.push('Code');
  }
  if ((this.type == null) || typeof this.type !== 'string') {
    errors.push('Type');
  }
  if ((this.address.street == null) || typeof this.address.street !== 'string') {
    errors.push('Street');
  }
  if ((this.address.number == null) || typeof this.address.number !== 'string') {
    errors.push('Number');
  }
  if ((this.address.neighborhood == null) || typeof this.address.neighborhood !== 'string') {
    errors.push('Neighborhood');
  }
  if ((this.address.city == null) || typeof this.address.city !== 'string') {
    errors.push('City');
  }
  if ((this.address.state == null) || typeof this.address.state !== 'string') {
    errors.push('State');
  }
  if ((this.address.cep == null) || this.address.cep === '') {
    errors.push('CEP');
  }
  if ((this.value == null) || this.value === '') {
    errors.push('Value');
  }
  return errors;
};

module.exports = mongoose.model('Property', PropertySchema);
