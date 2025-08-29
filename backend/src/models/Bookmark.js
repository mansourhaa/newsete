// backend/src/models/Bookmark.js
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  url: String,
  imageUrl: String,
  source: String,
  publishedAt: String
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
