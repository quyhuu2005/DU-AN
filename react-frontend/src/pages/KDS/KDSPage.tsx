import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { kdsService } from '../../services/kdsService';
import type { KdsItem } from '../../services/kdsService';
import { branchMenuService } from '../../services/branchMenuService';
import type { BranchMenu } from '../../services/branchMenuService';

const STATUS_CONFIG = {
  PENDING:  { label: 'Chờ chế biến', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'hourglass_empty' },
  COOKING:  { label: 'Đang nấu',      color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'outdoor_grill'  },
  READY:    { label: 'Sẵn sàng',      color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'check_circle'    },
};

type ViewMode = 'KDS' | 'MENU';

export default function KDSPage() {
  const { user } = useAuth();
  const { error, success, Toasts } = useToast();

  const [items, setItems]       = useState<KdsItem[]>([]);
  const [menus, setMenus]       = useState<BranchMenu[]>([]);
  const [loading, setLoading]   = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('KDS');
  const [filter, setFilter]     = useState<'ALL' | 'PENDING' | 'COOKING'>('ALL');
  const [now, setNow]           = useState(Date.now());

  // Tick mỗi 30s để cập nhật đồng hồ chờ
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  const fetchItems = useCallback(async () => {
    if (!user?.branchId) return;
    setLoading(true);
    try {
      const res = await kdsService.getKdsItems(user.branchId);
      setItems(res.data ?? []);
    } catch (e: any) {
      error(e.message || 'Lỗi tải danh sách món');
    } finally {
      setLoading(false);
    }
  }, [user?.branchId]);

  const fetchMenus = useCallback(async () => {
    if (!user?.branchId) return;
    try {
      const res = await branchMenuService.getAll(user.branchId, 0, 1000);
      setMenus(res.content ?? []);
    } catch { /* silent */ }
  }, [user?.branchId]);

  useEffect(() => {
    fetchItems();
    fetchMenus();
    // Auto-refresh mỗi 15 giây
    const interval = setInterval(fetchItems, 15000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchMenus]);

  const handleUpdateStatus = async (itemId: number, newStatus: string) => {
    try {
      const res = await kdsService.updateItemStatus(itemId, newStatus);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
      const labels: Record<string, string> = { COOKING: 'Bắt đầu nấu', READY: 'Hoàn thành', SERVED: 'Đã phục vụ' };
      success(labels[newStatus] || 'Đã cập nhật');
      if (newStatus === 'READY' || newStatus === 'SERVED') {
        // Remove from list after short delay
        setTimeout(() => setItems(prev => prev.filter(i => i.id !== itemId)), 1500);
      }
    } catch (e: any) {
      error(e.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleToggleMenuAvailability = async (menu: BranchMenu) => {
    try {
      await branchMenuService.toggleStatus(menu.id, !menu.isAvailable);
      setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, isAvailable: !m.isAvailable } : m));
      success(`Đã ${!menu.isAvailable ? 'mở' : 'đóng'} món "${menu.productName}"`);
    } catch (e: any) {
      error(e.message || 'Lỗi cập nhật trạng thái món');
    }
  };

  const getElapsedMinutes = (createdAt: string) => {
    if (!createdAt) return 0;
    const diff = now - new Date(createdAt).getTime();
    return Math.floor(diff / 60000);
  };

  const filteredItems = filter === 'ALL' ? items : items.filter(i => i.status === filter);

  const pendingCount = items.filter(i => i.status === 'PENDING').length;
  const cookingCount = items.filter(i => i.status === 'COOKING').length;

  return (
    <div className="flex flex-col h-screen font-sans" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <Toasts />

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between p-4 border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-[24px]">outdoor_grill</span>
          </div>
          <div>
            <h1 className="font-extrabold text-xl m-0" style={{ color: 'var(--color-text-primary)' }}>Màn hình Bếp (KDS)</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Chi nhánh {user?.branchId} · Tự động làm mới 15s</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden sm:flex gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
              ⏳ {pendingCount} chờ
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-sm border border-amber-100">
              🍳 {cookingCount} đang nấu
            </span>
          </div>

          {/* View tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {(['KDS', 'MENU'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all ${
                  viewMode === mode 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode === 'KDS' ? '📋 Đơn món' : '📖 Hết món'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchItems}
            disabled={loading}
            className="btn-ghost flex items-center gap-2 px-3 py-2"
          >
            <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            <span className="hidden md:inline font-semibold">Làm mới</span>
          </button>
          
          {/* LOGOUT BUTTON */}
          <div className="h-8 w-[1px] bg-gray-300 mx-1"></div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user?.fullName}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{user?.role}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              window.location.href = '/login';
            }}
            className="btn-ghost !text-red-600 hover:!bg-red-50 !border-red-200 px-3 py-2"
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {/* ── KDS View ── */}
        {viewMode === 'KDS' && (
          <>
            {/* Filter tabs */}
            <div className="flex gap-3 mb-6">
              {(['ALL', 'PENDING', 'COOKING'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    filter === f 
                      ? 'bg-orange-500 text-white border-orange-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f === 'ALL' ? `Tất cả (${items.length})` : f === 'PENDING' ? `⏳ Chờ (${pendingCount})` : `🍳 Đang nấu (${cookingCount})`}
                </button>
              ))}
            </div>

            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <span className="material-symbols-outlined text-[48px] text-gray-400 animate-spin">progress_activity</span>
                <p className="text-gray-500 font-medium">Đang tải danh sách món...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <span className="material-symbols-outlined text-[64px] text-green-500">check_circle</span>
                <p className="text-gray-700 text-xl font-extrabold">Bếp đã sạch sẽ! Không có món nào đang chờ.</p>
                <p className="text-gray-500 font-medium">Hệ thống sẽ tự động làm mới khi có order mới từ POS.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map(item => {
                  const elapsed = getElapsedMinutes(item.orderCreatedAt);
                  const isUrgent = elapsed > 15;
                  const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white rounded-2xl p-5 overflow-hidden transition-all duration-300 border-2 
                        ${isUrgent ? 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse-border' : cfg.border + ' shadow-sm hover:shadow-md'}`}
                    >
                      {/* Status badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        {isUrgent && (
                          <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            SLA!
                          </span>
                        )}
                      </div>

                      {/* Product info */}
                      <h3 className="text-lg font-extrabold text-gray-800 mb-1 leading-tight">{item.productName}</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl font-black text-orange-500">×{item.quantity}</span>
                        <div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-0.5">
                            <span className="material-symbols-outlined text-[16px]">table_restaurant</span>
                            <span className="font-bold text-gray-700">{item.tableName}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 text-sm font-semibold ${elapsed > 10 ? 'text-orange-500' : 'text-gray-400'}`}>
                            <span className="material-symbols-outlined text-[16px]">timer</span>
                            <span>{elapsed} phút trước</span>
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      {item.note && (
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 mb-4 text-sm text-purple-700">
                          <span className="font-bold text-purple-800 flex items-center gap-1 mb-1">
                            <span className="material-symbols-outlined text-[14px]">sticky_note_2</span> Ghi chú:
                          </span>
                          <span className="block pl-5">{item.note}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-auto pt-2">
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'COOKING')}
                            className="flex-1 py-2.5 rounded-xl border-none cursor-pointer bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">outdoor_grill</span>
                            Bắt đầu nấu
                          </button>
                        )}
                        {item.status === 'COOKING' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'READY')}
                            className="flex-1 py-2.5 rounded-xl border-none cursor-pointer bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── MENU / Out-of-Stock View ── */}
        {viewMode === 'MENU' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="font-extrabold text-2xl text-gray-800 m-0">Quản lý tình trạng món ăn</h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">Bật/tắt tình trạng còn món để thông báo ngay lên màn hình POS của nhân viên phục vụ.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {menus.map(menu => (
                <div
                  key={menu.id}
                  className={`rounded-xl border p-4 flex items-center gap-4 transition-all
                    ${menu.isAvailable ? 'bg-white border-gray-200 hover:border-orange-300' : 'bg-red-50 border-red-200 opacity-80'}
                  `}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                    {menu.imageUrl
                      ? <img src={menu.imageUrl} alt={menu.productName} className="w-full h-full object-cover" />
                      : <span className="material-symbols-outlined text-[28px] text-gray-400">fastfood</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm m-0 text-gray-800 truncate" title={menu.productName}>{menu.productName}</p>
                    <p className="text-xs mt-1 text-gray-500 font-medium">{menu.categoryName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                      ${menu.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                    `}>
                      {menu.isAvailable ? 'Còn món' : 'Hết món'}
                    </span>
                    <button
                      onClick={() => handleToggleMenuAvailability(menu)}
                      title={menu.isAvailable ? 'Đánh dấu hết món' : 'Mở lại món'}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all border
                        ${menu.isAvailable 
                          ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' 
                          : 'bg-green-500 text-white border-green-600 shadow-sm hover:bg-green-600'}
                      `}
                    >
                      {menu.isAvailable ? '❌ Hết món' : '✅ Mở lại'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(248, 113, 113, 0.5); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
        .animate-pulse-border {
          animation: pulseBorder 2s infinite;
        }
      `}</style>
    </div>
  );
}
