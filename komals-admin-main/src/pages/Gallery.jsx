import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, imageUrl } from '../lib/api.js';

export default function Gallery() {
  const [images, setImages] = useState([]);

  function load() {
    api.get('/admin/gallery').then((r) => setImages(r.data)).catch(() => {});
  }

  useEffect(load, []);

  async function remove(id) {
    if (!confirm('Delete this gallery image?')) return;
    await api.delete(`/admin/gallery/${id}`);
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
        <Link to="/gallery/new" className="btn btn-primary"><Plus size={16} /> New Image</Link>
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
