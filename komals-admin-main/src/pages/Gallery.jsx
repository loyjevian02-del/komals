import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { api, imageUrl, uploadImage } from '../lib/api.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB upload limit; compressed below 500KB on backend

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const bulkInputRef = useRef(null);

  function load() {
    api.get('/admin/gallery').then((r) => setImages(r.data)).catch(() => {});
  }

  useEffect(load, []);

  async function remove(id) {
    if (!confirm('Delete this gallery image?')) return;
    await api.delete(`/admin/gallery/${id}`);
    load();
  }

  async function handleBulkFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      alert(`${oversized.length} file(s) are over 50MB and will be skipped.`);
    }
    const toUpload = files.filter((f) => f.size <= MAX_FILE_SIZE);

    setBulkUploading(true);
    let nextRank = images.reduce((max, img) => Math.max(max, img.rank), 0) + 1;
    let done = 0;
    let failed = 0;
    setBulkProgress({ done, total: toUpload.length });

    for (const file of toUpload) {
      try {
        const url = await uploadImage(file);
        await api.post('/admin/gallery', { image: url, active: true, rank: nextRank++ });
      } catch {
        failed++;
      }
      done++;
      setBulkProgress({ done, total: toUpload.length });
    }

    setBulkUploading(false);
    setBulkProgress(null);
    e.target.value = '';
    if (failed > 0) alert(`${failed} image(s) failed to upload.`);
    load();
  }

  async function toggleActive(img) {
    await api.put(`/admin/gallery/${img.id}`, {
      image: img.image,
      caption: img.caption,
      active: !img.active,
      rank: img.rank,
    });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 20, margin: 0 }}>Gallery</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => bulkInputRef.current?.click()}
            disabled={bulkUploading}
          >
            <Upload size={14} />
            {bulkUploading
              ? `Uploading ${bulkProgress?.done ?? 0}/${bulkProgress?.total ?? 0}…`
              : 'Upload Multiple'}
          </button>
          <input
            ref={bulkInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleBulkFiles}
          />
          <Link to="/gallery/new" className="btn btn-primary"><Plus size={16} /> New Image</Link>
        </div>
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr><th></th><th>Caption</th><th>Rank</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {images.map((img) => (
              <tr key={img.id}>
                <td>
                  <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-container)' }}>
                    {img.image && <img src={imageUrl(img.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </td>
                <td>{img.caption || '—'}</td>
                <td>{img.rank}</td>
                <td>
                  <button
                    type="button"
                    className={`status-toggle ${img.active ? 'on' : ''}`}
                    onClick={() => toggleActive(img)}
                    title={img.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                  >
                    <span className="status-toggle-knob" />
                  </button>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/gallery/${img.id}`} className="btn btn-secondary"><Pencil size={14} /></Link>
                  <button className="btn btn-danger" onClick={() => remove(img.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
