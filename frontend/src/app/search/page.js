"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import NewsItem from "@/components/NewsItem";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CATEGORIES = ["All", "Technology", "Health", "Environment", "Business", "Sports", "Science"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typedAt, setTypedAt] = useState(0); // for debounce
  const [lastSearched, setLastSearched] = useState({ q: "", cat: "All" });

  const controllerRef = useRef(null);
  const DEBOUNCE_MS = 450;

  const paramsFromState = (searchTerm, cat) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    if (cat !== "All") params.append("category", cat.toLowerCase());
    return params.toString();
  };

  const fetchSearch = async (searchTerm, cat) => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setLoading(true);
    try {
      const qs = paramsFromState(searchTerm, cat);
      const res = await fetch(`${API}/news?${qs}`, { signal: controllerRef.current.signal });
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
      setLastSearched({ q: searchTerm, cat });
    } catch (err) {
      if (err.name !== "AbortError") console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // initial load (all)
  useEffect(() => {
    fetchSearch("", "All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced live search on q change
  useEffect(() => {
    const now = Date.now();
    setTypedAt(now);
    const handle = setTimeout(() => {
      // only run if no more typing happened after this timestamp
      if (typedAt === now) fetchSearch(q, category);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // instant when category changes
  useEffect(() => {
    fetchSearch(q, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const resultLabel = useMemo(() => {
    const term = (lastSearched.q || "All");
    const cat = lastSearched.cat || "All";
    return `${term} / ${cat}`;
  }, [lastSearched]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSearch(q, category);
  };

  const clearQuery = () => {
    setQ("");
    // fetchSearch will be triggered by debounce; force immediately:
    fetchSearch("", category);
  };

  return (
    <div className="container">
      <h1 className="section-title">Search News</h1>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="searchbar">
        <div className="searchbar-field">
          <span className="searchbar-icon" aria-hidden>🔍</span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search headlines, topics, sources…"
            className="searchbar-input"
            aria-label="Search news"
          />
          {q && (
            <button
              type="button"
              className="searchbar-clear"
              onClick={clearQuery}
              aria-label="Clear search"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary searchbar-btn" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Category chips */}
      <div className="chip-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Result meta */}
      <div className="result-meta">
        <span className="result-pill">
          Showing: <strong>{resultLabel}</strong>
        </span>
        {!loading && (
          <span className="result-count">
            {articles.length} {articles.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {/* Results */}
      {loading && articles.length === 0 && (
        <div className="skeleton-list">
          {[...Array(4)].map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-thumb" />
              <div className="skeleton-lines">
                <div className="skeleton-line w-80" />
                <div className="skeleton-line w-60" />
                <div className="skeleton-line w-40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="empty-card">
          <div className="empty-emoji">🧐</div>
          <h3>No articles found</h3>
          <p>Try a broader keyword or choose a different category.</p>
        </div>
      )}

      <div className="search-results">
        {articles.map((article, idx) => (
          <NewsItem key={(article.id || article.url || "a") + idx} article={article} />
        ))}
      </div>
    </div>
  );
}
