import jwt from 'jsonwebtoken';
const secretKey = 'time-tracker';

export const signJWT = (data, expiry) => {
  return jwt.sign(
    data,
    secretKey,
    expiry
      ? {
          expiresIn: expiry,
        }
      : {}
  );
};
