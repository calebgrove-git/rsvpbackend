require('dotenv').config();
const path = require('path');
const express = require('express');
const xss = require('xss');
const bcrypt = require('bcrypt');
const UserService = require('./users-service');
const jwt = require('jsonwebtoken');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: user.id,
  email: xss(user.email),
  password: xss(user.password),
});
usersRouter.route('/create').post(jsonParser, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = { email, password: hashedPass };
    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    UserService.insertUser(req.app.get('db'), newUser)
      .then((user) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.name}`))
          .json(serializeUser(user));
      })
      .catch(next);
  } catch {
    res.status(500).send();
  }
});

usersRouter.route('/login').post(jsonParser, async (req, res, next) => {
  const { email, password } = req.body;
  const unauthorizedUser = { email, password };
  UserService.getByEmail(req.app.get('db'), unauthorizedUser.email)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: { message: `User doesn't exist` },
        });
      }
      return user;
    })
    .then((user) => {
      const bool = bcrypt.compare(unauthorizedUser.password, user.password);
      return { bool, user };
    })
    .then((response) => {
      const user = serializeUser(response.user);
      const accessToken = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET ||
          'c4b7d19e67c51da8fd713a5f62eedd53aa4177d7d74828c2cf24037cde13ca068f650b7067da0ec88aa6a5afbf896dfddc66e6410089a9c765fd3fbbea60f16c'
      );
      if (response.bool) {
        res.json({
          accessToken: accessToken,
          user: { id: user.id, email: user.email },
        });
      }
      next();
    })
    .catch(next);
});
usersRouter.route('/refresh').post(jsonParser, async (req, res, next) => {
  const token = req.body.token;
  const secret =
    process.env.ACCESS_TOKEN_SECRET ||
    'c4b7d19e67c51da8fd713a5f62eedd53aa4177d7d74828c2cf24037cde13ca068f650b7067da0ec88aa6a5afbf896dfddc66e6410089a9c765fd3fbbea60f16c';
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    return res.json({ id: user.id, email: user.email });
  });
});
usersRouter.route('/emails').post(jsonParser, async (req, res, next) => {
  const ids = req.body;
  UserService.getByID(req.app.get('db'), ids)
    .then((emails) => {
      if (!emails) {
        return res.status(404).json({
          error: { message: `User doesn't exist` },
        });
      }
      return res.json(emails);
    })
    .catch(next);
});
module.exports = usersRouter;
