// backend/src/routes/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (fastify, opts) {
  // Register
  fastify.post('/auth/register', async (req, reply) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email, password });
      await user.save();
      reply.send({ message: "User registered successfully" });
    } catch (err) {
      reply.status(400).send({ error: err.message });
    }
  });

  // Login
  fastify.post('/auth/login', async (req, reply) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      reply.send({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
      reply.status(500).send({ error: "Login failed" });
    }
  });
};
