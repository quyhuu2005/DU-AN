import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { reportService, type RevenueReport, type ReportPeriod } from '../../services/reportService';

// ── helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' triệu';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toFixed(0);
}

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week',  label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'year',  label: 'Năm nay' },
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const revenue: number = payload[0]?.value ?? 0;
  const orders: number  = payload[0]?.payload?.orders ?? 0;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      minWidth: 140,
    }}>
      <p style={{ color: '#64748B', fontSize: 12, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#F97316', fontWeight: 700, fontSize: 15 }}>
        {revenue.toLocaleString('vi-VN')} ₫
      </p>
      <p style={{ color: '#64748B', fontSize: 12 }}>
        {orders} đơn hàng
      </p>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BranchRevenuePage() {
  const { user } = useAuth();
  const branchId = user?.branchId;

  const [period, setPeriod]   = useState<ReportPeriod>('month');
  const [report, setReport]   = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchReport = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getBranchRevenue(branchId, period);
      setReport(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, [branchId, period]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const totalRevenue = report?.totalRevenue ?? 0;
  const totalOrders  = report?.totalOrders ?? 0;
  const avgPerOrder  = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Báo cáo Doanh thu Chi nhánh</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Chi nhánh #{branchId} — Chỉ hiển thị đơn hàng đã thanh toán
          </p>
        </div>
        <button className="btn-primary" onClick={fetchReport} disabled={loading}>
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all`}
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

      {/* ── Summary KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: 'payments',
            label: 'Tổng doanh thu',
            value: totalRevenue.toLocaleString('vi-VN') + ' ₫',
            color: '#F97316',
          },
          {
            icon: 'receipt_long',
            label: 'Số đơn hàng',
            value: totalOrders.toLocaleString('vi-VN'),
            color: '#3B82F6',
          },
          {
            icon: 'bar_chart',
            label: 'Trung bình / đơn',
            value: avgPerOrder.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫',
            color: '#10B981',
          },
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
            <div className="min-w-0">
              {loading ? (
                <div className="h-7 w-32 rounded bg-gray-100 animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {card.value}
                </p>
              )}
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bar chart ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>bar_chart</span>
            Doanh thu theo {PERIOD_OPTIONS.find(p => p.value === period)?.label.toLowerCase()}
          </h2>
        </div>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : !report || report.chartData.length === 0 ? (
          <div className="w-full h-64 flex items-center justify-center flex-col gap-2">
            <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--color-border)' }}>bar_chart</span>
            <p style={{ color: 'var(--color-text-secondary)' }}>Không có dữ liệu trong khoảng thời gian này</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={report.chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }} barSize={period === 'year' ? 28 : period === 'month' ? 10 : 24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                interval={period === 'month' ? 2 : 0}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.05)' }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {report.chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      report.chartData[i].revenue ===
                      Math.max(...report.chartData.map(d => d.revenue))
                        ? '#F97316'
                        : '#FDBA74'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Data table ── */}
      {report && report.chartData.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>table_view</span>
            Chi tiết theo từng {period === 'year' ? 'tháng' : period === 'today' ? 'giờ' : 'ngày'}
          </h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th className="text-right">Doanh thu</th>
                  <th className="text-right">Số đơn</th>
                  <th className="text-right">Trung bình / đơn</th>
                </tr>
              </thead>
              <tbody>
                {report.chartData
                  .filter(d => d.revenue > 0 || d.orders > 0)
                  .map((d, i) => (
                  <tr key={i}>
                    <td className="font-medium">{d.label}</td>
                    <td className="text-right font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {d.revenue.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="text-right">{d.orders}</td>
                    <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                      {d.orders > 0
                        ? (d.revenue / d.orders).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫'
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
