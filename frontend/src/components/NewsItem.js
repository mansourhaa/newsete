// src/components/NewsItem.js
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewsItem({ article }) {
  const { token } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBookmark = async () => {
    if (!token) {
      router.push('/login?redirect=bookmarks');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/bookmarks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(article),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
    } catch {
      alert("Failed to save bookmark");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="news-card">
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="news-image" />
      )}
      <div className="news-content">
        <h3 className="news-title">{article.title}</h3>
        <p className="news-description">{article.description}</p>
        <p className="news-meta">
          {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
        </p>
        <div className="news-actions">
          <a href={article.url} target="_blank" className="read-more">
            Read more →
          </a>
          <button
            className="bookmark-btn"
            onClick={handleBookmark}
            disabled={saved || saving}
          >
            {saving ? "Saving..." : saved ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
      </div>
    </div>
  );
}
