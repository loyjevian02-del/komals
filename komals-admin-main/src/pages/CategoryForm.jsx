import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ImageUploader, MultiImageUploader } from '../components/ImageUploader.jsx';

const empty = { name: '', slug: '', description: '', image: '', rank: 0, active: true, gallery: [] };

export default function CategoryForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!isNew) {
      api.get(`/admin/categories/${id}`).then((r) => setForm(r.data));
    }
  }, [id, isNew]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function save(e) {
    e.preventDefault();
    const payload = { ...form, rank: Number(form.rank) || 0 };
    if (isNew) {
      await api.post('/admin/categories', payload);
    } else {
      await api.put(`/admin/categories/${id}`, payload);
    }
    navigate('/categories');
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>{isNew ? 'New Category' : 'Edit Category'}</h1>
      <form onSubmit={save} className="card" style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => {
            const name = e.target.value;
            set('name', name);
            if (isNew) set('slug', slugify(name));
          }} />
        </div>
        <div className="field">
          <label>Slug</label>
          <input required value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="field">
          <label>Icon</label>
          <ImageUploader value={form.image} onChange={(url) => set('image', url)} accept="image/jpeg,image/png,image/svg+xml" />
        </div>
        <div className="field">
          <label>Product Gallery</label>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--outline)' }}>
            Shown on the storefront when this category has no products yet.
          </p>
          <MultiImageUploader value={form.gallery} onChange={(urls) => set('gallery', urls)} />
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/categories')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
