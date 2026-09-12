import { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { api } from '../lib/api.js';

export default function Insights() {
  const [searches, setSearches] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/admin/analytics/top-searches').then((r) => setSearches(r.data)).catch(() => {});
    api.get('/admin/analytics/top-products').then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 20, margin: 0 }}>Insights</h1>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="card">
          <h2 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
            <Search size={16} /> Top Searches
          </h2>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Query</th><th>Searches</th></tr></thead>
              <tbody>
                {searches.length === 0 && <tr><td colSpan={2}>No searches yet.</td></tr>}
                {searches.map((s) => (
                  <tr key={s.query}><td>{s.query}</td><td>{s.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
            <Eye size={16} /> Most Viewed Products
          </h2>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Product</th><th>Views</th></tr></thead>
              <tbody>
                {products.length === 0 && <tr><td colSpan={2}>No product views yet.</td></tr>}
                {products.map((p) => (
                  <tr key={p.productId}><td>{p.title}</td><td>{p.views}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
