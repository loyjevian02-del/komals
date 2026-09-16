import { Link } from 'react-router-dom';
import { imageUrl } from '../lib/api.js';
import { ArrowRight } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${encodeURIComponent(product.slug || product.id)}`}
      className="product-card"
      aria-label={product.title}
    >
      {/* Image */}
      <div className="product-card__imgbox">
        {product.images?.[0] ? (
          <img
            src={imageUrl(product.images[0])}
            alt={product.title}
            className="product-card__img"
            loading="lazy"
          />
        ) : (
          <div className="product-card__no-image" aria-hidden="true">
            <span>{product.title?.[0] || '?'}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="product-card__hover-layer" aria-hidden="true">
          <span className="product-card__view-link">
            View Details <ArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="product-card__body">
        {product.categoryName && (
          <span className="product-card__category">{product.categoryName}</span>
        )}
        <h3 className="product-card__title">{product.title}</h3>
      </div>
    </Link>
  );
}
