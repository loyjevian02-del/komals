import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { MultiImageUploader } from '../components/ImageUploader.jsx';

const empty = {
  title: '', description: '', searchKeywords: '', seoTitle: '', seoDescription: '', slug: '', partNo: '', price: '', compareAtPrice: '',
  unit: '', active: true, categoryId: '', images: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/admin/categories').then((r) => setCategories(r.data));
    if (!isNew) {
      api.get(`/admin/products/${id}`).then((r) => setForm({ ...r.data, categoryId: r.data.categoryId || '' }));
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
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice),
      categoryId: form.categoryId || null,
    };
    if (isNew) {
      await api.post('/admin/products', payload);
    } else {
      await api.put(`/admin/products/${id}`, payload);
    }
    navigate('/products');
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>{isNew ? 'New Product' : 'Edit Product'}</h1>
      <form onSubmit={save} className="card form-grid">
        <div className="field">
          <label>Title</label>
          <input required value={form.title} onChange={(e) => {
            const title = e.target.value;
            set('title', title);
            if (isNew) set('slug', slugify(title));
          }} />
        </div>
        <div className="field">
          <label>Slug</label>
          <input required value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </div>
        <div className="field">
          <label>Part No</label>
          <input required value={form.partNo} onChange={(e) => set('partNo', e.target.value)} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">â€” None â€”</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {/* <div className="field">
          <label>Price (â‚¹)</label>
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div className="field">
          <label>Compare-at price (optional)</label>
          <input type="number" step="0.01" min="0" value={form.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value)} />
        </div> */}
        <div className="field">
          <label>Unit (e.g. "1 kg", "500 ml")</label>
          <input value={form.unit || ''} onChange={(e) => set('unit', e.target.value)} />
        </div>
        <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 }}>
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => set('active', e.target.checked)} style={{ width: 'auto' }} />
          <label htmlFor="active" style={{ margin: 0 }}>Active (visible on storefront)</label>
        </div>
        <div className="field field-span-all">
          <label>Description</label>
          <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="field field-span-all">
          <label>Search keywords</label>
          <input value={form.searchKeywords || ''} onChange={(e) => set('searchKeywords', e.target.value)} placeholder="e.g. Mangalore, Mangaluru, chakkuli, chakli" />
          <small>Use only natural names, spellings and regional terms that genuinely describe this product.</small>
        </div>
        <div className="field field-span-all">
          <label>SEO title (optional)</label>
          <input value={form.seoTitle || ''} onChange={(e) => set('seoTitle', e.target.value)} maxLength="60" placeholder="e.g. Crispy Chakkuli in Mangaluru" />
        </div>
        <div className="field field-span-all">
          <label>SEO description (optional)</label>
          <textarea value={form.seoDescription || ''} onChange={(e) => set('seoDescription', e.target.value)} maxLength="160" placeholder="A clear one or two sentence summary for search results." />
        </div>
        <div className="field field-span-all">
          <label>Images</label>
          <MultiImageUploader value={form.images} onChange={(images) => set('images', images)} />
        </div>
        <div className="field-span-all" style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
