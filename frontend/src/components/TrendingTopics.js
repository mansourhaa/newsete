'use client';
import { useEffect, useState } from "react";

export default function TrendingTopics({ onTopicClick, selectedTopic }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetch(`${API}/trending`)
      .then((res) => res.json())
      .then((data) => setTopics(data))
      .catch((err) => console.error("Failed to load trending topics", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="trending-topics">
      <h2 className="trending-title">📈 Trending Topics</h2>

      {loading ? (
        <p className="loading">Loading topics...</p>
      ) : (
        <div className="trending-list">
          {topics.map((topic, index) => (
            <button
              key={index}
              className={`topic-pill ${selectedTopic === topic ? "active" : ""}`}
              onClick={() => onTopicClick(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
