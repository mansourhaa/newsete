const Bookmark = require('../models/Bookmark');

async function listBookmarks() {
  return Bookmark.find().sort({ createdAt: -1 });
}

async function createBookmark(data) {
  const bm = new Bookmark(data);
  return bm.save();
}

async function deleteBookmark(id) {
  return Bookmark.findByIdAndDelete(id);
}

module.exports = { listBookmarks, createBookmark, deleteBookmark };
