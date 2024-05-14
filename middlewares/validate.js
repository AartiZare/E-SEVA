import Joi from 'joi';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { error, value } = Joi.object(validSchema)
    .prefs({ errors: { label: 'key' } })
    .validate(object);
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    const apiError = new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    return next(apiError);
  }
  Object.assign(req, value);
  return next();
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || httpStatus[statusCode];
  res.status(statusCode).json({ error: message });
};
