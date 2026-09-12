import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { api, imageUrl } from '../lib/api.js';
import { unitLabel } from '../lib/unit.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    setLoading(true);
    const target = encodeURIComponent(slug);
    api.get(`/store/products/${target}`)
      .then((r) => {
        setProduct(r.data);
        setActiveImage(0);
        api.post('/store/analytics/product-view', { productId: r.data.id }).catch(() => { });
      })
      .catch((err) => {
        console.error('Failed to load product:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function handleBack(e) {
    e.preventDefault();
    if (window.history.length > 1) navigate(-1);
    else if (product?.categorySlug) navigate(`/categories/${product.categorySlug}`);
    else navigate('/');
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="pdp-loading-wrap">
        <div className="container pdp-loading-grid">
          <div className="skeleton pdp-skeleton-img" />
          <div className="pdp-skeleton-info">
            <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 3, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 4, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 40, width: '70%', borderRadius: 4, marginBottom: 28 }} />
            <div className="skeleton" style={{ height: 32, width: 120, borderRadius: 4, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 14, borderRadius: 3, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, borderRadius: 3, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Not Found ── */
  if (notFound || !product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="pdp-notfound-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="27" stroke="var(--outline-variant)" strokeWidth="1.5" />
            <path d="M28 16 L30 26 L40 28 L30 30 L28 40 L26 30 L16 28 L26 26 Z" stroke="var(--outline)" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
        <h2 className="pdp-notfound-title">Sweet not found</h2>
        <p className="pdp-notfound-body">
          The item you're looking for may have been removed or is temporarily unavailable.
        </p>
        <button type="button" onClick={handleBack} className="btn-outline">
          Go Back
        </button>
      </div>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const unit = unitLabel(product.unit);
  const images = product.images?.length ? product.images : [null];
  const discountPct = hasDiscount
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div>
      {/* Breadcrumb/Back */}
      <div className="pdp-breadcrumb">
        <div className="container">
          <button type="button" onClick={handleBack} className="pdp-back-btn" aria-label="Go back">
            <ChevronLeft size={15} /> Back
          </button>
          {product.categoryName && (
            <>
              <span className="pdp-breadcrumb__sep">·</span>
              <Link to={`/categories/${product.categorySlug}`} className="pdp-breadcrumb__link">
                {product.categoryName}
              </Link>
              <span className="pdp-breadcrumb__sep">·</span>
              <span className="pdp-breadcrumb__current">{product.title}</span>
            </>
          )}
        </div>
      </div>

      <div className="container pdp-container">
        <div className="pdp-grid">

          {/* ── Left: Image Gallery ── */}
          <div className="pdp-gallery">
            {/* Main Image */}
            <div className="pdp-gallery__main">
              {images[activeImage] ? (
                <img
                  src={imageUrl(images[activeImage])}
                  alt={product.title}
                  className="pdp-gallery__main-img"
                />
              ) : (
                <div className="pdp-gallery__no-image">
                  <span>{product.title[0]}</span>
                </div>
              )}
              {discountPct && (
                <span className="pdp-gallery__badge">-{discountPct}% OFF</span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="pdp-gallery__thumbs" role="list" aria-label="Product images">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    role="listitem"
                    onClick={() => setActiveImage(i)}
                    className={`pdp-gallery__thumb${i === activeImage ? ' pdp-gallery__thumb--active' : ''}`}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === activeImage}
                  >
                    {img ? (
                      <img src={imageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 20, color: 'var(--primary)' }}>{product.title[0]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="pdp-info">
            {/* Category label */}
            {product.categoryName && (
              <Link
                to={`/categories/${product.categorySlug}`}
                className="pdp-info__category"
              >
                {product.categoryName}
              </Link>
            )}

            {/* Title */}
            <h1 className="pdp-info__title">{product.title}</h1>

            {/* Gold divider */}
            <div className="pdp-info__divider" />

            {/* Price
            <div className="pdp-info__price-wrap">
              <span className="pdp-info__price">
                ₹{Number(product.price).toFixed(2)}
                {unit && (
                  <span className="pdp-info__unit"> / {unit}</span>
                )}
              </span>
              {hasDiscount && (
                <span className="pdp-info__compare">
                  ₹{Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div> */}

            {/* Description */}
            {product.description && (
              <div className="pdp-info__desc-wrap">
                <h2 className="pdp-info__desc-heading">About this Sweet</h2>
                <p className="pdp-info__desc">{product.description}</p>
              </div>
            )}

            {/* Enquire via WhatsApp prompt (non-functional CTA, purely display) */}
            <div className="pdp-info__cta-group">
              <Link to="/contact" className="btn-primary pdp-info__cta">
                Enquire Now
              </Link>
              <Link to={`/categories/${product.categorySlug || ''}`} className="btn-outline pdp-info__cta">
                More in {product.categoryName || 'Collection'}
              </Link>
            </div>

            {/* Subtle assurance */}
            <div className="pdp-assurance">
              <span>✦ Handcrafted Daily</span>
              <span>✦ Pure Ingredients</span>
              <span>✦ Freshly Packed</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Loading ── */
        .pdp-loading-wrap {
          padding: 48px 0 80px;
        }
        .pdp-loading-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
          padding-top: 24px;
          padding-bottom: 48px;
        }
        .pdp-skeleton-img {
          aspect-ratio: 1 / 1;
          border-radius: var(--radius);
        }
        .pdp-skeleton-info {
          padding-top: 8px;
        }

        /* ── Not Found ── */
        .pdp-notfound-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          opacity: 0.5;
        }
        .pdp-notfound-title {
          font-family: var(--font-serif);
          font-size: 28px;
          color: var(--on-surface);
          margin: 0 0 12px;
        }
        .pdp-notfound-body {
          font-size: 14px;
          color: var(--on-surface-variant);
          max-width: 380px;
          margin: 0 auto 28px;
          line-height: 1.7;
        }

        /* ── Breadcrumb ── */
        .pdp-breadcrumb {
          background: var(--surface-container-low);
          border-bottom: 1px solid var(--outline-variant);
          padding: 12px 0;
        }
        .pdp-breadcrumb .container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pdp-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: none;
          border: none;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          color: var(--on-surface-variant);
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .pdp-back-btn:hover { color: var(--primary); }
        .pdp-breadcrumb__sep {
          color: var(--outline);
          font-size: 12px;
        }
        .pdp-breadcrumb__link {
          font-size: 12px;
          color: var(--on-surface-variant);
          text-decoration: none;
          transition: color 0.2s;
        }
        .pdp-breadcrumb__link:hover { color: var(--primary); }
        .pdp-breadcrumb__current {
          font-size: 12px;
          color: var(--on-surface);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }

        /* ── Layout ── */
        .pdp-container {
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .pdp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
        }

        /* ── Gallery ── */
        .pdp-gallery {
          position: sticky;
          top: 90px;
        }
        .pdp-gallery__main {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--surface-container-low);
          border: 1px solid var(--outline-variant);
        }
        .pdp-gallery__main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pdp-gallery__no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-serif);
          font-size: 96px;
          font-weight: 700;
          color: var(--primary-container);
        }
        .pdp-gallery__badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: var(--primary);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          border-radius: 2px;
        }
        .pdp-gallery__thumbs {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pdp-gallery__thumbs::-webkit-scrollbar { display: none; }
        .pdp-gallery__thumb {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid var(--outline-variant);
          background: var(--surface-container-low);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: border-color 0.2s, transform 0.15s;
        }
        .pdp-gallery__thumb:hover {
          transform: translateY(-2px);
          border-color: var(--outline);
        }
        .pdp-gallery__thumb--active {
          border-color: var(--gold) !important;
          box-shadow: 0 0 0 1px var(--gold);
        }

        /* ── Info ── */
        .pdp-info__category {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold-dark);
          margin-bottom: 14px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .pdp-info__category:hover { color: var(--primary); }
        .pdp-info__title {
          font-family: var(--font-serif);
          font-size: clamp(26px, 3.5vw, 42px);
          font-weight: 600;
          color: var(--on-surface);
          line-height: 1.1;
          margin: 0;
        }
        .pdp-info__divider {
          width: 48px;
          height: 1.5px;
          background: var(--gold);
          margin: 18px 0;
        }
        .pdp-info__price-wrap {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 24px;
        }
        .pdp-info__price {
          font-family: var(--font-sans);
          font-size: 32px;
          font-weight: 600;
          color: var(--primary);
          letter-spacing: -0.02em;
        }
        .pdp-info__unit {
          font-size: 14px;
          font-weight: 400;
          color: var(--on-surface-variant);
        }
        .pdp-info__compare {
          font-size: 18px;
          color: var(--outline);
          text-decoration: line-through;
        }
        .pdp-info__desc-wrap {
          border-top: 1px solid var(--outline-variant);
          padding-top: 24px;
          margin-bottom: 28px;
        }
        .pdp-info__desc-heading {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--on-surface-variant);
          margin: 0 0 12px;
        }
        .pdp-info__desc {
          font-size: 14.5px;
          line-height: 1.8;
          color: var(--on-surface-variant);
          white-space: pre-line;
          margin: 0;
        }
        .pdp-info__cta-group {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .pdp-info__cta {
          flex: 1;
          justify-content: center;
          min-width: 140px;
        }
        .pdp-assurance {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          border-top: 1px solid var(--outline-variant);
          padding-top: 20px;
        }
        .pdp-assurance span {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--on-surface-variant);
        }

        /* ── Responsive ── */
        @media (max-width: 820px) {
          .pdp-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .pdp-gallery {
            position: static;
          }
          .pdp-loading-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .pdp-info__title { font-size: 26px; }
          .pdp-info__price { font-size: 26px; }
          .pdp-info__cta-group { flex-direction: column; }
          .pdp-assurance { gap: 10px; }
          
        }
      `}</style>
    </div>
  );
}
