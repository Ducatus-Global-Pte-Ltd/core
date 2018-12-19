import logger from '../logger';
import * as express from 'express';

type TimedRequest = {
  startTime?: Date;
} & express.Request;

function LogObj(logOut: { [key: string]: string }) {
  logger.info(
    `${logOut.time} | ${logOut.ip} | ${logOut.phase} | ${logOut.took} | ${logOut.method} | ${logOut.status} | ${
      logOut.url
    }`
  );
}

export function LogRequest(req: TimedRequest, res: express.Response, next: express.NextFunction) {
  req.startTime = new Date();
  const ip = req.header('CF-Connecting-IP') || req.socket.remoteAddress || req.hostname;
  const logOut = {
    time: req.startTime.toTimeString(),
    ip: ip.padStart(12, ' '),
    phase: 'START'.padStart(8, ' '),
    method: req.method.padStart(6, ' '),
    status: '...'.padStart(5, ' '),
    url: `${req.baseUrl}${req.url}`,
    took: '...'.padStart(10, ' ')
  };
  LogObj(logOut);

  const logClose = (phase: string) => () => {
    const endTime = new Date();
    const startTime = req.startTime ? req.startTime : endTime;
    const totalTime = endTime.getTime() - startTime.getTime();
    const totalTimeMsg = `${totalTime} ms`;
    logOut.phase = phase.padStart(8, ' ');
    logOut.took = totalTimeMsg.padStart(10, ' ');
    logOut.status = res.statusCode.toString().padStart(5, ' ');
    LogObj(logOut);
  };

  res.on('finish', logClose('END'));
  res.on('close', logClose('CLOSED'));
  next();
}
