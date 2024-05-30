// import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { signJWT } from '../utils/sign_jwt.js';
// import db from '../models/index.js';
// const userModel = db.Users;

// // Replace these values with your actual secret and issuer
// export const secretKey = 'time-tracker';
// const issuer = 'TIME_TRACKER';

// export const genToken = (user, type) => {
//   return signJWT(
//     {
//       iss: issuer,
//       sub: user.id,
//       type,
//     },
//     '6h'
//   );
// };

// const jwtOptions = {
//   secretOrKey: secretKey,
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// };

// const jwtVerify = async (payload, done) => {
//   let user;
//   try {
 
//     user = await userModel.findByPk(payload.sub);
//     console.log(user, "user")

//     if (!user) {
//       return done(null, false);
//     }
//     done(null, user);
//   } catch (error) {
//     done(error, false);
//   }
// };

// export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const userModel = db.Users; // Adjust according to your setup

export const secretKey = 'time-tracker';
const issuer = 'TIME_TRACKER';

export const genToken = (user, type) => {
  return jwt.sign(
    {
      iss: issuer,
      sub: user.id,
      type,
    },
    secretKey,
    { expiresIn: '6h' }
  );
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

const jwtVerify = async (payload, done) => {
  try {
    const user = await userModel.findByPk(payload.sub);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
