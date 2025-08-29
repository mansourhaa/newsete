// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, reply) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return reply.status(401).send({ error: 'No Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return reply.status(401).send({ error: 'Malformed Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user to the request for later handlers
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return reply.status(401).send({ error: 'User not found' });
    }
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
