import { Link } from 'react-router-dom';
import { imageUrl } from '../lib/api.js';
import { unitLabel } from '../lib/unit.js';
import { ArrowRight } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const unit = unitLabel(product.unit);
  const discountPct = hasDiscount
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <Link
      to={`/products/${encodeURIComponent(product.slug || product.id)}`}
      className="product-card"
      aria-label={product.title}
    >
      {/* Image */}
      <div className="product-card__imgbox">
        {discountPct && (
          <span className="product-card__badge" aria-label={`${discountPct}% off`}>
            -{discountPct}%
          </span>
        )}
        {product.images?.[0] ? (
          <img
            src={imageUrl(product.images[0])}
            alt={product.title}
            className="product-card__img"
            loading="lazy"
          />
        ) : (
          <div className="product-card__no-image" aria-hidden="true">
            <span>{product.title[0]}</span>
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
        <div className="product-card__price-row">
          <span className="product-card__price">
            ₹{Number(product.price).toFixed(2)}
            {unit && <span className="product-card__unit"> / {unit}</span>}
          </span>
          {hasDiscount && (
            <span className="product-card__compare">
              ₹{Number(product.compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
