import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ page, totalPages, totalElements, onPageChange, size = 20 }) {
  if (!totalPages || totalPages <= 1) return null;

  const startRecord = page * size + 1;
  const endRecord = Math.min((page + 1) * size, totalElements);

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(0, page - 2);
  let endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(0, endPage - maxButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  const btnBase = {
    border: '1px solid var(--outline-variant)',
    background: 'var(--ivory)',
    color: 'var(--on-surface)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  };

  return (
    <div className="pagination-wrap">
      <div className="pagination-controls" role="navigation" aria-label="Page navigation">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          aria-label="First page"
          style={{ ...btnBase, width: 36, height: 36, opacity: page === 0 ? 0.35 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronsLeft size={15} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
          style={{ ...btnBase, padding: '0 14px', height: 36, gap: 4, fontSize: 13, fontWeight: 500, opacity: page === 0 ? 0.35 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={15} /> Prev
        </button>

        {pages.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p + 1}`}
              aria-current={isActive ? 'page' : undefined}
              style={{
                ...btnBase,
                minWidth: 36, height: 36,
                padding: '0 8px',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'var(--primary)' : 'var(--ivory)',
                color: isActive ? '#fff' : 'var(--on-surface)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--outline-variant)',
              }}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
          style={{ ...btnBase, padding: '0 14px', height: 36, gap: 4, fontSize: 13, fontWeight: 500, opacity: page >= totalPages - 1 ? 0.35 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
        >
          Next <ChevronRight size={15} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          aria-label="Last page"
          style={{ ...btnBase, width: 36, height: 36, opacity: page >= totalPages - 1 ? 0.35 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronsRight size={15} />
        </button>
      </div>

      <p className="pagination-info">
        Showing {startRecord}–{endRecord} of {totalElements}
      </p>

      <style>{`
        .pagination-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          margin-top: 48px;
          padding: 16px 0;
        }
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pagination-info {
          font-size: 12px;
          color: var(--on-surface-variant);
          margin: 0;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}
