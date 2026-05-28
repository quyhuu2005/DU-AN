import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { orderService, type Order } from '../../services/orderService';
import { formatCurrency } from '../../utils';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: 'Đã thanh toán', color: '#10B981', bg: '#D1FAE5' },
  PAID:      { label: 'Đã thanh toán', color: '#10B981', bg: '#D1FAE5' },
  CANCELLED: { label: 'Đã hủy',        color: '#EF4444', bg: '#FEE2E2' },
  PENDING:   { label: 'Chờ xử lý',     color: '#F97316', bg: '#FFF7ED' },
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function OrderHistoryPage() {
  const { user } = useAuth();
  const branchId = user?.branchId;

  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // date range filter (today | week | month | all)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const fetchOrders = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getHistory(branchId);
      setOrders(res.data ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const matchSearch = search === '' ||
      o.tableName?.toLowerCase().includes(search.toLowerCase()) ||
      o.staffName?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);

    if (!matchSearch) return false;
    if (period === 'all') return true;

    const created = new Date(o.createdAt);
    const now = new Date();
    if (period === 'today') {
      return created.toDateString() === now.toDateString();
    }
    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return created >= weekAgo;
    }
    if (period === 'month') {
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
  const totalOrders  = filtered.length;

  const PERIOD_OPTS = [
    { value: 'all',   label: 'Tất cả' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week',  label: '7 ngày' },
    { value: 'month', label: 'Tháng này' },
  ] as const;

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch sử Đơn hàng</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Chi nhánh #{branchId} — Tất cả đơn hàng đã hoàn tất
          </p>
        </div>
        <button className="btn-primary" onClick={fetchOrders} disabled={loading}>
          <span className="material-symbols-outlined text-base">refresh</span>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* ── KPI Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: 'payments',     label: 'Tổng doanh thu (đang lọc)', value: formatCurrency(totalRevenue), color: '#F97316' },
          { icon: 'receipt_long', label: 'Số đơn hàng (đang lọc)',    value: totalOrders.toString(),       color: '#3B82F6' },
          { icon: 'bar_chart',    label: 'Trung bình / đơn',          value: totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '—', color: '#10B981' },
        ].map(c => (
          <div key={c.label} className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: c.color + '18' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: c.color }}>{c.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{c.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base"
              style={{ color: 'var(--color-text-secondary)' }}>search</span>
            <input
              className="input pl-9 w-full"
              placeholder="Tìm theo bàn, nhân viên, mã đơn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Period */}
          <div className="flex gap-2 flex-wrap">
            {PERIOD_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                style={period === opt.value ? {
                  background: 'var(--color-primary)',
                  color: '#fff',
                  borderColor: 'var(--color-primary)',
                } : {
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-6" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger-bg)' }}>
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
        </div>
      )}

      {/* ── Table ── */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Bàn</th>
                <th>Nhân viên</th>
                <th>Thời gian</th>
                <th className="text-right">Tổng tiền</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-5xl" style={{ color: 'var(--color-border)' }}>
                            receipt_long
                          </span>
                          <p style={{ color: 'var(--color-text-secondary)' }}>
                            {search || period !== 'all' ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào được thanh toán'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                : filtered.map((order) => {
                    const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.COMPLETED;
                    const isExpanded = expandedId === order.id;
                    return (
                      <>
                        <tr key={order.id} style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                          <td className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            #{order.id}
                          </td>
                          <td className="font-semibold">{order.tableName || `Bàn ${order.tableId}`}</td>
                          <td>{order.staffName || '—'}</td>
                          <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{fmtDate(order.createdAt)}</td>
                          <td className="text-right font-bold" style={{ color: 'var(--color-primary)' }}>
                            {formatCurrency(order.totalPrice ?? 0)}
                          </td>
                          <td className="text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors"
                              style={{
                                background: isExpanded ? 'var(--color-primary)' : 'var(--color-bg)',
                                color: isExpanded ? '#fff' : 'var(--color-text-secondary)',
                              }}
                            >
                              <span className="material-symbols-outlined text-base">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                            </button>
                          </td>
                        </tr>

                        {/* ── Expanded detail row ── */}
                        {isExpanded && (
                          <tr key={`${order.id}-detail`}>
                            <td colSpan={7} style={{ background: 'var(--color-bg)', padding: '12px 24px 16px' }}>
                              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="px-4 py-3 border-b text-sm font-semibold flex items-center gap-2"
                                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                                  <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)' }}>
                                    list_alt
                                  </span>
                                  Chi tiết đơn hàng #{order.id}
                                </div>
                                {order.items && order.items.length > 0 ? (
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr style={{ background: 'var(--color-surface)' }}>
                                        <th className="text-left px-4 py-2 font-semibold text-xs"
                                          style={{ color: 'var(--color-text-secondary)' }}>Món ăn</th>
                                        <th className="text-center px-4 py-2 font-semibold text-xs"
                                          style={{ color: 'var(--color-text-secondary)' }}>SL</th>
                                        <th className="text-right px-4 py-2 font-semibold text-xs"
                                          style={{ color: 'var(--color-text-secondary)' }}>Đơn giá</th>
                                        <th className="text-right px-4 py-2 font-semibold text-xs"
                                          style={{ color: 'var(--color-text-secondary)' }}>Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map(item => (
                                        <tr key={item.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                          <td className="px-4 py-2 font-medium">{item.productName}</td>
                                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                                          <td className="px-4 py-2 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                                            {formatCurrency(item.price)}
                                          </td>
                                          <td className="px-4 py-2 text-right font-semibold" style={{ color: 'var(--color-primary)' }}>
                                            {formatCurrency(item.price * item.quantity)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold">Tổng cộng:</td>
                                        <td className="px-4 py-3 text-right font-extrabold text-lg"
                                          style={{ color: 'var(--color-primary)' }}>
                                          {formatCurrency(order.totalPrice ?? 0)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                ) : (
                                  <p className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Không có chi tiết món ăn
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mt-4 px-2 flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Hiển thị <strong>{filtered.length}</strong> đơn hàng
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              Tổng: {formatCurrency(totalRevenue)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
