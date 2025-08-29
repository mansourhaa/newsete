'use client';
const categories = [
  "General", "Business", "Technology", "Sports", "Entertainment", "Health", "Science"
];

export default function CategoryBar({ selectedCategory, onCategoryClick }) {
  return (
    <div className="category-bar">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryClick(cat.toLowerCase())}
          className={`category-pill ${selectedCategory === cat.toLowerCase() ? 'active' : ''}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
