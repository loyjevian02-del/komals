import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Store, ChevronLeft } from 'lucide-react';
import { api, imageUrl } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Lightbox from '../components/Lightbox.jsx';
import Pagination from '../components/Pagination.jsx';

export default function CategoryProducts() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const pageParam = parseInt(params.get('page') || '0', 10);
  const [page, setPage] = useState(isNaN(pageParam) ? 0 : pageParam);
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Load all categories for pills, and current category details if a slug is present
  useEffect(() => {
    api.get('/store/categories').then((r) => setAllCategories(r.data)).catch(() => { });
    if (slug) {
      api.get(`/store/categories/${slug}`).then((r) => setCategory(r.data)).catch(() => setCategory(null));
    } else {
      setCategory(null);
    }
  }, [slug]);

  // Sync page state with query param
  useEffect(() => {
    const p = parseInt(params.get('page') || '0', 10);
    setPage(isNaN(p) ? 0 : p);
  }, [params]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    const queryParams = { page, size: 20 };
    if (slug) {
      queryParams.category = slug;
    }

    api.get('/store/products', { params: queryParams })
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
          setProducts([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleBack(e) {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/categories');
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    setParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const gallery = category?.gallery || [];
  const showGallery = !loading && products.length === 0 && gallery.length > 0;

  return (
    <div className="container" style={{ padding: '36px 24px 80px' }}>

      {/* Category Filter Pills */}
      <div className="cat-filter-row" role="navigation" aria-label="Category filters" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        <Link
          to="/categories"
          className={`cat-filter-pill ${!slug ? 'cat-filter-pill--active' : ''}`}
          style={{
            padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            background: !slug ? 'var(--primary)' : 'var(--surface-container-low)',
            color: !slug ? 'var(--on-primary)' : 'var(--on-surface)',
            border: '1px solid var(--outline-variant)',
            textDecoration: 'none'
          }}
        >
          All
        </Link>
        {allCategories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categories/${cat.slug}`}
            className={`cat-filter-pill${cat.slug === slug ? ' cat-filter-pill--active' : ''}`}
            style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              background: cat.slug === slug ? 'var(--primary)' : 'var(--surface-container-low)',
              color: cat.slug === slug ? 'var(--on-primary)' : 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
              textDecoration: 'none'
            }}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: '0 0 6px', fontWeight: 700 }}>
          {slug ? (category?.name || 'Category') : 'All Delicacies'}
        </h1>
        {totalElements > 0 && (
          <p style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: 13 }}>
            {totalElements} {totalElements === 1 ? 'product available' : 'products available'}
          </p>
        )}
      </div>

      {loading && products.length === 0 && (
        <p style={{ color: 'var(--on-surface-variant)', padding: '24px 0' }}>Loading products...</p>
      )}

      {products.length === 0 && !showGallery && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '56px 24px',
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(180deg, var(--surface-container-low), var(--surface-container))',
          border: '1px solid var(--surface-container-highest)',
        }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 650, color: 'var(--on-surface)' }}>
            No products found
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--on-surface-variant)' }}>
            Check back soon for freshly prepared batches!
          </p>
        </div>
      )}

      {showGallery ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              style={{
                border: 'none', padding: 0, cursor: 'pointer', borderRadius: 'var(--radius)',
                overflow: 'hidden', aspectRatio: '1 / 1', background: 'var(--surface-container-low)',
              }}
            >
              <img src={imageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="product-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
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

      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}