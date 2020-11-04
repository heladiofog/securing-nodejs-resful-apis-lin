import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserSchema } from '../models/userModel';

const User = mongoose.model('User', UserSchema);

export const loginRequired = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }
};

export const register = (req, res) => {
  const newUser = new User(req.body);
  newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
  // save the user
  newUser.save((err, user) => {
    if (err) {
      res.status(500).send({
        message: err,
      });
    } else {
      user.hashPassword = undefined;
      res.status(200).send(user);
    }
  });
};

export const login = (req, res) => {
  User.findOne(
    {
      email: req.body.email,
    },
    (err, user) => {
      console.log('Searching user...', user);
      if (err) throw err;
      if (!user) {
        res.status(401).json({
          message: ' Authentication failed. No user found.',
        });
      } else if (user) {
        console.log('user :>> ', user);
        if (!user.comparePassword(req.body.password, user.hashPassword)) {
          res
            .status(401)
            .json({ message: 'Authentication failed. Wrong Password.' });
        } else {
          let secure = 'S3cuRe$';
          return res.json({
            token: jwt.sign(
              {
                email: user.email,
                username: user.username,
                _id: user.id,
              },
              secure
            ),
          });
        }
      }
    }
  );
};
