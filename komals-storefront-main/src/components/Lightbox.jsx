import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageUrl } from '../lib/api.js';

/** Full-screen image viewer. index/onIndexChange let the caller drive prev/next. */
export default function Lightbox({ images, index, onIndexChange, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length);
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onIndexChange, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)',
          border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer',
        }}
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Previous image"
          onClick={(e) => { e.stopPropagation(); onIndexChange((index - 1 + images.length) % images.length); }}
          style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <img
        src={imageUrl(images[index])}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }}
      />

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Next image"
          onClick={(e) => { e.stopPropagation(); onIndexChange((index + 1) % images.length); }}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          color: '#fff', fontSize: 13, opacity: 0.8,
        }}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
