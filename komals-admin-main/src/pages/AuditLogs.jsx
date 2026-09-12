import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import { History, RefreshCw } from 'lucide-react';

const ACTION_COLORS = {
  CREATE: { bg: 'rgba(22, 163, 74, 0.09)', fg: '#15803d' },
  UPDATE: { bg: 'rgba(2, 132, 199, 0.09)', fg: '#0369a1' },
  DELETE: { bg: 'rgba(220, 38, 38, 0.09)', fg: '#b91c1c' },
  ADD_IMAGE: { bg: 'rgba(124, 58, 237, 0.09)', fg: '#6d28d9' },
  DELETE_IMAGE: { bg: 'rgba(220, 38, 38, 0.09)', fg: '#b91c1c' },
  IMPORT_EXCEL: { bg: 'rgba(217, 119, 6, 0.1)', fg: '#b45309' },
  IMPORT_IMAGES: { bg: 'rgba(217, 119, 6, 0.1)', fg: '#b45309' },
};

const ENTITY_TYPES = ['PRODUCT', 'CATEGORY', 'OFFER'];
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'ADD_IMAGE', 'DELETE_IMAGE', 'IMPORT_EXCEL', 'IMPORT_IMAGES'];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, size: 50 };
      if (entityType) params.entityType = entityType;
      if (action) params.action = action;
      if (actor) params.actor = actor;
      const res = await api.get('/admin/audit-logs', { params });
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, entityType, action, actor]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function applyFilters(e) {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  }

  const inputStyle = {
    border: '1.5px solid #d7c9a3',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 13.5,
    outline: 'none',
    background: '#ffffff',
    color: 'var(--on-surface)',
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <History size={20} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--on-surface)' }}>
              Activity Log
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Who changed what, and when — products, categories, offers, and bulk imports.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '9px 16px' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <form
        onSubmit={applyFilters}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}
      >
        <select value={entityType} onChange={(e) => setEntityType(e.target.value)} style={inputStyle}>
          <option value="">All entity types</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={action} onChange={(e) => setAction(e.target.value)} style={inputStyle}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a.replaceAll('_', ' ')}</option>)}
        </select>

        <input
          type="text"
          placeholder="Filter by user…"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          style={{ ...inputStyle, minWidth: 180 }}
        />

        <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: '9px 18px', fontWeight: 600 }}>
          Apply
        </button>
      </form>

      {error && (
        <div style={{
          background: 'var(--error-container)', color: 'var(--on-error-container)',
          padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13.5, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      <div className="table-scroll" style={{ boxShadow: 'var(--shadow-md)', background: '#fff' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 18px', width: '16%' }}>When</th>
              <th style={{ padding: '14px 18px', width: '14%' }}>User</th>
              <th style={{ padding: '14px 18px', width: '14%' }}>Action</th>
              <th style={{ padding: '14px 18px', width: '12%' }}>Entity</th>
              <th style={{ padding: '14px 18px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  Loading activity…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  No activity recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const colors = ACTION_COLORS[log.action] || { bg: 'var(--surface-container-high)', fg: 'var(--on-surface)' };
                return (
                  <tr key={log.id}>
                    <td style={{ padding: '14px 18px', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, fontSize: 13.5, color: 'var(--on-surface)' }}>
                      {log.actor}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', fontSize: 12,
                        fontWeight: 600, background: colors.bg, color: colors.fg,
                        padding: '3px 9px', borderRadius: 999,
                      }}>
                        {log.action.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--on-surface-variant)' }}>
                      {log.entityType}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--on-surface)' }}>
                      {log.summary}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{ borderRadius: 10, padding: '8px 16px' }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--on-surface-variant)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ borderRadius: 10, padding: '8px 16px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
