const Bookmark = require('../models/Bookmark');
const authMiddleware = require('../middleware/auth');

module.exports = async function (fastify, opts) {
  // Get all bookmarks for user
  fastify.get('/bookmarks', { preHandler: [authMiddleware] }, async (req, reply) => {
    const bookmarks = await Bookmark.find({ user: req.user._id });
    reply.send(bookmarks);
  });

  // Add a bookmark
  fastify.post('/bookmarks', { preHandler: [authMiddleware] }, async (req, reply) => {
    const bookmark = new Bookmark({ ...req.body, user: req.user._id });
    await bookmark.save();
    reply.send(bookmark);
  });

  // Remove bookmark
  fastify.delete('/bookmarks/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    await Bookmark.deleteOne({ _id: req.params.id, user: req.user._id });
    reply.send({ message: "Bookmark removed" });
  });
};
