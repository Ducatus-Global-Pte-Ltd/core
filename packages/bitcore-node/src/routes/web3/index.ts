import * as express from 'express';
import { Config } from '../../services/config';
import request from 'request';

export function Web3Proxy(req: express.Request, res: express.Response) {
  const { chain, network } = req.params;
  const chainConfig = Config.chainConfig({ chain, network });
  const { host, port } = chainConfig.rpc;
  const url = `http://${host}:${port}`;
  let requestStream;
  if (req.body.jsonrpc) {
    const options = {
      uri: url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      method: req.method,
      body: JSON.stringify(req.body),
      json: true
    };
    requestStream = request(options);
  } else {
    requestStream = req.pipe(request(url));
  }
  requestStream
    .on('error', e => console.log(e))
    .pipe(res);
}
