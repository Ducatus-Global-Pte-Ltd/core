#!/usr/bin/env node

var ExpressApp = require('./lib/expressapp');

var basePath = process.env.BWS_BASE_PATH || '/bws/api';
var port = process.env.BWS_PORT || 3001;

var app = ExpressApp.start({
  basePath: basePath,
});
app.listen(port);

console.log('Bitcore Wallet Service running on port ' + port);
