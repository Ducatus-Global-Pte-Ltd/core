var $ = require('preconditions').singleton();
const URL = require('url');
const _ = require('lodash');
var Bitcore = require('bitcore-lib');
var Bitcore_ = {
  btc: Bitcore,
  bch: require('bitcore-lib-cash'),
};
const JSON_PAYMENT_REQUEST_CONTENT_TYPE = 'application/payment-request';
const JSON_PAYMENT_VERIFY_CONTENT_TYPE = 'application/verify-payment';
const JSON_PAYMENT_CONTENT_TYPE = 'application/payment';
const JSON_PAYMENT_ACK_CONTENT_TYPE = 'application/payment-ack';


const dfltTrustedKeys = require('../util/JsonPaymentProtocolKeys.js');


var PayPro = {};

PayPro._nodeRequest = function(opts, cb) {
  opts.agent = false;

  var http = opts.httpNode || (opts.proto === 'http' ? require("http") : require("https"));

  const url =  URL.parse(opts.url);
  let ropts = {
    headers: opts.headers,
    method: opts.method || 'GET',
    hostname: url.host,
    port:url.port ||  (opts.proto === 'http' ? 80 : 443),
    path:url.path,
    protocol: url.protocol,
    agent: false,
  };

  var req  = http.request(ropts, function(res) {
    var data = []; // List of Buffer objects

    if (res.statusCode != 200)
      return cb(new Error('HTTP Request Error: '  + res.statusCode + ' ' + res.statusMessage + ' ' +  ( data ? data : '' )  ));

    res.on("data", function(chunk) {
      data.push(chunk); // Append Buffer object
    });
    res.on("end", function() {
      data = Buffer.concat(data); // Make one large Buffer of it
      return cb(null, data, res.headers);
    });
  });

  req.on("error", function(error) {
    return cb(error);
  });

  if (opts.body) 
    req.write(opts.body);

  req.end();
};

PayPro._browserRequest = function(opts, cb) {

  var method = (opts.method || 'GET').toUpperCase();
  var url = opts.url;
  var req = opts;

  req.headers = req.headers || {};
  req.body = req.body || req.data || '';

  var xhr = opts.xhr || new XMLHttpRequest();
  xhr.open(method, url, true);

  Object.keys(req.headers).forEach(function(key) {
    var val = req.headers[key];
    if (key === 'Content-Length') return;
    if (key === 'Content-Transfer-Encoding') return;
    xhr.setRequestHeader(key, val);
  });
  xhr.responseType = 'arraybuffer';

  xhr.onload = function(event) {
    var response = xhr.response;
    if (xhr.status == 200) {
console.log('[paypro.js.80:xhr:]',xhr); //TODO
      return cb(null, Buffer.from(response), xhr.headers);
    } else {
      return cb('HTTP Request Error: '  + xhr.status + ' ' + xhr.statusText + ' ' + response ? response : '');
    }
  };

  xhr.onerror = function(event) {
    var status;
    if (xhr.status === 0 || !xhr.statusText) {
      status = 'HTTP Request Error';
    } else {
      status = xhr.statusText;
    }
    return cb(new Error(status));
  };

  if (req.body) {
    xhr.send(req.body);
  } else {
    xhr.send(null);
  }
};

var getHttp = function(opts) {
  var match = opts.url.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);

  opts.proto = RegExp.$2;
  opts.host = RegExp.$3;
  opts.path = RegExp.$4 + RegExp.$6;

  if (opts.http) {
    return opts.http;
  }

  var env = opts.env;
  if (!env)
    env = (process && !process.browser) ? 'node' : 'browser';

  return (env == "node") ? PayPro._nodeRequest : http = PayPro._browserRequest;;
};

const MAX_FEE_PER_KB = 500000;


/**
 * Verifies the signature of a given payment request is both valid and from a trusted key
 * @param requestUrl {String} The url used to fetch this payment request
 * @param paymentRequest {Object} The payment request object returned by parsePaymentRequest
 * @param trustedKeys {Object} An object containing all keys trusted by this client
 * @param callback {function} If no error is returned callback will contain the owner of the key which signed this request (ie BitPay Inc.)
 */
PayPro._verify = function (requestUrl, paymentRequest, trustedKeys, callback) {
  let hash = paymentRequest.headers.digest.split('=')[1];
  let signature = paymentRequest.headers.signature;
  let signatureType = paymentRequest.headers['x-signature-type'];
  let identity = paymentRequest.headers['x-identity'];
  let host;

  if (!requestUrl) {
    return callback(new Error('You must provide the original payment request url'));
  }
  if (!trustedKeys) {
    return callback(new Error('You must provide a set of trusted keys'))
  }

  try {
    host = url.parse(requestUrl).hostname;
  }
  catch(e) {}

  if (!host) {
    return callback(new Error('Invalid requestUrl'));
  }
  if (!signatureType) {
    return callback(new Error('Response missing x-signature-type header'));
  }
  if (typeof signatureType !== 'string') {
    return callback(new Error('Invalid x-signature-type header'));
  }
  if (signatureType !== 'ecc') {
    return callback(new Error(`Unknown signature type ${signatureType}`))
  }
  if (!signature) {
    return callback(new Error('Response missing signature header'));
  }
  if (typeof signature !== 'string') {
    return callback(new Error('Invalid signature header'));
  }
  if (!identity) {
    return callback(new Error('Response missing x-identity header'));
  }
  if (typeof identity !== 'string') {
    return callback(new Error('Invalid identity header'));
  }
console.log('[paypro.js.173:identity:]',identity); //TODO

  if (!trustedKeys[identity]) {
    return callback(new Error(`Response signed by unknown key (${identity}), unable to validate`));
  }

  let keyData = trustedKeys[identity];
  if (keyData.domains.indexOf(host) === -1) {
    return callback(new Error(`The key on the response (${identity}) is not trusted for domain ${host}`));
  } else if (!keyData.networks.includes(paymentRequest.network)) {
    return callback(new Error(`The key on the response is not trusted for transactions on the '${paymentRequest.network}' network`));
  }

  let valid = Bitcore.crypto.ECDSA.verify(
    Buffer.from(hash, 'hex'),
    Buffer.from(signature, 'hex'),
    Buffer.from(keyData.publicKey, 'hex'),
    'little',
  );
console.log('[paypro.js.188:valid:]',valid); //TODO

  if (!valid) {
    return callback(new Error('Response signature invalid'));
  }

  return callback(null, keyData.owner);
};



PayPro.get = function(opts, cb) {
  $.checkArgument(opts && opts.url);
  opts.trustedKeys = opts.trustedKeys || dlftTrustedKeys;

  var http = getHttp(opts);
  var coin = opts.coin || 'btc';
  var bitcore = Bitcore_[coin];

  var COIN = coin.toUpperCase();
  opts.headers = opts.headers || {
    'Accept': JSON_PAYMENT_REQUEST_CONTENT_TYPE,
    'Content-Type': 'application/octet-stream',
  };

  http(opts, function(err, data, headers) {
    if (err) return cb(err);
    try {
      data = JSON.parse(data.toString());

    } catch (e)  {
      return cb({message: 'Could not parse payment request:' + e});
    }
    // read and check
    let ret = {};
    ret.url = opts.url;

    if (!headers.digest) {
      return cb(new Error('Digest missing from response headers'));
    }

    let digest = headers.digest.split('=')[1];
console.log('[paypro.js.237:rawBody:]',data); //TODO
    let hash = Bitcore.crypto.hash.sha256(data).toString('hex');

    if (digest !== hash) {
      return callback(new Error(`Response body hash does not match digest header. Actual: ${hash} Expected: ${digest}`));
    }

    PayPro._verify(opts.url, data, headers, opts.trustedKeys, (err) => {
console.log('[paypro.js.243:err:]',err); //TODO
      if (err) return cb(err);
 
      ret.verified= 1;

      // network
      if(data.network == 'test') 
        ret.network = 'testnet';

      if(data.network == 'live') 
        ret.network = 'livenet';

      if ( !data.network )
        return cb(new Error('No network at payment request'));

      //currency
      if ( data.currency != COIN )
        return cb(new Error('Currency mismatch. Expecting:' + COIN));

      ret.coin = coin;


      //fee
      if ( data.requiredFeeRate > MAX_FEE_PER_KB)
        return cb(new Error('Fee rate too high:' +data.requiredFeeRate));

      ret.requiredFeeRate = data.requiredFeeRate;

      //outputs
      if (!data.outputs || data.outputs.length !=1) {
        return cb(new Error('Must have 1 output'));
      }

      if (!_.isNumber(data.outputs[0].amount) ) {
        return cb(new Error('Bad output amount ' + e));
      }
      ret.amount = data.outputs[0].amount;

      try {
        ret.toAddress = (new bitcore.Address(data.outputs[0].address)).toString();
      } catch (e) {
        return cb(new Error('Bad output address '+ e));
      }
      
      ret.memo = data.memo;
      ret.paymentId = data.paymentId;
      try {
        ret.expires = (new Date(data.expires)).toISOString();
      } catch (e) {
        return cb(new Error('Bad expiration'));
      }

      return cb(null, ret);
    });
  });
};



PayPro.send = function(opts, cb) {
  $.checkArgument(opts.rawTxUnsigned)
    .checkArgument(opts.url)
    .checkArgument(opts.rawTx);


  var coin = opts.coin || 'btc';
  var COIN = coin.toUpperCase();

  var http = getHttp(opts);
  opts.method = 'POST';
  opts.headers = opts.headers || {
    'Content-Type': JSON_PAYMENT_VERIFY_CONTENT_TYPE,
  };
  let size = opts.rawTx.length/2;
  opts.body = JSON.stringify({
    "currency": COIN,
    "unsignedTransaction": opts.rawTxUnsigned,
    "weightedSize": size,
  });

  // verify request
  http(opts, function(err, rawData) {
    if (err) {
      console.log('Error at verify-payment:', err, opts);
      return cb(err);
    }

    opts.headers = {
      'Content-Type': JSON_PAYMENT_CONTENT_TYPE,
      'Accept': JSON_PAYMENT_ACK_CONTENT_TYPE,
    };

    opts.body = JSON.stringify({
      "currency": COIN,
      "transactions": [
        opts.rawTx,
      ],
    });

    http(opts, function(err, rawData) {
      if (err) {
        console.log('Error at payment:', err, opts);
        return cb(err);
      }
  
      var memo;
      if (rawData) {
        try {
          var data = JSON.parse(rawData.toString());
          memo = data.memo;
        } catch (e) {
          console.log('Could not decode paymentACK');
        };
      }
      return cb(null, rawData, memo);
    });
  });
};

module.exports = PayPro;
