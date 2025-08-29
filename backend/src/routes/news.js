const { fetchAllNews } = require('../services/newsService');

module.exports = async function (fastify, opts) {
  fastify.get('/news', async (request, reply) => {
    try {
      const { category, source, q } = request.query;

      let articles = await fetchAllNews(category, source);

      if (q) {
        const term = q.toLowerCase();
        articles = articles.filter(a =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term)
        );
      }

      return articles;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch news' });
    }
  });
};
