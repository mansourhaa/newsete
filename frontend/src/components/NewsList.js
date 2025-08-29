// src/components/NewsList.js
import NewsItem from "./NewsItem";

export default function NewsList({ articles }) {
  if (!articles?.length) {
    return <p className="no-articles">No news articles found.</p>;
  }

  return (
    <div className="news-list">
      {articles.map((article, index) => (
        <NewsItem key={index} article={article} />
      ))}
    </div>
  );
}
