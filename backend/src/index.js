// backend/src/index.js
require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => fastify.log.info('✅ MongoDB connected'))
  .catch(err => {
    fastify.log.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// --- Common plugins ---
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/formbody'));

// --- Auto-load ALL routes in /routes ---
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    fastify.register(require(path.join(routesPath, file)));
  }
});

// --- Socket.io (live push) ---
let io;                  // socket.io instance
let lastTopId = null;    // remember last top headline to avoid duplicates
const { fetchAllNews } = require('./services/newsService');

// Poll top headline periodically and broadcast if changed
async function pollBreaking() {
  try {
    const all = await fetchAllNews(null, null); // your current fetch (NewsAPI+Guardian+BBC)
    const top = all && all[0];
    if (top && top.id && top.id !== lastTopId) {
      lastTopId = top.id;
      io.emit('breaking-news', {
        title:       top.title,
        url:         top.url,
        source:      top.source,
        imageUrl:    top.imageUrl,
        publishedAt: top.publishedAt
      });
      fastify.log.info(`📣 Breaking pushed: ${top.source} | ${top.title}`);
    }
  } catch (e) {
    fastify.log.error(`pollBreaking error: ${e.message}`);
  }
}

// --- Start server ---
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port });

    // Init socket.io **after** fastify is listening, attach to the underlying server
    const { Server } = require('socket.io');
    io = new Server(fastify.server, {
      cors: { origin: true }
    });

    io.on('connection', (socket) => {
      fastify.log.info(`🔌 socket connected: ${socket.id}`);
      socket.emit('hello', { ok: true, t: Date.now() });
      socket.on('disconnect', () => fastify.log.info(`🔌 socket disconnected: ${socket.id}`));
    });

    // Start the breaking poller (every 45s)
    pollBreaking(); // initial
    setInterval(pollBreaking, 45_000);

    fastify.log.info(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
