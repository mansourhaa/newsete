// src/components/FeaturedStory.js
export default function FeaturedStory({ article }) {
  return (
    <div className="featured-card">
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="featured-image"
        />
      )}
      <div className="featured-content">
        <h2 className="featured-title">{article.title}</h2>
        <p className="featured-description">{article.description}</p>
        <a href={article.url} target="_blank" className="read-more">
          Read more →
        </a>
      </div>
    </div>
  );
}
