import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';

const { authenticate } = passport
const { UNAUTHORIZED } = httpStatus

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(UNAUTHORIZED, 'Token Expired!'));
  }
  req.user = user;
  resolve();
};

const auth = (role) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, role))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

export default auth;
 