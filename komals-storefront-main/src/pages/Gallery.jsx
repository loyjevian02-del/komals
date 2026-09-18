import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import GalleryMosaic from '../components/GalleryMosaic.jsx';
import Lightbox from '../components/Lightbox.jsx';
import Reveal from '../components/animations/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import { useSsrReady } from '../lib/useSsrReady.js';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    api.get('/store/gallery')
      .then((r) => setImages(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useSsrReady(!loading);

  return (
    <div>
      <Seo
        title="Gallery"
        description="Photos from Komal's Sweet Palace — our sweets, our store and our celebrations."
      />
      <Reveal>
        <div className="gallery-page-header">
          <div className="container">
            <span className="section-eyebrow">A Glimpse Inside</span>
            <h1 className="gallery-page-header__title">Our Gallery</h1>
            <div className="gold-divider gold-divider--left" />
            <p className="gallery-page-header__sub">
              Moments from our store, our sweets, and our celebrations.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 140, gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 16 }}>No photos yet. Check back soon.</p>
          </div>
        ) : (
          <GalleryMosaic images={images} onImageClick={setLightboxIndex} />
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images.map((g) => g.image)}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <style>{`
        .gallery-page-header {
          background: var(--surface-container-lowest);
          border-bottom: 1px solid var(--outline-variant);
          padding: 52px 0 48px;
        }
        .gallery-page-header__title {
          font-family: var(--font-serif);
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 600;
          color: var(--on-surface);
          margin: 10px 0 12px;
        }
        .gallery-page-header__sub {
          color: var(--on-surface-variant);
          font-size: 14px;
          margin-top: 16px;
          max-width: 460px;
        }
      `}</style>
    </div>
  );
}
