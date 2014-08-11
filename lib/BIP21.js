'use strict';

// BIP21
// =======
// Helper for parsing and building bitcoin: URIs
//
// Examples:
// =======
//  var uriString = 'bitcoin:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?message=Hey%20there&amount=1.212';
//
//  var uri = new BIP21(uriString);
//  uri.isValid() // true
//  uri.address // bitcore.Address object
//  uri.data.message // 'Hey there'
//  uri.data.amount // 1.212
//
//  uriString = new BIP21({
//    address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
//    message: 'Hey there',
//    amount: 1.212
//  }).getURI();


var URL = require('url');
var Address = require('./Address');

var BIP21 = function(arg) {
  this.data = {};
  this.address = undefined;

  if (typeof(arg) == 'string') {
    this.parse(arg);
  } else if (typeof(arg) == 'object') {
    this.fromObj(arg);
  } else if (typeof(arg) != 'undefined') {
    throw new Error('Invalid argument');
  }
}

BIP21.prototype.fromObj = function(obj) {
  for (var key in obj) {
    this.data[key] = obj[key];
  }

  if (obj.address) {
    delete this.data.address;
    this.setAddress(obj.address);
  }
}

BIP21.prototype.parse = function(uri) {
  var info = URL.parse(uri, true);

  if (info.protocol != 'bitcoin:') {
    throw new Error('Invalid protocol');
  }

  // workaround to host insensitiveness
  var group = uri.match('[^:]*:/?/?([^?]*)');
  this.setAddress(group && group[1]);

  for (var arg in info.query) {
    var val = info.query[arg];
    if (arg == 'amount') val = Number(val);
    this.data[arg] = val;
  }
}

BIP21.prototype.isValid = function() {
  var valid = true;

  if (typeof(this.data.amount) != 'undefined') {
    valid &= !isNaN(this.data.amount);
  }

  if (this.address) {
    valid &= typeof(this.address) == 'object' && this.address.isValid();
  }

  // Require address or PayPro info
  valid &= !!(this.address || this.data.r);

  return !!valid;
}

BIP21.prototype.setAddress = function(addr) {
  if (addr) {
    this.address = Address.validate(addr) ? new Address(addr) : addr;
  }

  return this;
}

BIP21.prototype.getURI = function() {
  if (!this.isValid()) throw new Error('Invalid state');
  
  return URL.format({
    protocol: 'bitcoin:',
    host: this.address,
    query: this.data
  });
}

module.exports = BIP21;
