import { imageUrl } from '../lib/api.js';

/**
 * Renders a category's icon/image.
 * - coverMode: renders as a full cover photo (for category cards)
 * - default: icon mode with padding (for circular tiles etc.)
 */
export default function CategoryIcon({ category, fallbackStyle, coverMode = false }) {
  if (!category.image) {
    return (
      <span style={{ fontWeight: 700, color: 'var(--outline)', ...fallbackStyle }}>
        {category.name?.[0] || '?'}
      </span>
    );
  }

  if (coverMode) {
    return (
      <img
        src={imageUrl(category.image)}
        alt={category.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    );
  }

  return (
    <img
      src={imageUrl(category.image)}
      alt={category.name}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        // icon art bleeds close to its own canvas edges (badges in the corner), so shrink it
        // enough that those corners land inside the circular mask instead of getting clipped
        padding: '26%',
      }}
    />
  );
}
