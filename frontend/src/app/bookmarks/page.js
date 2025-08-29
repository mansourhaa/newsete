'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import NewsItem from '@/components/NewsItem';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 5;

export default function BookmarksPage() {
  const { token, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/bookmarks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookmarks(data))
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleClearAll = async () => {
    if (!confirm('Remove all bookmarks?')) return;
    await Promise.all(
      bookmarks.map(b =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/bookmarks/${b._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }))
    );
    setBookmarks([]);
  };

  if (!token) {
    return (
      <div className="bookmarks-page">
        <h1 className="bookmarks-title">My Bookmarks</h1>
        <div className="not-logged">
          <p>You must be <a href="/login?redirect=bookmarks" className="link">logged in</a> to view your saved articles.</p>
        </div>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE);
  const currentPageBookmarks = bookmarks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="bookmarks-page">
      <div className="header-row">
        <h1 className="bookmarks-title">My Bookmarks</h1>
        {bookmarks.length > 0 && (
          <button className="clear-btn" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      {loading && <p className="loading">Loading your bookmarks…</p>}
      {!loading && bookmarks.length === 0 && (
        <p className="empty">You haven't saved any articles yet.</p>
      )}

      <div className="bookmarks-list">
        {currentPageBookmarks.map((article) => (
          <NewsItem key={article._id} article={article} />
        ))}
      </div>

      {/* Pagination Controls */}
      {bookmarks.length > ITEMS_PER_PAGE && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={page === idx + 1 ? "active" : ""}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
