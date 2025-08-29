const axios = require('axios');
const Parser = require('rss-parser');
const rssParser = new Parser();

// ✅ API URLs
const NEWS_API_URL     = 'https://newsapi.org/v2/top-headlines';
const GUARDIAN_API_URL = 'https://content.guardianapis.com/search';

// ✅ BBC RSS feeds mapped by category
const BBC_CATEGORIES = {
  general: 'http://feeds.bbci.co.uk/news/world/rss.xml',
  business: 'http://feeds.bbci.co.uk/news/business/rss.xml',
  technology: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
  science: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  health: 'http://feeds.bbci.co.uk/news/health/rss.xml',
  entertainment: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  sports: 'http://feeds.bbci.co.uk/sport/rss.xml?edition=uk' // special structure
};

// ✅ Normalization function for all sources
function normalizeArticle(article, source) {
  return {
    id:          article.url || article.webUrl || article.link,
    title:       article.title || article.webTitle,
    description: article.description || article.fields?.trailText || article.contentSnippet || '',
    source,
    url:         article.url || article.webUrl || article.link,
    imageUrl:    article.urlToImage || article.fields?.thumbnail || article.enclosure?.url || null,
    publishedAt: article.publishedAt || article.webPublicationDate || article.pubDate
  };
}

// ✅ Fetch from NewsAPI
async function fetchNewsAPI(country = 'us', category = 'general') {
  try {
    const res = await axios.get(NEWS_API_URL, {
      params: { apiKey: process.env.NEWS_API_KEY, country, category, pageSize: 5 }
    });
    console.log('✅ NewsAPI:', res.data.articles.length);
    return res.data.articles.map(a => normalizeArticle(a, 'NewsAPI'));
  } catch (e) {
    console.error('❌ NewsAPI error:', e.response?.data || e.message);
    return [];
  }
}

// ✅ Fetch from Guardian
async function fetchGuardian() {
  try {
    const res = await axios.get(GUARDIAN_API_URL, {
      params: {
        'api-key':     process.env.GUARDIAN_API_KEY,
        'show-fields': 'trailText,thumbnail',
        'page-size':   5,
        'order-by':    'newest'
      }
    });
    const results = res.data.response.results;
    console.log('✅ Guardian:', results.length);
    return results.map(r =>
      normalizeArticle({
        webTitle:           r.webTitle,
        fields:             r.fields,
        webUrl:             r.webUrl,
        webPublicationDate: r.webPublicationDate
      }, 'Guardian')
    );
  } catch (e) {
    console.error('❌ Guardian error:', e.response?.data || e.message);
    return [];
  }
}

// ✅ Fetch from BBC with category support
async function fetchBBC(category = 'general') {
  try {
    const url = BBC_CATEGORIES[category] || BBC_CATEGORIES.general;
    const feed = await rssParser.parseURL(url);
    console.log('✅ BBC:', feed.items.length);
    return feed.items.map(item => normalizeArticle(item, 'BBC'));
  } catch (e) {
    console.error('❌ BBC error:', e.message);
    return [];
  }
}

// ✅ Unified Fetch for All Sources
async function fetchAllNews(categoryFilter, sourceFilter) {
  const category = categoryFilter || 'general';

  const [newsapi, guardian, bbc] = await Promise.all([
    fetchNewsAPI('us', category),
    fetchGuardian(),
    fetchBBC(category)
  ]);

  let all = [...newsapi, ...guardian, ...bbc];

  // Optional: Source filter
  
  if (sourceFilter) {
    const s = sourceFilter.toLowerCase();
    all = all.filter(a => a.source.toLowerCase() === s);
  }

  // Optional: Keyword-based category filter
  if (categoryFilter) {
    const term = categoryFilter.toLowerCase();
    all = all.filter(a =>
      a.title?.toLowerCase().includes(term) ||
      a.description?.toLowerCase().includes(term)
    );
  }

  return all;
}

module.exports = { fetchAllNews };
