import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Package,
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown
} from 'lucide-react';
import { api, imageUrl } from '../lib/api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt,desc');

  // Load categories for filter dropdown
  useEffect(() => {
    api.get('/admin/categories')
      .then((r) => setCategories(r.data || []))
      .catch(() => { });
  }, []);

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError('');

    const params = {
      page,
      size,
      sort: sortBy,
    };
    if (search.trim()) params.q = search.trim();
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedStatus === 'active') params.active = true;
    if (selectedStatus === 'inactive') params.active = false;

    api.get('/admin/products', { params })
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
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed to load products';
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, size, search, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 0 when filters change
  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(0);
  }

  function handleCategoryChange(e) {
    setSelectedCategory(e.target.value);
    setPage(0);
  }

  function handleStatusChange(e) {
    setSelectedStatus(e.target.value);
    setPage(0);
  }

  function handleSortChange(e) {
    setSortBy(e.target.value);
    setPage(0);
  }

  function handleSizeChange(e) {
    setSize(Number(e.target.value));
    setPage(0);
  }

  async function remove(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  }

  async function toggleActive(p) {
    try {
      await api.put(`/admin/products/${p.id}`, {
        title: p.title,
        description: p.description,
        slug: p.slug,
        partNo: p.partNo,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        unit: p.unit,
        active: !p.active,
        categoryId: p.categoryId,
        images: p.images,
      });
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product status');
    }
  }

  const startRecord = totalElements === 0 ? 0 : page * size + 1;
  const endRecord = Math.min((page + 1) * size, totalElements);

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--on-surface)' }}>
            Products & Catalog
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Manage product inventory, pricing, images, and category assignments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* <Link to="/products/import" className="btn btn-secondary" style={{ borderRadius: 10 }}>
            <Upload size={16} /> Import
          </Link> */}
          <Link to="/products/new" className="btn btn-primary" style={{ borderRadius: 10, fontWeight: 600 }}>
            <Plus size={16} /> New Product
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1, minWidth: 300 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
            <input
              type="text"
              placeholder="Search title, part number…"
              value={search}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 8,
                border: '1.5px solid var(--outline-variant)',
                fontSize: 13.5,
                background: '#ffffff',
                color: 'var(--on-surface)',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: 160 }}>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid var(--outline-variant)',
                fontSize: 13.5,
                background: '#ffffff',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: 130 }}>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid var(--outline-variant)',
                fontSize: 13.5,
                background: '#ffffff',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Sort & Size Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid var(--outline-variant)',
                fontSize: 13.5,
                background: '#ffffff',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="createdAt,desc">Newest First</option>
              <option value="createdAt,asc">Oldest First</option>
              <option value="title,asc">Title (A-Z)</option>
              <option value="title,desc">Title (Z-A)</option>
              {/* <option value="price,asc">Price (Low to High)</option> */}
              {/* <option value="price,desc">Price (High to Low)</option> */}
              <option value="partNo,asc">Part No (A-Z)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Per page:</span>
            <select
              value={size}
              onChange={handleSizeChange}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1.5px solid var(--outline-variant)',
                fontSize: 13.5,
                background: '#ffffff',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--error-container)',
          color: 'var(--on-error-container)',
          padding: '12px 16px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13.5,
          fontWeight: 500
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="table-scroll" style={{ boxShadow: 'var(--shadow-md)', background: '#fff' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>Image</th>
              <th style={{ width: 140 }}>Part No</th>
              <th>Title</th>
              <th style={{ width: 180 }}>Category</th>
              {/* <th style={{ width: 130 }}>Price</th> */}
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 120, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 18px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  Loading product catalog…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--surface-container-high)',
                      color: 'var(--on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={26} />
                    </div>
                    <div style={{ fontWeight: 650, fontSize: 16, color: 'var(--on-surface)' }}>
                      No Products Found
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'var(--on-surface-variant)', maxWidth: 420 }}>
                      {search || selectedCategory || selectedStatus
                        ? 'No products matched your search/filter criteria. Try resetting filters.'
                        : 'Your database currently has no products. Click "+ New Product" to create one or "Import" to upload products from Excel / ZIP.'}
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      <Link to="/products/new" className="btn btn-primary" style={{ borderRadius: 10 }}>
                        <Plus size={16} /> Add Product
                      </Link>
                      {/* <Link to="/products/import" className="btn btn-secondary" style={{ borderRadius: 10 }}>
                        <Upload size={16} /> Import Excel / ZIP
                      </Link> */}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--surface-container-highest)'
                    }}>
                      {p.images?.[0] ? (
                        <img src={imageUrl(p.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={18} color="var(--outline)" />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{p.partNo || '—'}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{p.title}</div>
                    {p.slug && <div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)' }}>/{p.slug}</div>}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--surface-container-low)',
                      border: '1px solid var(--outline-variant)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--on-surface-variant)'
                    }}>
                      {p.categoryName || 'Uncategorized'}
                    </span>
                  </td>
                  {/* <td style={{ fontWeight: 650, color: 'var(--primary)' }}>
                    ₹{Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td> */}
                  <td>
                    <button
                      type="button"
                      className={`status-toggle ${p.active ? 'on' : ''}`}
                      onClick={() => toggleActive(p)}
                      title={p.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                    >
                      <span className="status-toggle-knob" />
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Link
                        to={`/products/${p.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', borderRadius: 8 }}
                        title="Edit Product"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', borderRadius: 8 }}
                        onClick={() => remove(p.id)}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalElements > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
          padding: '12px 16px',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: 'var(--shadow-md)',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)' }}>
            Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of <strong>{totalElements}</strong> products
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage(0)}
              disabled={page === 0}
              style={{ padding: '6px 10px', borderRadius: 8, opacity: page === 0 ? 0.5 : 1 }}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '6px 10px', borderRadius: 8, opacity: page === 0 ? 0.5 : 1 }}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: 13.5, fontWeight: 600, padding: '0 8px', color: 'var(--on-surface)' }}>
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ padding: '6px 10px', borderRadius: 8, opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              style={{ padding: '6px 10px', borderRadius: 8, opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
