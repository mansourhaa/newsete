'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import FeaturedStory from "../components/FeaturedStory";
import TrendingTopics from "../components/TrendingTopics";
import LiveBar from "../components/LiveBar";
import NewsItem from "../components/NewsItem";
import ThemeToggle from "../components/ThemeToggle";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Pagination as SwiperPagination,
  Keyboard,
  A11y,
  Mousewheel,
  Autoplay,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/* ---------- Small Breaking Ticker (uses your CSS classes) ---------- */
function BreakingTicker({ items = [] }) {
  const list = items.slice(0, 8);
  if (!list.length) return null;

  // Duplicate once so the CSS marquee loop feels continuous
  const loop = [...list, ...list];

  return (
    <div className="breaking-wrap" role="region" aria-label="Breaking news">
      <span className="breaking-chip">BREAKING</span>
      <div className="breaking-viewport">
        <ul className="breaking-track">
          {loop.map((b, idx) => (
            <li className="breaking-item" key={idx}>
              <a
                className="breaking-link"
                href={b.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                title={b.title || ''}
              >
                <span className="breaking-source">{b.source?.name || b.source || "News"}</span>
                <span className="breaking-title">{b.title || b.description || 'Latest update'}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const REFRESH_INTERVAL = 60000;
  const abortRef = useRef(null);

  const fetchArticles = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    let url = `${API}/news`;
    const params = new URLSearchParams();
    if (selectedTopic)    params.append("q", selectedTopic);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedSource)   params.append("source", selectedSource);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    try {
      const res = await fetch(url, { signal: abortRef.current.signal });
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      if (err.name !== "AbortError") console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, REFRESH_INTERVAL);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, selectedCategory, selectedSource]);

  // keep first as featured
  const slideArticles = useMemo(() => articles.slice(1), [articles]);

  // heuristic for breaking items
  const breakingItems = useMemo(() => {
    if (!articles?.length) return [];
    const flagged = articles.filter(a =>
      a?.isBreaking ||
      /breaking|urgent|developing|live/i.test(a?.title || '') ||
      /breaking|urgent|developing|live/i.test(a?.description || '')
    );
    return (flagged.length ? flagged : articles.slice(0, 6));
  }, [articles]);

  return (
    <>
      {/* Simple Navbar with Theme Toggle */}
     

      <LiveBar apiBase={API} />

      {/* Breaking Ticker */}
      <BreakingTicker items={breakingItems} />

      {/* Filters */}
      <div className="filters-bar container">
        <TrendingTopics
          selectedTopic={selectedTopic}
          onTopicClick={(topic) => setSelectedTopic(topic)}
        />

        <div className="filters-inline">
          {/* Category */}
          <label className="sr-only" htmlFor="home-cat">Category</label>
          <select
            id="home-cat"
            className="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            title="Category"
          >
            <option value="">All Categories</option>
            <option value="business">Business</option>
            <option value="sports">Sports</option>
            <option value="technology">Technology</option>
            <option value="science">Science</option>
            <option value="health">Health</option>
            <option value="entertainment">Entertainment</option>
          </select>

          {/* Source */}
          <label className="sr-only" htmlFor="home-src">Source</label>
          <select
            id="home-src"
            className="category-select"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            title="Source"
          >
            <option value="">All Sources</option>
            <option value="BBC">BBC</option>
            <option value="Guardian">Guardian</option>
            <option value="NewsAPI">NewsAPI</option>
          </select>
        </div>
      </div>

      {selectedTopic && (
        <p className="selected-topic-info container">
          Showing news for: <strong>{selectedTopic}</strong>
          <button className="clear-btn" onClick={() => setSelectedTopic(null)}>
            Clear
          </button>
        </p>
      )}

      {/* Featured */}
      <div className="container">
        {articles.length > 0 && <FeaturedStory article={articles[0]} />}

        <div className="home-section-head">
          <h2 className="section-title">📰 Latest News</h2>
          <p className="last-updated">
            {loading ? (
              <>
                <span className="spinner"></span> Refreshing…
              </>
            ) : (
              <>Last updated: {lastUpdated || "Loading..."}</>
            )}
          </p>
        </div>
      </div>

      {/* ===== Elegant + Reliable Swiper ===== */}
      <div className="swiper-elegant container">
        {loading && slideArticles.length === 0 ? (
          <div className="skeleton-carousel">
            {[...Array(3)].map((_, i) => (
              <div className="skeleton-slide" key={i}>
                <div className="skeleton-thumb" />
                <div className="skeleton-lines">
                  <div className="skeleton-line w-85" />
                  <div className="skeleton-line w-65" />
                  <div className="skeleton-line w-45" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, SwiperPagination, Keyboard, A11y, Mousewheel, Autoplay]}
            loop
            grabCursor
            centeredSlides
            watchSlidesProgress
            slidesPerView={1}
            spaceBetween={24}
            breakpoints={{
              640:  { slidesPerView: 1.2, spaceBetween: 22 },
              900:  { slidesPerView: 1.8, spaceBetween: 24 },
              1200: { slidesPerView: 2.6, spaceBetween: 26 },
              1400: { slidesPerView: 3.2, spaceBetween: 28 },
            }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            keyboard={{ enabled: true }}
            mousewheel={{ forceToAxis: true }}
            autoplay={{ delay: 5200, disableOnInteraction: false }}
          >
            {slideArticles.map((a, idx) => (
              <SwiperSlide key={(a.id || a.url || 'slide') + idx}>
                <NewsItem article={a} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <button onClick={fetchArticles} className="refresh-btn" disabled={loading}>
        {loading ? (<><span className="spinner"></span> Refreshing…</>) : ("🔄 Refresh Now")}
      </button>
    </>
  );
}
