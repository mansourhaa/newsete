const stopWords = new Set([
  "the","and","of","to","a","in","for","on","at","with","is","are","by","an","from","about","this","that","as","it","be","was","will","has","have"
]);

function extractKeywords(articles, max = 6) {
  const wordCount = {};
  
  articles.forEach(article => {
    const words = (article.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // remove punctuation
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w)); // filter short & stopwords

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // Sort by frequency and take top N
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(entry => entry[0].replace(/^\w/, c => c.toUpperCase())); // capitalize
}

module.exports = async function (fastify, opts) {
  fastify.get('/trending', async (req, reply) => {
    try {
      // Call your news service
      const { fetchAllNews } = require('../services/newsService');
      const articles = await fetchAllNews(null, null); // Get all categories

      const trending = extractKeywords(articles);
      return trending;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to generate trending topics" });
    }
  });
};
