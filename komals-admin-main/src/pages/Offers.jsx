import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, imageUrl } from '../lib/api.js';

export default function Offers() {
  const [offers, setOffers] = useState([]);

  function load() {
    api.get('/admin/offers').then((r) => setOffers(r.data)).catch(() => {});
  }

  useEffect(load, []);

  async function remove(id) {
    if (!confirm('Delete this offer?')) return;
    await api.delete(`/admin/offers/${id}`);
    load();
  }

  async function toggleActive(o) {
    await api.put(`/admin/offers/${o.id}`, {
      title: o.title,
      description: o.description,
      image: o.image,
      badge: o.badge,
      startsAt: o.startsAt,
      endsAt: o.endsAt,
      active: !o.active,
      rank: o.rank,
      displayType: o.displayType,
    });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 20, margin: 0 }}>Offers</h1>
        <Link to="/offers/new" className="btn btn-primary"><Plus size={16} /> New Offer</Link>
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr><th></th><th>Title</th><th>Badge</th><th>Section</th><th>Rank</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id}>
                <td>
                  <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-container)' }}>
                    {o.image && <img src={imageUrl(o.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </td>
                <td>{o.title}</td>
                <td>{o.badge || '—'}</td>
                <td>{o.displayType === 'FIXED' ? 'Fixed' : 'Scrollable'}</td>
                <td>{o.rank}</td>
                <td>
                  <button
                    type="button"
                    className={`status-toggle ${o.active ? 'on' : ''}`}
                    onClick={() => toggleActive(o)}
                    title={o.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                  >
                    <span className="status-toggle-knob" />
                  </button>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/offers/${o.id}`} className="btn btn-secondary"><Pencil size={14} /></Link>
                  <button className="btn btn-danger" onClick={() => remove(o.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
