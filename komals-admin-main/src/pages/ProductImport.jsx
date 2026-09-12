import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Images } from 'lucide-react';
import { api } from '../lib/api.js';

// There's no per-row progress from the backend (single synchronous request), so we track two
// phases: 'uploading' has a real percentage from axios, 'processing' is indeterminate while the
// server reads/writes rows and we're just waiting on the response.
function ProgressBar({ phase, percent }) {
  if (!phase) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-container-highest)', overflow: 'hidden' }}>
        <div
          className={phase === 'processing' ? 'import-progress-indeterminate' : undefined}
          style={{
            height: '100%',
            borderRadius: 3,
            background: 'var(--primary)',
            width: phase === 'uploading' ? `${percent}%` : '40%',
            transition: phase === 'uploading' ? 'width 0.15s ease' : undefined,
          }}
        />
      </div>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
        {phase === 'uploading' ? `Uploading… ${percent}%` : 'Processing rows…'}
      </p>
    </div>
  );
}

export default function ProductImport() {
  const navigate = useNavigate();
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [excelReport, setExcelReport] = useState(null);
  const [imageReport, setImageReport] = useState(null);
  const [excelPhase, setExcelPhase] = useState(null); // null | 'uploading' | 'processing'
  const [excelPercent, setExcelPercent] = useState(0);
  const [zipPhase, setZipPhase] = useState(null);
  const [zipPercent, setZipPercent] = useState(0);
  const [error, setError] = useState('');

  async function uploadExcel(e) {
    e.preventDefault();
    if (!excelFile) return;
    setExcelPhase('uploading');
    setExcelPercent(0);
    setError('');
    setExcelReport(null);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      const r = await api.post('/admin/products/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setExcelPercent(pct);
          setExcelPhase(pct >= 100 ? 'processing' : 'uploading');
        },
      });
      setExcelReport(r.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setExcelPhase(null);
    }
  }

  async function uploadZip(e) {
    e.preventDefault();
    if (!zipFile) return;
    setZipPhase('uploading');
    setZipPercent(0);
    setError('');
    setImageReport(null);
    try {
      const formData = new FormData();
      formData.append('file', zipFile);
      const r = await api.post('/admin/products/import/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setZipPercent(pct);
          setZipPhase(pct >= 100 ? 'processing' : 'uploading');
        },
      });
      setImageReport(r.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setZipPhase(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 20, margin: 0 }}>Import Products</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Back to Products</button>
      </div>

      {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <form onSubmit={uploadExcel} className="card">
          <h2 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
            <FileSpreadsheet size={16} /> Products (Excel)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            .xlsx with columns: <strong>Product No / BarCode, Product Name / Item Description / Description, MOP / Sales Price, MRP, Category</strong>,
            and optionally <strong>Base UOM</strong> (e.g. Numbers, SquareFeet). Header spacing/case/underscores don't matter.
            Existing products are matched and updated by Product No; new ones are created.
            Categories are created automatically if they don't exist ("China " prefixes are dropped, e.g. "China Gadgets" becomes "Gadgets").
          </p>
          <div className="field">
            <input type="file" accept=".xlsx,.xls" onChange={(e) => setExcelFile(e.target.files[0] || null)} disabled={!!excelPhase} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!excelFile || !!excelPhase}>
            {excelPhase ? 'Importing…' : 'Upload & Import'}
          </button>

          <ProgressBar phase={excelPhase} percent={excelPercent} />

          {excelReport && (
            <div style={{ marginTop: 16, fontSize: 13 }}>
              <p><strong>{excelReport.created}</strong> created, <strong>{excelReport.updated}</strong> updated.</p>
              {excelReport.errors.length > 0 && (
                <ul style={{ color: 'var(--error)', paddingLeft: 18 }}>
                  {excelReport.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </form>

        <form onSubmit={uploadZip} className="card">
          <h2 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
            <Images size={16} /> Product Images (ZIP)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            A .zip of images named after each product's Part No (e.g. <strong>ABC123.jpg</strong>).
            Each image is matched to the product with that Part No and set as its photo.
          </p>
          <div className="field">
            <input type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files[0] || null)} disabled={!!zipPhase} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!zipFile || !!zipPhase}>
            {zipPhase ? 'Importing…' : 'Upload & Import'}
          </button>

          <ProgressBar phase={zipPhase} percent={zipPercent} />

          {imageReport && (
            <div style={{ marginTop: 16, fontSize: 13 }}>
              <p><strong>{imageReport.matched}</strong> images matched and saved.</p>
              {imageReport.unmatched.length > 0 && (
                <>
                  <p style={{ color: 'var(--error)', marginBottom: 4 }}>No matching product for:</p>
                  <ul style={{ color: 'var(--error)', paddingLeft: 18 }}>
                    {imageReport.unmatched.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
        </form>
      </div>

      <style>{`
        .import-progress-indeterminate {
          animation: import-progress-slide 1.1s ease-in-out infinite;
        }
        @keyframes import-progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
