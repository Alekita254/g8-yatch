import { Search } from 'lucide-react';

export default function DataTable({
  rows,
  columns,
  getRowKey,
  title,
  description,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search',
  emptyMessage = 'No records found.',
  minWidth = '760px',
  pagination,
}) {
  const total = pagination?.total ?? rows.length;
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? rows.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="overflow-hidden rounded-lg border border-app-border bg-app-card">
      {(title || description || onSearchChange) && (
        <div className="flex flex-col gap-3 border-b border-app-border bg-app-elevated p-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <p className="text-sm font-black text-app-text">{title}</p> : null}
            {description ? <p className="text-xs font-bold text-app-muted">{description}</p> : null}
          </div>
          {onSearchChange ? (
            <label className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
              <input
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-app-border bg-app-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
          ) : null}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-10 text-center text-sm font-bold text-app-muted">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth }}>
            <thead className="border-b border-app-border bg-app-elevated text-xs font-black uppercase tracking-[0.12em] text-app-muted">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-3 ${column.headerClassName || ''}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => (
                <tr key={getRowKey(row)} className="align-top transition hover:bg-app-elevated/60">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-4 ${column.cellClassName || ''}`}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination ? (
        <div className="flex flex-col gap-3 border-t border-app-border bg-app-elevated px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
          <p className="font-bold text-app-muted">
            Showing {rows.length ? ((page - 1) * pageSize) + 1 : 0}-{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase text-app-muted">
              Rows
              <select
                value={pageSize}
                onChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}
                className="rounded-md border border-app-border bg-app-card px-2 py-1.5 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
              >
                {(pagination.pageSizeOptions || [20, 50, 100]).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => pagination.onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-md border border-app-border px-3 py-1.5 text-xs font-black uppercase text-app-text transition hover:border-brand-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-black uppercase text-app-muted">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => pagination.onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md border border-app-border px-3 py-1.5 text-xs font-black uppercase text-app-text transition hover:border-brand-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
