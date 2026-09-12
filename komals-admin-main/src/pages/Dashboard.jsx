import { useEffect, useState } from 'react';
import { Eye, Package, FolderTree, TrendingUp } from 'lucide-react';
import { api } from '../lib/api.js';

const cards = [
  { key: 'totalVisits', label: 'Total Site Visits', icon: Eye },
  { key: 'visitsLast7d', label: 'Visits (7 days)', icon: TrendingUp },
  { key: 'totalProducts', label: 'Products', icon: Package },
  { key: 'totalCategories', label: 'Categories', icon: FolderTree },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics/summary').then((r) => setSummary(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {cards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="card hover-card">
            <Icon size={20} color="var(--primary)" />
            <div style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.5px', marginTop: 10 }}>{summary ? summary[key] : '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
