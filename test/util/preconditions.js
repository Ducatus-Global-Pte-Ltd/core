'use strict';

var errors = require('../../lib/errors');
var $ = require('../../lib/util/preconditions');
var PrivateKey = require('../../lib/privatekey');

describe('preconditions', function() {

  it('can be used to assert state', function() {
    (function() {
      $.checkState(false, 'testing');
    }).should.throw(errors.InvalidState);
  });
  it('throws no false negative', function() {
    (function() {
      $.checkState(true, 'testing');
    }).should.not.throw();
  });

  it('can be used to check an argument', function() {
    (function() {
      $.checkArgument(false, 'testing');
    }).should.throw(errors.InvalidArgument);

    (function() {
      $.checkArgument(true, 'testing');
    }).should.not.throw(errors.InvalidArgument);
  });

  it('can be used to check an argument type', function() {
    var error;
    try {
      $.checkArgumentType(1, 'string', 'argumentName');
    } catch (e) {
      error = e;
      e.message.should.equal('Invalid Argument for argumentName, expected string but got number');
    }
    error.should.exist();
  });
  it('has no false negatives when used to check an argument type', function() {
    (function() {
      $.checkArgumentType('a String', 'string', 'argumentName');
    }).should.not.throw();
  });

  it('can be used to check an argument type for a class', function() {
    var error;
    try {
      $.checkArgumentType(1, PrivateKey);
    } catch (e) {
      error = e;
      e.message.should.equal('Invalid Argument for (unknown name), expected PrivateKey but got number');
    }
    error.should.exist();
  });
  it('has no false negatives when checking a type for a class', function() {
    (function() {
      $.checkArgumentType(new PrivateKey(), PrivateKey);
    }).should.not.throw();
  });
});
