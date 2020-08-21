/**
 * A very simple api key middleware for express.
 * Looks for a static list of valid api keys in keys.json (a simple Array)
 * Aiming for
 */
import { keys } from './Config';
import express, { NextFunction } from 'express';

function unauthorized(res: express.Response): void {
  return res
    .set('Access-Control-Allow-Origin', '*')
    .status(401)
    .json({
      error: 'Unauthorized',
      message: 'Request missing valid credentials'
    })
    .end();
}

export default (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const token: string =
    typeof req.query.apikey === 'string'
      ? req.query.apikey
      : typeof req.headers.authorization === 'string'
      ? req.headers.authorization.split(' ')[1]
      : '';

  console.log('token:', token);
  console.log('keys', keys);

  if (keys.includes(token)) {
    return next();
  }

  return unauthorized(res);
};
