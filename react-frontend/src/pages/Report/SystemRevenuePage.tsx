import { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { reportService, type BranchRevenue, type ReportPeriod } from '../../services/reportService';

// ── Palette: phù hợp với primary orange + complementary ──────────────────────
const CHART_COLORS = [
  '#F97316', // primary orange
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week',  label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'year',  label: 'Năm nay' },
];

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toFixed(0);
}

// ── Custom Tooltip for Pie ───────────────────────────────────────────────────
const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: BranchRevenue = payload[0].payload;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      minWidth: 180,
    }}>
      <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{d.branchName}</p>
      <p style={{ color: '#F97316', fontWeight: 600 }}>{d.revenue.toLocaleString('vi-VN')} ₫</p>
      <p style={{ color: '#64748B', fontSize: 12 }}>{d.orders} đơn • {d.percentage.toFixed(1)}%</p>
    </div>
  );
};

// ── Custom Legend ─────────────────────────────────────────────────────────────
const renderCustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#64748B' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SystemRevenuePage() {
  const [period, setPeriod]   = useState<ReportPeriod>('year');
  const [data, setData]       = useState<BranchRevenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getSystemRevenueByBranch(period);
      setData(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const grandTotal  = data.reduce((s, b) => s + b.revenue, 0);
  const totalOrders = data.reduce((s, b) => s + b.orders, 0);
  const activeBranches = data.filter(b => b.revenue > 0).length;

  // Only show non-zero branches in pie
  const pieData = data.filter(b => b.revenue > 0);

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Tổng hợp Toàn Hệ thống</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            So sánh hiệu suất doanh thu giữa các chi nhánh
          </p>
        </div>
        <button className="btn-primary" onClick={fetchData} disabled={loading}>
          <span className="material-symbols-outlined text-base">refresh</span>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* ── Period selector ── */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-text-secondary)' }}>
            calendar_today
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Chọn khoảng thời gian:
          </span>
          <div className="flex gap-2 flex-wrap ml-2">
            {PERIOD_OPTIONS.map(opt => (
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

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: 'payments', label: 'Tổng doanh thu toàn chuỗi', value: grandTotal.toLocaleString('vi-VN') + ' ₫', color: '#F97316' },
          { icon: 'receipt_long', label: 'Tổng đơn hàng', value: totalOrders.toLocaleString('vi-VN'), color: '#3B82F6' },
          { icon: 'storefront', label: 'Chi nhánh có doanh thu', value: `${activeBranches} / ${data.length}`, color: '#10B981' },
        ].map(card => (
          <div key={card.label} className="card flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: card.color + '18' }}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: card.color }}>
                {card.icon}
              </span>
            </div>
            <div>
              {loading ? (
                <div className="h-7 w-28 rounded bg-gray-100 animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{card.value}</p>
              )}
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie chart */}
        <div className="card">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>donut_large</span>
            Tỷ trọng doanh thu từng chi nhánh
          </h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center flex-col gap-2">
              <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--color-border)' }}>donut_large</span>
              <p style={{ color: 'var(--color-text-secondary)' }}>Không có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={pieData}
                  dataKey="revenue"
                  nameKey="branchName"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={(props: any) => `${(props.percentage as number).toFixed(1)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top branches bar */}
        <div className="card">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>leaderboard</span>
            Xếp hạng doanh thu
          </h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-64 flex items-center justify-center flex-col gap-2">
              <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--color-border)' }}>leaderboard</span>
              <p style={{ color: 'var(--color-text-secondary)' }}>Không có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.slice(0, 6).map((branch, i) => {
                const maxRev = data[0]?.revenue || 1;
                const barWidth = maxRev > 0 ? (branch.revenue / maxRev) * 100 : 0;
                return (
                  <div key={branch.branchId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {branch.branchName}
                        </span>
                      </div>
                      <span className="text-sm font-semibold ml-2 shrink-0" style={{ color: 'var(--color-primary)' }}>
                        {fmt(branch.revenue)} ₫
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: 'var(--color-border)' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${barWidth}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail table ── */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>table_view</span>
          Bảng chi tiết từng chi nhánh
        </h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Chi nhánh</th>
                <th className="text-right">Doanh thu</th>
                <th className="text-right">Số đơn</th>
                <th className="text-right">Tỷ trọng</th>
                <th className="text-right">TB / đơn</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}>
                          <div className="h-4 rounded bg-gray-100 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.map((branch, i) => (
                    <tr key={branch.branchId}>
                      <td>
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length], display: 'inline-flex' }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="font-semibold">{branch.branchName}</td>
                      <td className="text-right font-bold" style={{ color: 'var(--color-primary)' }}>
                        {branch.revenue.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="text-right">{branch.orders}</td>
                      <td className="text-right">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          {branch.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                        {branch.orders > 0
                          ? (branch.revenue / branch.orders).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫'
                          : '—'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
