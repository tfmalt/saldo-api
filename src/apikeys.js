/**
 * A very simple api key middleware for express.
 * Looks for a static list of valid api keys in keys.json (a simple Array)
 * Aiming for
 */
const { keys } = require('./config');

function unauthorized(res) {
  return res
    .status(401)
    .json({
      error: 'Unauthorized',
      message: 'Request missing valid credentials'
    })
    .end();
}

module.exports = (req, res, next) => {
  if (!req.headers.hasOwnProperty('authorization')) {
    return unauthorized(res);
  }

  const token = req.headers.authorization.split(' ')[1];
  console.log('token:', token);

  if (keys.includes(token)) {
    return next();
  }

  return unauthorized(res);
};
