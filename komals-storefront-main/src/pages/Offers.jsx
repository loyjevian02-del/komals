import { useEffect, useState } from 'react';
import { api, imageUrl } from '../lib/api.js';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/store/offers')
      .then((r) => setOffers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="offers-page-header">
        <div className="container">
          <span className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>Exclusive</span>
          <h1 className="offers-page-header__title">Offers & Promotions</h1>
          <div style={{ width: 48, height: 1.5, background: 'var(--gold)', marginTop: 14, opacity: 0.7 }} />
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        {loading ? (
          <div className="offers-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="offer-card-skeleton">
                <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
                <div style={{ padding: '20px 22px' }}>
                  <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 3, marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 24, borderRadius: 4, marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="offers-empty">
            <div className="offers-empty__icon" aria-hidden="true">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="25" stroke="var(--outline-variant)" strokeWidth="1.2" />
                <path d="M18 26 C18 21.6 21.6 18 26 18 C30.4 18 34 21.6 34 26 C34 30.4 30.4 34 26 34 C21.6 34 18 30.4 18 26Z" stroke="var(--outline)" strokeWidth="1" fill="none" />
                <path d="M26 22 L26 26 L29 29" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="offers-empty__title">Check Back Soon</h2>
            <p className="offers-empty__body">
              We're preparing something special for you. Stay tuned for our upcoming offers and promotions.
            </p>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                {offer.image && (
                  <div className="offer-card__img-wrap">
                    <img
                      src={imageUrl(offer.image)}
                      alt={offer.title || ''}
                      className="offer-card__img"
                      loading="lazy"
                    />
                    <div className="offer-card__img-overlay" />
                  </div>
                )}
                <div className="offer-card__body">
                  {offer.badge && (
                    <span className="offer-card__badge">{offer.badge}</span>
                  )}
                  {offer.title && (
                    <h2 className="offer-card__title">{offer.title}</h2>
                  )}
                  {offer.description && (
                    <p className="offer-card__desc">{offer.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .offers-page-header {
          background: var(--primary);
          padding: 52px 0 48px;
        }
        .offers-page-header__title {
          font-family: var(--font-serif);
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 600;
          color: #fff;
          margin: 10px 0;
        }
        .offers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
        }
        .offer-card {
          background: var(--ivory);
          border: 1px solid var(--outline-variant);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .offer-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--gold);
        }
        .offer-card__img-wrap {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
        }
        .offer-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .offer-card:hover .offer-card__img {
          transform: scale(1.05);
        }
        .offer-card__img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(74,13,24,0.2) 0%, transparent 50%);
        }
        .offer-card__body {
          padding: 20px 22px 24px;
        }
        .offer-card__badge {
          display: inline-block;
          background: var(--primary-container);
          color: var(--primary);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
          margin-bottom: 12px;
        }
        .offer-card__title {
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 600;
          color: var(--on-surface);
          margin: 0 0 8px;
        }
        .offer-card__desc {
          font-size: 14px;
          color: var(--on-surface-variant);
          line-height: 1.6;
          margin: 0;
        }
        .offer-card-skeleton {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--outline-variant);
          background: var(--ivory);
        }
        .offers-empty {
          text-align: center;
          padding: 80px 24px;
        }
        .offers-empty__icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          opacity: 0.6;
        }
        .offers-empty__title {
          font-family: var(--font-serif);
          font-size: 26px;
          color: var(--on-surface);
          margin: 0 0 10px;
        }
        .offers-empty__body {
          font-size: 14px;
          color: var(--on-surface-variant);
          max-width: 380px;
          margin: 0 auto;
          line-height: 1.7;
        }
        @media (max-width: 640px) {
          .offers-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
