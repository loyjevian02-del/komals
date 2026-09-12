import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const pageParam = parseInt(params.get('page') || '0', 10);
  const [page, setPage] = useState(isNaN(pageParam) ? 0 : pageParam);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = parseInt(params.get('page') || '0', 10);
    setPage(isNaN(p) ? 0 : p);
  }, [params]);

  const loadSearch = useCallback(() => {
    if (!q.trim()) {
      setProducts([]); setTotalPages(0); setTotalElements(0);
      return;
    }
    setLoading(true);
    api.get('/store/products', { params: { q: q.trim(), page, size: 20 } })
      .then((r) => {
        if (r.data && Array.isArray(r.data.content)) {
          setProducts(r.data.content);
          setTotalPages(r.data.totalPages || 0);
          setTotalElements(r.data.totalElements || 0);
        } else if (Array.isArray(r.data)) {
          setProducts(r.data);
          setTotalPages(1);
          setTotalElements(r.data.length);
        } else {
          setProducts([]); setTotalPages(0); setTotalElements(0);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    if (page === 0) {
      api.post('/store/analytics/search', { query: q }).catch(() => {});
    }
  }, [q, page]);

  useEffect(() => { loadSearch(); }, [loadSearch]);

  function handleBack(e) {
    e.preventDefault();
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    setParams({ q, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      {/* Search Header */}
      <div className="search-page-header">
        <div className="container">
          <div className="search-page-header__inner">
            <div>
              <span className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>Search Results</span>
              <h1 className="search-page-header__title">
                {q ? (
                  <><em>"{q}"</em></>
                ) : (
                  'Search'
                )}
              </h1>
              {totalElements > 0 && (
                <span className="search-results-count">
                  {totalElements} {totalElements === 1 ? 'sweet found' : 'sweets found'}
                </span>
              )}
            </div>
            <Link to="/" className="search-clear-btn" aria-label="Clear search">
              <X size={14} /> Clear
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {loading && products.length === 0 ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton product-skeleton__img" />
                <div style={{ padding: '14px 16px' }}>
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty__icon" aria-hidden="true">
              <Search size={36} strokeWidth={1} />
            </div>
            {q ? (
              <>
                <h2 className="search-empty__title">No sweets found</h2>
                <p className="search-empty__body">
                  We couldn't find anything matching <strong>"{q}"</strong>. Try a different search term.
                </p>
              </>
            ) : (
              <>
                <h2 className="search-empty__title">Search for sweets</h2>
                <p className="search-empty__body">
                  Type at least 3 characters in the search bar to find sweets.
                </p>
              </>
            )}
            <Link to="/" className="btn-outline">Back to Home</Link>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              size={20}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <style>{`
        .search-page-header {
          background: var(--primary);
          padding: 44px 0 40px;
        }
        .search-page-header__inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }
        .search-page-header__title {
          font-family: var(--font-serif);
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 600;
          color: #fff;
          margin: 8px 0 12px;
        }
        .search-page-header__title em {
          font-style: italic;
          color: var(--gold-light);
        }
        .search-results-count {
          display: inline-block;
          background: rgba(201,168,76,0.18);
          border: 1px solid rgba(201,168,76,0.35);
          color: var(--gold-light);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 2px;
        }
        .search-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
          margin-top: 4px;
        }
        .search-clear-btn:hover {
          background: rgba(255,255,255,0.18);
          color: #fff;
        }
        .search-empty {
          text-align: center;
          padding: 72px 24px;
        }
        .search-empty__icon {
          color: var(--outline);
          margin: 0 auto 20px;
          width: fit-content;
        }
        .search-empty__title {
          font-family: var(--font-serif);
          font-size: 26px;
          color: var(--on-surface);
          margin: 0 0 10px;
        }
        .search-empty__body {
          font-size: 14px;
          color: var(--on-surface-variant);
          max-width: 380px;
          margin: 0 auto 28px;
          line-height: 1.7;
        }
        .product-skeleton {
          background: var(--ivory);
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--outline-variant);
        }
        .product-skeleton__img {
          width: 100%;
          aspect-ratio: 4 / 5;
        }
      `}</style>
    </div>
  );
}
