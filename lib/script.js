'use strict';

var BufferReader = require('./encoding/bufferreader');
var BufferWriter = require('./encoding/bufferwriter');
var Opcode = require('./opcode');

var Script = function Script(from) {
  if (!(this instanceof Script)) {
    return new Script(from);
  }

  this.chunks = [];

  if (Buffer.isBuffer(from)) {
    return Script.fromBuffer(from);
  } else if (typeof from === 'string') {
    return Script.fromString(from);
  } else if (typeof from !== 'undefined') {
    this.set(from);
  }
};

Script.prototype.set = function(obj) {
  this.chunks = obj.chunks || this.chunks;
  return this;
};

Script.fromBuffer = function(buffer) {
  var script = new Script();
  script.chunks = [];

  var br = new BufferReader(buffer);
  while (!br.eof()) {
    var opcodenum = br.readUInt8();

    var len, buf;
    if (opcodenum > 0 && opcodenum < Opcode.map.OP_PUSHDATA1) {
      len = opcodenum;
      script.chunks.push({
        buf: br.read(len),
        len: len,
        opcodenum: opcodenum
      });
    } else if (opcodenum === Opcode.map.OP_PUSHDATA1) {
      len = br.readUInt8();
      buf = br.read(len);
      script.chunks.push({
        buf: buf,
        len: len,
        opcodenum: opcodenum
      });
    } else if (opcodenum === Opcode.map.OP_PUSHDATA2) {
      len = br.readUInt16LE();
      buf = br.read(len);
      script.chunks.push({
        buf: buf,
        len: len,
        opcodenum: opcodenum
      });
    } else if (opcodenum === Opcode.map.OP_PUSHDATA4) {
      len = br.readUInt32LE();
      buf = br.read(len);
      script.chunks.push({
        buf: buf,
        len: len,
        opcodenum: opcodenum
      });
    } else {
      script.chunks.push(opcodenum);
    }
  }

  return script;
};

Script.prototype.toBuffer = function() {
  var bw = new BufferWriter();

  for (var i = 0; i < this.chunks.length; i++) {
    var chunk = this.chunks[i];
    var opcodenum;
    if (typeof chunk === 'number') {
      opcodenum = chunk;
      bw.writeUInt8(opcodenum);
    } else {
      opcodenum = chunk.opcodenum;
      bw.writeUInt8(chunk.opcodenum);
      if (opcodenum < Opcode.map.OP_PUSHDATA1) {
        bw.write(chunk.buf);
      } else if (opcodenum === Opcode.map.OP_PUSHDATA1) {
        bw.writeUInt8(chunk.len);
        bw.write(chunk.buf);
      } else if (opcodenum === Opcode.map.OP_PUSHDATA2) {
        bw.writeUInt16LE(chunk.len);
        bw.write(chunk.buf);
      } else if (opcodenum === Opcode.map.OP_PUSHDATA4) {
        bw.writeUInt32LE(chunk.len);
        bw.write(chunk.buf);
      }
    }
  }

  return bw.concat();
};

Script.fromString = function(str) {
  var script = new Script();
  script.chunks = [];

  var tokens = str.split(' ');
  var i = 0;
  while (i < tokens.length) {
    var token = tokens[i];
    var opcode = Opcode(token);
    var opcodenum = opcode.toNumber();

    if (typeof opcodenum === 'undefined') {
      opcodenum = parseInt(token);
      if (opcodenum > 0 && opcodenum < Opcode.map.OP_PUSHDATA1) {
        script.chunks.push({
          buf: new Buffer(tokens[i + 1].slice(2), 'hex'),
          len: opcodenum,
          opcodenum: opcodenum
        });
        i = i + 2;
      } else {
        throw new Error('Invalid script');
      }
    } else if (opcodenum === Opcode.map.OP_PUSHDATA1 ||
      opcodenum === Opcode.map.OP_PUSHDATA2 ||
      opcodenum === Opcode.map.OP_PUSHDATA4) {
      if (tokens[i + 2].slice(0, 2) !== '0x') {
        throw new Error('Pushdata data must start with 0x');
      }
      script.chunks.push({
        buf: new Buffer(tokens[i + 2].slice(2), 'hex'),
        len: parseInt(tokens[i + 1]),
        opcodenum: opcodenum
      });
      i = i + 3;
    } else {
      script.chunks.push(opcodenum);
      i = i + 1;
    }
  }
  return script;
};

Script.prototype.toString = function() {
  var str = '';

  for (var i = 0; i < this.chunks.length; i++) {
    var chunk = this.chunks[i];
    var opcodenum;
    if (typeof chunk === 'number') {
      opcodenum = chunk;
      str = str + Opcode(opcodenum).toString() + ' ';
    } else {
      opcodenum = chunk.opcodenum;
      if (opcodenum === Opcode.map.OP_PUSHDATA1 ||
        opcodenum === Opcode.map.OP_PUSHDATA2 ||
        opcodenum === Opcode.map.OP_PUSHDATA4) {
        str = str + Opcode(opcodenum).toString() + ' ';
      }
      str = str + chunk.len + ' ';
      str = str + '0x' + chunk.buf.toString('hex') + ' ';
    }
  }

  return str.substr(0, str.length - 1);
};



// script classification methods

/**
 * @returns true if this is a pay to pubkey hash output script
 */
Script.prototype.isPublicKeyHashOut = function() {
  return this.chunks[0] === Opcode('OP_DUP').toNumber() &&
    this.chunks[1] === Opcode('OP_HASH160').toNumber() &&
    this.chunks[2].buf &&
    this.chunks[3] === Opcode('OP_EQUALVERIFY').toNumber() &&
    this.chunks[4] === Opcode('OP_CHECKSIG').toNumber();
};

/**
 * @returns true if this is a pay to public key hash input script
 */
Script.prototype.isPublicKeyHashIn = function() {
  return !!(this.chunks.length === 2 &&
    this.chunks[0].buf &&
    this.chunks[1].buf);
};

/**
 * @returns true if this is a p2sh output script
 */
Script.prototype.isScriptHashOut = function() {
  return this.chunks.length === 3 &&
    this.chunks[0] === Opcode('OP_HASH160').toNumber() &&
    this.chunks[1].buf &&
    this.chunks[1].buf.length === 20 &&
    this.chunks[2] === Opcode('OP_EQUAL').toNumber();
};

/** 
 * @returns true if this is a p2sh input script
 * Note that these are frequently indistinguishable from pubkeyhashin
 */
Script.prototype.isScriptHashIn = function() {
  return this.chunks.every(function(chunk) {
    return Buffer.isBuffer(chunk.buf);
  });
};

/**
 * @returns true if this is a mutlsig output script
 */
Script.prototype.isMultisigOut = function() {
  return (this.chunks.length > 3 &&
    Opcode.isSmallIntOp(this.chunks[0]) &&
    this.chunks.slice(1, this.chunks.length - 2).every(function(obj) {
      return obj.buf && Buffer.isBuffer(obj.buf);
    }) &&
    Opcode.isSmallIntOp(this.chunks[this.chunks.length - 2]) &&
    this.chunks[this.chunks.length - 1] === Opcode.map.OP_CHECKMULTISIG);
};

/**
 * @returns true if this is an OP_RETURN data script
 */
Script.prototype.isOpReturn = function() {
  return (this.chunks[0] === Opcode('OP_RETURN').toNumber() &&
    (this.chunks.length === 1 ||
      (this.chunks.length === 2 &&
        this.chunks[1].buf &&
        this.chunks[1].buf.length <= 40 &&
        this.chunks[1].length === this.chunks.len)));
};


// Script construction methods

/**
 * Adds a script element at the start of the script.
 * @param {*} obj a string, number, Opcode, Bufer, or object to add
 * @returns {Script} this script instance
 */
Script.prototype.prepend = function(obj) {
  this._addByType(obj, true);
  return this;
};

/**
 * Adds a script element to the end of the script.
 *
 * @param {*} obj a string, number, Opcode, Bufer, or object to add
 * @returns {Script} this script instance
 *
 */
Script.prototype.add = function(obj) {
  this._addByType(obj, false);
  return this;
};

Script.prototype._addByType = function(obj, prepend) {
  if (typeof obj === 'string') {
    this._addOpcode(obj, prepend);
  } else if (typeof obj === 'number') {
    this._addOpcode(obj, prepend);
  } else if (obj.constructor && obj.constructor.name && obj.constructor.name === 'Opcode') {
    this._addOpcode(obj, prepend);
  } else if (Buffer.isBuffer(obj)) {
    this._addBuffer(obj, prepend);
  } else if (typeof obj === 'object') {
    this._insertAtPosition(obj, prepend);
  } else {
    throw new Error('Invalid script chunk');
  }
};

Script.prototype._insertAtPosition = function(op, prepend) {
  if (prepend) {
    this.chunks.unshift(op);
  } else {
    this.chunks.push(op);
  }
};

Script.prototype._addOpcode = function(opcode, prepend) {
  var op;
  if (typeof opcode === 'number') {
    op = opcode;
  } else if (opcode.constructor && opcode.constructor.name && opcode.constructor.name === 'Opcode') {
    op = opcode.toNumber();
  } else {
    op = Opcode(opcode).toNumber();
  }
  this._insertAtPosition(op, prepend);
  return this;
};

Script.prototype._addBuffer = function(buf, prepend) {
  var opcodenum;
  var len = buf.length;
  if (buf.length > 0 && buf.length < Opcode.map.OP_PUSHDATA1) {
    opcodenum = buf.length;
  } else if (buf.length < Math.pow(2, 8)) {
    opcodenum = Opcode.map.OP_PUSHDATA1;
  } else if (buf.length < Math.pow(2, 16)) {
    opcodenum = Opcode.map.OP_PUSHDATA2;
  } else if (buf.length < Math.pow(2, 32)) {
    opcodenum = Opcode.map.OP_PUSHDATA4;
  } else {
    throw new Error('You can\'t push that much data');
  }
  this._insertAtPosition({
    buf: buf,
    len: len,
    opcodenum: opcodenum
  }, prepend);
  return this;
};

module.exports = Script;
