/**
 * A very simple api key middleware for express.
 * Looks for a static list of valid api keys in keys.json (a simple Array)
 * Aiming for
 */
const keys = require('./keys.json');

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  console.log('token:', token);

  if (keys.includes(token)) {
    next();
    return;
  }
  res
    .status(401)
    .json({
      error: 'Unauthorized',
      message: 'Request missing valid credentials',
    })
    .end();
};
