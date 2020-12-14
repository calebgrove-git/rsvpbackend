const jwt = require('jsonwebtoken');

function authToken(req, res, next) {
  const token = req.headers['authorization'];
  console.log(token);
  if (token === null) return res.sendStatus(401);
  const secret =
    process.env.ACCESS_TOKEN_SECRET ||
    'c4b7d19e67c51da8fd713a5f62eedd53aa4177d7d74828c2cf24037cde13ca068f650b7067da0ec88aa6a5afbf896dfddc66e6410089a9c765fd3fbbea60f16c';
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
  });
  next();
}

module.exports = authToken;
