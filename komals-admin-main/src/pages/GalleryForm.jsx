import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ImageUploader } from '../components/ImageUploader.jsx';

const empty = { image: '', caption: '', rank: 0, active: true };

export default function GalleryForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!isNew) {
      api.get(`/admin/gallery/${id}`).then((r) => setForm(r.data));
    }
  }, [id, isNew]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    const payload = { ...form, rank: Number(form.rank) || 0 };
    if (isNew) {
      await api.post('/admin/gallery', payload);
    } else {
      await api.put(`/admin/gallery/${id}`, payload);
    }
    navigate('/gallery');
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>{isNew ? 'New Gallery Image' : 'Edit Gallery Image'}</h1>
      <form onSubmit={save} className="card" style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Image</label>
          <ImageUploader value={form.image} onChange={(url) => set('image', url)} />
        </div>
        <div className="field">
          <label>Caption (optional)</label>
          <input value={form.caption || ''} onChange={(e) => set('caption', e.target.value)} />
        </div>
        <div className="field">
          <label>Rank (display order)</label>
          <input type="number" value={form.rank} onChange={(e) => set('rank', e.target.value)} />
        </div>
        <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => set('active', e.target.checked)} style={{ width: 'auto' }} />
          <label htmlFor="active" style={{ margin: 0 }}>Active (visible on storefront)</label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/gallery')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
