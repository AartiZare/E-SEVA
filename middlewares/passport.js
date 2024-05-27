import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { signJWT } from '../utils/sign_jwt.js';
import db from '../models/index.js';
const userModel = db.Users;

// Replace these values with your actual secret and issuer
export const secretKey = 'time-tracker';
const issuer = 'TIME_TRACKER';

export const genToken = (user, type) => {
  return signJWT(
    {
      iss: issuer,
      sub: user.id,
      type,
    },
    '6h'
  );
};

const jwtOptions = {
  secretOrKey: secretKey,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  let user;
  try {
 
    user = await userModel.findByPk(payload.sub);

    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
