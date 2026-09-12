import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { imageUrl, uploadImage } from '../lib/api.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB upload limit; compressed below 500KB on backend

/** Single-image uploader. value/onChange hold the stored URL path. */
export function ImageUploader({ value, onChange, accept = 'image/*' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const isSvg = value?.toLowerCase().endsWith('.svg');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be under 50MB.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload and compress image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 8, background: 'var(--surface-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
        }}>
          {value ? (
            <img
              src={imageUrl(value)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: isSvg ? 'contain' : 'cover', padding: isSvg ? 10 : 0 }}
            />
          ) : (
            <Upload size={20} color="var(--outline)" />
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Compressing & Uploading…' : 'Upload'}
          </button>
          {value && (
            <button type="button" className="btn btn-secondary" onClick={() => onChange('')}>
              <X size={14} /> Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={handleFile} />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--outline)' }}>Auto-compressed &lt;500KB (photos up to 50MB supported)</p>
    </div>
  );
}

/** Multi-image uploader for products. value/onChange hold an array of URL paths. */
export function MultiImageUploader({ value = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be under 50MB.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange([...value, url]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload and compress image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeAt(i) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        {value.map((img, i) => (
          <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
            <img src={imageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            <button type="button" onClick={() => removeAt(i)} style={{
              position: 'absolute', top: -6, right: -6, background: 'var(--error)', color: 'var(--on-error)',
              border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
        <Upload size={14} /> {uploading ? 'Compressing & Uploading…' : 'Add Image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--outline)' }}>Auto-compressed &lt;500KB (photos up to 50MB supported)</p>
    </div>
  );
}
