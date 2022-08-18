const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  /*
    token attached to header is a choice here,
    because not all kinds of request has payload and 
    there is no way to set the token in param 
    */
  let token;
  try {
    token = req.headers.authorization.split(' ')[1]; //authorization:'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed');
    }
    // verify token
    const decodedToken = jwt.verify(token, 'supersecret_dont_share'); // return the payload encoded into the token
    // append the user id into request and pass it to the next middleware
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError('Authentication failed', 401));
  }
};
