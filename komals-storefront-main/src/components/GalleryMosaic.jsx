import { imageUrl } from '../lib/api.js';

/** Renders gallery photos in a mosaic grid — every 5th tile spans 2x2 for visual rhythm. */
export default function GalleryMosaic({ images, onImageClick }) {
  return (
    <div className="gallery-mosaic">
      {images.map((img, i) => (
        <button
          key={img.id}
          type="button"
          className={`gallery-mosaic__tile${i % 5 === 0 ? ' gallery-mosaic__tile--big' : ''}`}
          onClick={() => onImageClick?.(i)}
          aria-label={img.caption || 'View photo'}
        >
          <img src={imageUrl(img.image)} alt={img.caption || ''} loading="lazy" />
        </button>
      ))}

      <style>{`
        .gallery-mosaic {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 140px;
          gap: 10px;
        }
        .gallery-mosaic__tile {
          position: relative;
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface-container-low);
        }
        .gallery-mosaic__tile--big {
          grid-column: span 2;
          grid-row: span 2;
        }
        .gallery-mosaic__tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .gallery-mosaic__tile:hover img {
            transform: scale(1.06);
          }
        }
        @media (max-width: 720px) {
          .gallery-mosaic {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 110px;
          }
        }
      `}</style>
    </div>
  );
}
