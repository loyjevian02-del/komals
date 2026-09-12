import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, imageUrl } from '../lib/api.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);

  function load() {
    api.get('/admin/categories').then((r) => setCategories(r.data)).catch(() => {});
  }

  useEffect(load, []);

  async function remove(id) {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/admin/categories/${id}`);
    load();
  }

  async function toggleActive(c) {
    await api.put(`/admin/categories/${c.id}`, {
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      rank: c.rank,
      active: !c.active,
    });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 20, margin: 0 }}>Categories</h1>
        <Link to="/categories/new" className="btn btn-primary"><Plus size={16} /> New Category</Link>
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr><th></th><th>Name</th><th>Slug</th><th>Rank</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.image && (
                      <img
                        src={imageUrl(c.image)}
                        alt=""
                        style={{
                          width: '100%', height: '100%',
                          objectFit: c.image.toLowerCase().endsWith('.svg') ? 'contain' : 'cover',
                          padding: c.image.toLowerCase().endsWith('.svg') ? 5 : 0,
                        }}
                      />
                    )}
                  </div>
                </td>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.rank}</td>
                <td>
                  <button
                    type="button"
                    className={`status-toggle ${c.active ? 'on' : ''}`}
                    onClick={() => toggleActive(c)}
                    title={c.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                  >
                    <span className="status-toggle-knob" />
                  </button>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/categories/${c.id}`} className="btn btn-secondary"><Pencil size={14} /></Link>
                  <button className="btn btn-danger" onClick={() => remove(c.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
