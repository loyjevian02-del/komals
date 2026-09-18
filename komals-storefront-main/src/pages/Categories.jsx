import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../lib/api.js';
import { ArrowRight } from 'lucide-react';
import StaggerGrid from '../components/animations/StaggerGrid.jsx';
import Reveal from '../components/animations/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import { useSsrReady } from '../lib/useSsrReady.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/store/categories')
      .then((r) => setCategories(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useSsrReady(!loading);

  return (
    <div>
      <Seo
        title="Shop by Category"
        description="Explore all categories of handcrafted Indian sweets, halwas and savouries at Komal's Sweet Palace."
      />
      {/* Page Header */}
      <Reveal>
        <div className="cats-page-header">
          <div className="container">
            <span className="section-eyebrow">Browse by Category</span>
            <h1 className="cats-page-header__title">What Are You Craving Today?</h1>
            <div className="gold-divider gold-divider--left" />
            <p className="cats-page-header__sub">
              Explore our full range of handcrafted Indian sweets, organised by category.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        {loading ? (
          <div className="cats-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cat-page-skeleton">
                <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }} />
                <div style={{ padding: '16px 18px' }}>
                  <div className="skeleton" style={{ height: 18, borderRadius: 4, marginBottom: 8, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 16 }}>No categories available yet. Check back soon.</p>
          </div>
        ) : (
          <StaggerGrid className="cats-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="cat-page-card"
                aria-label={cat.name}
              >
                <div className="cat-page-card__img-wrap">
                  {cat.image ? (
                    <img
                      src={imageUrl(cat.image)}
                      alt={cat.name}
                      className="cat-page-card__img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cat-page-card__placeholder">
                      <span>{cat.name?.[0] || '?'}</span>
                    </div>
                  )}
                  <div className="cat-page-card__overlay" />
                </div>
                <div className="cat-page-card__body">
                  <div className="cat-page-card__info">
                    <h2 className="cat-page-card__name">{cat.name}</h2>
                    {cat.description && (
                      <p className="cat-page-card__desc">{cat.description}</p>
                    )}
                  </div>
                  <ArrowRight size={18} className="cat-page-card__arrow" />
                </div>
              </Link>
            ))}
          </StaggerGrid>
        )}
      </div>

      <style>{`
        /* ── Category Page Header ── */
        .cats-page-header {
          background: var(--surface-container-lowest);
          border-bottom: 1px solid var(--outline-variant);
          padding: 52px 0 48px;
        }
        .cats-page-header__title {
          font-family: var(--font-serif);
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 600;
          color: var(--on-surface);
          margin: 10px 0 12px;
        }
        .cats-page-header__sub {
          color: var(--on-surface-variant);
          font-size: 14px;
          margin-top: 16px;
          max-width: 460px;
        }

        /* ── Grid ── */
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }

        /* ── Category Card ── */
        .cat-page-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--outline-variant);
          background: var(--ivory);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .cat-page-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-lg);
            border-color: var(--outline);
          }
        }
        .cat-page-card__img-wrap {
          position: relative;
          aspect-ratio: 4 / 3;
          background: var(--surface-container-low);
          overflow: hidden;
        }
        .cat-page-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .cat-page-card:hover .cat-page-card__img {
            transform: scale(1.05);
          }
        }
        .cat-page-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-container);
          font-family: var(--font-serif);
          font-size: 64px;
          font-weight: 600;
          color: var(--primary);
        }
        .cat-page-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26,20,22,0.12) 0%, transparent 60%);
        }
        .cat-page-card__body {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cat-page-card__info {
          flex: 1;
          min-width: 0;
        }
        .cat-page-card__name {
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 600;
          color: var(--on-surface);
          margin: 0 0 4px;
        }
        .cat-page-card__desc {
          font-size: 13px;
          color: var(--on-surface-variant);
          line-height: 1.4;
          margin: 0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .cat-page-card__arrow {
          color: var(--primary);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }
        @media (hover: hover) and (pointer: fine) {
          .cat-page-card:hover .cat-page-card__arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Skeleton */
        .cat-page-skeleton {
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--outline-variant);
          background: var(--ivory);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .cats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .cat-page-card__name { font-size: 17px; }
          .cat-page-card__body { padding: 12px 14px; }
        }
      `}</style>
    </div>
  );
}
