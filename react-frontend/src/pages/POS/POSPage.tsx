import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { tableService } from '../../services/tableService';
import type { DiningTable } from '../../services/tableService';
import { branchMenuService } from '../../services/branchMenuService';
import type { BranchMenu } from '../../services/branchMenuService';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types';
import { orderService } from '../../services/orderService';
import type { Order } from '../../services/orderService';
import { reservationService } from '../../services/reservationService';
import { formatCurrency } from '../../utils';

/* ─── Custom hooks ─── */
function useElapsed(createdAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!createdAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  if (!createdAt) return '';
  const diff = Math.floor((now - new Date(createdAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return h > 0
    ? `${h}g ${String(m).padStart(2,'0')}p`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function useNow(interval = 60000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

/* ─── Table Card ─── */
function TableCard({
  table, isSelected, order, upcomingReservation, onClick,
}: {
  table: DiningTable;
  isSelected: boolean;
  order: Order | null;
  upcomingReservation?: { reservedAt: string; partySize: number } | null;
  onClick: () => void;
}) {
  const elapsed = useElapsed(order?.createdAt ?? null);
  const nowTime = useNow(60000);
  const isOccupied = table.status === 'OCCUPIED';
  const isReserved = table.status === 'RESERVED';

  // Check if the upcoming reservation is soon (within 2 hours)
  const reservationSoonLabel = (() => {
    if (!upcomingReservation || isOccupied || isReserved) return null;
    const d = new Date(upcomingReservation.reservedAt);
    const diffMs = d.getTime() - nowTime;
    if (diffMs < 0 || diffMs > 8 * 60 * 60 * 1000) return null; // only show if within 8 hours & not past
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m} · ${upcomingReservation.partySize}K`;
  })();

  const bgClass = isSelected
    ? 'bg-orange-500 text-white shadow-xl shadow-orange-300/40 scale-[1.04]'
    : isOccupied
    ? 'bg-red-50 border border-red-200 hover:shadow-md hover:border-red-400'
    : isReserved
    ? 'bg-yellow-50 border border-yellow-200 hover:shadow-md'
    : reservationSoonLabel
    ? 'bg-blue-50 border border-blue-200 hover:shadow-md hover:border-blue-400'
    : 'bg-white border border-gray-200 hover:shadow-md hover:border-orange-300';

  const iconColor = isSelected
    ? 'text-white/80'
    : isOccupied
    ? 'text-red-400'
    : isReserved
    ? 'text-yellow-500'
    : reservationSoonLabel
    ? 'text-blue-400'
    : 'text-gray-300';

  const icon = isOccupied ? 'room_service' : isReserved ? 'event_seat' : reservationSoonLabel ? 'event_upcoming' : 'table_restaurant';

  /* warn if > 90 min */
  const isLate = (() => {
    if (!order?.createdAt) return false;
    return (nowTime - new Date(order.createdAt).getTime()) > 90 * 60 * 1000;
  })();

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center min-h-[130px]
        transition-all duration-200 select-none ${bgClass}`}
    >
      {/* Late warning pulse */}
      {isLate && !isSelected && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"/>
        </span>
      )}

      {/* Upcoming reservation dot (not selected, not occupied, not RESERVED) */}
      {reservationSoonLabel && !isSelected && !isOccupied && !isReserved && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"/>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"/>
        </span>
      )}

      <span className={`material-symbols-outlined text-4xl mb-1.5 ${iconColor}`}>{icon}</span>
      <span className={`font-bold text-base ${isSelected ? 'text-white' : 'text-gray-800'}`}>{table.name}</span>
      <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
        {table.capacity} chỗ
      </span>

      {isOccupied && elapsed && (
        <span className={`mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full
          ${isSelected ? 'bg-white/20 text-white' : isLate ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'}`}>
          ⏱ {elapsed}
        </span>
      )}

      {isOccupied && order && (
        <span className={`mt-1 text-[11px] font-semibold ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
          {formatCurrency(order.totalPrice)}
        </span>
      )}

      {isReserved && !isOccupied && (
        <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
          ĐẶT TRƯỚC
        </span>
      )}

      {/* Show upcoming reservation time badge on EMPTY tables */}
      {reservationSoonLabel && !isOccupied && !isReserved && (
        <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
        }`}>
          📅 {reservationSoonLabel}
        </span>
      )}
    </div>
  );
}

/* ─── Status chip ─── */
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: string; cls: string }> = {
    PENDING:  { label: 'Chờ bếp', icon: 'hourglass_empty', cls: 'text-gray-600 bg-gray-100 border-gray-200' },
    COOKING:  { label: 'Đang nấu', icon: 'skillet', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    READY:    { label: 'Xong', icon: 'check_circle', cls: 'text-green-700 bg-green-50 border-green-200' },
    SERVED:   { label: 'Đã phục vụ', icon: 'thumb_up', cls: 'text-purple-700 bg-purple-50 border-purple-200' },
  };
  const cfg = map[status] ?? { label: status, icon: 'info', cls: 'text-gray-500 bg-gray-50 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md font-bold border ${cfg.cls}`}>
      <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

/* ════════════════════════════════════════════════ MAIN PAGE ══ */
export default function POSPage() {
  const { user } = useAuth();
  const { error, success, Toasts } = useToast();

  /* data */
  const [tables, setTables]     = useState<DiningTable[]>([]);
  const [categories, setCats]   = useState<Category[]>([]);
  const [menus, setMenus]       = useState<BranchMenu[]>([]);
  /* active orders map for all tables (tableId → Order) */
  const [tableOrders, setTableOrders] = useState<Record<number, Order>>({});
  /* today's reservations map (tableId → nearest upcoming reservation) */
  const [todayResvMap, setTodayResvMap] = useState<Record<number, { id: number; reservedAt: string; partySize: number; customerName: string; customerPhone: string; note?: string }>>({});

  /* UI */
  const [activeTab,      setActiveTab]      = useState<'TABLES' | 'MENU'>('TABLES');
  const [catFilter,      setCatFilter]      = useState('');
  const [menuSearch,     setMenuSearch]     = useState('');
  const [zoneFilter,     setZoneFilter]     = useState('');

  /* selection */
  const [selectedTable,  setSelectedTable]  = useState<DiningTable | null>(null);
  const [currentOrder,   setCurrentOrder]   = useState<Order | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [paying,         setPaying]         = useState(false);

  /* modals */
  const [showOpenTable,    setShowOpenTable]    = useState(false);
  const [showQtyModal,     setShowQtyModal]     = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  /* reservation info for RESERVED table */
  const [tableReservation, setTableReservation] = useState<{
    id: number;
    customerName: string;
    customerPhone: string;
    partySize: number;
    reservedAt: string;
    note?: string;
  } | null>(null);

  /* qty modal state */
  const [selectedMenu, setSelectedMenu] = useState<BranchMenu | null>(null);
  const [qtyValue,     setQtyValue]     = useState(1);
  const [itemNote,     setItemNote]     = useState('');

  /* payment */
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR'>('CASH');
  const [cashReceived,  setCashReceived]  = useState(0);

  /* elapsed for selected table order */
  const billElapsed = useElapsed(currentOrder?.createdAt ?? null);

  /* ── fetch helpers ── */
  const fetchTables = useCallback(async () => {
    if (!user?.branchId) return;
    try {
      const res = await tableService.getAll(user.branchId);
      setTables(res.data);
    } catch { /* silent */ }
  }, [user]);

  /* fetch all active orders for the branch to show on table cards */
  const fetchAllActiveOrders = useCallback(async () => {
    if (!user?.branchId) return;
    try {
      const res = await orderService.getActiveOrdersByBranch(user.branchId);
      const map: Record<number, Order> = {};
      (res.data ?? []).forEach((o: Order) => { map[o.tableId] = o; });
      setTableOrders(map);
    } catch { /* silent */ }
  }, [user]);

  /* fetch today's reservations to show upcoming badges on table cards */
  const fetchTodayReservations = useCallback(async () => {
    if (!user?.branchId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await reservationService.getByDate(user.branchId, today);
      const resv: any[] = res.data || [];
      const now = Date.now();
      // Build map: tableId → nearest upcoming CONFIRMED/PENDING reservation
      const map: Record<number, { id: number; reservedAt: string; partySize: number; customerName: string; customerPhone: string; note?: string }> = {};
      resv
        .filter((r: any) => r.tableId && ['PENDING', 'CONFIRMED'].includes(r.status))
        .filter((r: any) => new Date(r.reservedAt).getTime() > now - 30 * 60 * 1000) // not more than 30 min past
        .sort((a: any, b: any) => new Date(a.reservedAt).getTime() - new Date(b.reservedAt).getTime())
        .forEach((r: any) => {
          if (!map[r.tableId]) { // only keep nearest
            map[r.tableId] = { id: r.id, reservedAt: r.reservedAt, partySize: r.partySize, customerName: r.customerName, customerPhone: r.customerPhone, note: r.note };
          }
        });
      setTodayResvMap(map);
    } catch { /* silent */ }
  }, [user]);

  /* ── Reset state when user changes (e.g. staff switches account) ── */
  useEffect(() => {
    // When the logged-in user changes, clear any active selection
    // so a new user doesn't see the previous user's session
    setSelectedTable(null);
    setCurrentOrder(null);
    setActiveTab('TABLES');
    setTableOrders({});
  }, [user?.id]);

  useEffect(() => {
    if (!user?.branchId) return;
    fetchTables();
    fetchAllActiveOrders();
    fetchTodayReservations();
    categoryService.getAll().then(r => setCats(r.data)).catch(() => {});
    branchMenuService.getAll(user.branchId, 0, 1000).then(r => setMenus(r.content)).catch(() => {});
  }, [user?.branchId]);

  /* auto-refresh tables AND orders AND reservations every 15s */
  useEffect(() => {
    const id = setInterval(() => {
      fetchTables();
      fetchAllActiveOrders();
      fetchTodayReservations();
    }, 15_000);
    return () => clearInterval(id);
  }, [fetchTables, fetchAllActiveOrders, fetchTodayReservations]);

  /*
   * ── KEY FIX: Sync currentOrder → tableOrders ngay lập tức ──
   * Mỗi khi nhân viên thêm/xóa/sửa món, currentOrder được cập nhật.
   * Đồng thời cập nhật luôn tableOrders để card bàn hiển thị đúng giá
   * ngay khi quay về tab Sơ đồ bàn mà không cần chờ interval.
   */
  useEffect(() => {
    if (!currentOrder) return;
    setTableOrders(prev => ({
      ...prev,
      [currentOrder.tableId]: currentOrder,
    }));
  }, [currentOrder]);

  /* ── derived ── */
  const zones = useMemo(() => {
    const set = new Set(tables.map(t => t.zone ?? 'Khu chung'));
    return ['', ...Array.from(set)];
  }, [tables]);

  const filteredTables = useMemo(() =>
    zoneFilter ? tables.filter(t => (t.zone ?? 'Khu chung') === zoneFilter) : tables,
    [tables, zoneFilter]);

  const tablesByZone = useMemo(() => {
    const map: Record<string, DiningTable[]> = {};
    filteredTables.forEach(t => {
      const z = t.zone || 'Khu chung';
      if (!map[z]) map[z] = [];
      map[z].push(t);
    });
    return map;
  }, [filteredTables]);

  const filteredMenus = useMemo(() => {
    let list = catFilter
      ? menus.filter(m => m.categoryName === categories.find(c => c.id.toString() === catFilter)?.name)
      : menus;
    if (menuSearch.trim())
      list = list.filter(m => m.productName.toLowerCase().includes(menuSearch.toLowerCase()));
    return list;
  }, [menus, catFilter, menuSearch, categories]);

  /* stats */
  const occupiedCount  = tables.filter(t => t.status === 'OCCUPIED').length;
  const emptyCount     = tables.filter(t => t.status === 'EMPTY').length;
  const totalRevToday  = Object.values(tableOrders).reduce((s, o) => s + (o.totalPrice ?? 0), 0);

  /* ── handlers ── */
  const handleSelectTable = async (table: DiningTable) => {
    setSelectedTable(table);
    setLoading(true);
    try {
      const res = await orderService.getActiveOrderByTable(table.id);
      if (res.data) {
        setCurrentOrder(res.data);
        // Sync vào tableOrders ngay (tránh stale data trên card)
        setTableOrders(prev => ({ ...prev, [table.id]: res.data! }));
        setActiveTab('MENU');
      } else {
        setCurrentOrder(null);
        if (table.status === 'EMPTY') {
          // Check if this EMPTY table has an upcoming reservation today (warn staff)
          const upcoming = todayResvMap[table.id] ?? null;
          setTableReservation(upcoming ? {
            id: upcoming.id,
            customerName: upcoming.customerName,
            customerPhone: upcoming.customerPhone,
            partySize: upcoming.partySize,
            reservedAt: upcoming.reservedAt,
            note: upcoming.note,
          } : null);
          setShowOpenTable(true);
        } else if (table.status === 'RESERVED') {
          // Fetch reservation info to show in the confirmation modal
          try {
            const today = new Date().toISOString().split('T')[0];
            const rRes = await reservationService.getByDate(table.branchId, today);
            const reservations: any[] = rRes.data || [];
            const matchingRes = reservations.find(
              (r: any) => r.tableId === table.id && ['PENDING', 'CONFIRMED'].includes(r.status)
            );
            setTableReservation(matchingRes ? {
              id: matchingRes.id,
              customerName: matchingRes.customerName,
              customerPhone: matchingRes.customerPhone,
              partySize: matchingRes.partySize,
              reservedAt: matchingRes.reservedAt,
              note: matchingRes.note,
            } : null);
          } catch {
            setTableReservation(null);
          }
          setShowOpenTable(true);
        }
      }
    } catch (e: any) {
      error(e.message || 'Lỗi khi chọn bàn');
    } finally {
      setLoading(false);
    }
  };

  const confirmOpenTable = async () => {
    if (!selectedTable || !user?.branchId || !user?.id) return;
    try {
      // If table is RESERVED, pass the reservationId to link them.
      // If table is EMPTY but has upcoming, do NOT pass reservationId (it's a walk-in order)
      const resvId = selectedTable.status === 'RESERVED' && tableReservation ? tableReservation.id : undefined;
      const res = await orderService.createOrder(user.branchId, selectedTable.id, user.id, resvId);
      setCurrentOrder(res.data);
      setShowOpenTable(false);
      setActiveTab('MENU');
      fetchTables();
      fetchAllActiveOrders();
    } catch (e: any) {
      error(e.message || 'Lỗi mở bàn');
    }
  };

  /* Quick-add 1 qty immediately */
  const handleQuickAdd = async (menu: BranchMenu) => {
    if (!currentOrder) { error('Vui lòng chọn bàn trước'); return; }
    if (!menu.isAvailable) { error('Món này đã hết'); return; }
    try {
      const res = await orderService.addItem(currentOrder.id, menu.productId, 1, undefined);
      setCurrentOrder(res.data);
      success(`+1 ${menu.productName}`);
    } catch (e: any) { error(e.message || 'Lỗi thêm món'); }
  };

  const openAddItemModal = (menu: BranchMenu) => {
    if (!currentOrder) { error('Vui lòng chọn bàn để gọi món'); return; }
    if (!menu.isAvailable) { error('Món này đã hết'); return; }
    setSelectedMenu(menu);
    setQtyValue(1);
    setItemNote('');
    setShowQtyModal(true);
  };

  const handleAddItem = async () => {
    if (!currentOrder || !selectedMenu) return;
    try {
      const res = await orderService.addItem(currentOrder.id, selectedMenu.productId, qtyValue, itemNote.trim() || undefined);
      setCurrentOrder(res.data);
      setShowQtyModal(false);
      success(`Đã thêm ${qtyValue}x ${selectedMenu.productName}`);
    } catch (e: any) { error(e.message || 'Lỗi thêm món'); }
  };

  const handleUpdateQty = async (itemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    try {
      if (newQty <= 0) {
        if (window.confirm('Xác nhận xóa món này khỏi hóa đơn?')) {
          const res = await orderService.removeItem(itemId);
          setCurrentOrder(res.data);
        }
      } else {
        const res = await orderService.updateItemQuantity(itemId, newQty);
        setCurrentOrder(res.data);
      }
    } catch (e: any) { error(e.message || 'Lỗi cập nhật'); }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    setPaying(true);
    try {
      await orderService.cancelOrder(currentOrder.id);
      success('Đã hủy phục vụ bàn này');
      setCurrentOrder(null);
      setSelectedTable(null);
      setActiveTab('TABLES');
      fetchTables();
      fetchAllActiveOrders();
    } catch (e: any) {
      error(e.response?.data?.message || e.message || 'Lỗi hủy bàn');
    } finally {
      setPaying(false);
    }
  };

  const handleCheckout = async () => {
    if (!currentOrder) return;
    setPaying(true);
    try {
      await orderService.checkout(currentOrder.id);
      success('✅ Thanh toán thành công & Giải phóng bàn!');
      setCurrentOrder(null);
      setSelectedTable(null);
      setShowPaymentModal(false);
      setActiveTab('TABLES');
      fetchTables();
      fetchAllActiveOrders();
    } catch (e: any) { error(e.message || 'Lỗi thanh toán'); }
    finally { setPaying(false); }
  };

  const openPaymentModal = () => {
    setPaymentMethod('CASH');
    setCashReceived(0);
    setShowPaymentModal(true);
  };

  /* ════════════ RENDER ════════════ */
  return (
    <div className="flex h-screen font-sans" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <Toasts />

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r" style={{ borderColor: 'var(--color-border)' }}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(['TABLES', 'MENU'] as const).map(tab => (
              <button key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'TABLES') {
                    setSelectedTable(null);
                    setCurrentOrder(null);
                    // Refresh ngay để card bàn hiển thị trạng thái & giá mới nhất
                    fetchTables();
                    fetchAllActiveOrders();
                  }
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5
                  ${activeTab === tab ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {tab === 'TABLES' ? 'grid_view' : 'restaurant_menu'}
                </span>
                {tab === 'TABLES' ? 'Sơ đồ bàn' : 'Thực đơn'}
              </button>
            ))}
          </div>

          {/* Quick stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"/>
              <span className="font-semibold text-gray-700">{occupiedCount}</span>
              <span className="text-gray-400">đang phục vụ</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"/>
              <span className="font-semibold text-gray-700">{emptyCount}</span>
              <span className="text-gray-400">bàn trống</span>
            </div>
            <div className="h-4 w-px bg-gray-200"/>
            <div className="text-sm font-bold text-orange-500">{formatCurrency(totalRevToday)}</div>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user?.fullName}</p>
              <p className="text-xs text-gray-400">Chi nhánh {user?.branchId}</p>
            </div>
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
              className="btn-ghost !text-red-500 !border-red-200 hover:!bg-red-50 !px-3"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ══ TABLE VIEW ══ */}
          {activeTab === 'TABLES' && (
            <div className="animate-fade-in">
              {/* Zone filter pills */}
              {zones.length > 2 && (
                <div className="flex gap-2 flex-wrap mb-5">
                  {zones.map(z => (
                    <button key={z}
                      onClick={() => setZoneFilter(z)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${zoneFilter === z
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'}`}>
                      {z === '' ? 'Tất cả khu' : z}
                    </button>
                  ))}
                </div>
              )}

              {/* Tables grouped by zone */}
              {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                <div key={zone} className="mb-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500">{zone}</h2>
                    <div className="flex-1 h-px bg-gray-100"/>
                    <span className="text-xs text-gray-400">{zoneTables.filter(t => t.status === 'OCCUPIED').length}/{zoneTables.length} đang dùng</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {zoneTables.map(t => (
                      <TableCard
                        key={t.id}
                        table={t}
                        isSelected={selectedTable?.id === t.id}
                        order={tableOrders[t.id] ?? null}
                        upcomingReservation={todayResvMap[t.id] ?? null}
                        onClick={() => handleSelectTable(t)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ MENU VIEW ══ */}
          {activeTab === 'MENU' && (
            <div className="animate-fade-in flex flex-col gap-4">
              {/* Search + Category filter row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                  <input
                    type="text"
                    className="input pl-10 w-full"
                    placeholder="Tìm nhanh tên món..."
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                  />
                  {menuSearch && (
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      onClick={() => setMenuSearch('')}>
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
                {/* Category pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <button
                    onClick={() => setCatFilter('')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                      ${catFilter === '' ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
                    Tất cả
                  </button>
                  {categories.map(c => (
                    <button key={c.id}
                      onClick={() => setCatFilter(c.id.toString())}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                        ${catFilter === c.id.toString() ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result count */}
              <p className="text-xs text-gray-400 font-medium -mb-2">
                {filteredMenus.length} món {menuSearch && `phù hợp với "${menuSearch}"`}
              </p>

              {/* Menu grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {filteredMenus.map(m => (
                  <div key={m.id}
                    className={`relative rounded-2xl border overflow-hidden flex flex-col group transition-all duration-200
                      ${m.isAvailable
                        ? 'bg-white border-gray-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed grayscale bg-gray-50 border-gray-100'}`}
                  >
                    {/* Image */}
                    <div className="w-full h-32 bg-gray-100 overflow-hidden relative">
                      {m.imageUrl ? (
                        <img src={m.imageUrl} alt={m.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-5xl">fastfood</span>
                        </div>
                      )}
                      {!m.isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40">
                          <span className="text-white text-xs font-bold px-3 py-1 bg-gray-800/70 rounded-full">HẾT MÓN</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <span className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">{m.productName}</span>
                      <span className="text-orange-500 font-extrabold text-base mt-auto">{formatCurrency(m.localPrice)}</span>
                    </div>

                    {/* Action buttons (visible on hover) */}
                    {m.isAvailable && (
                      <div className="flex border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Quick +1 */}
                        <button
                          onClick={() => handleQuickAdd(m)}
                          className="flex-1 py-2 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                          title="Thêm nhanh 1 món"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          +1
                        </button>
                        <div className="w-px bg-gray-100"/>
                        {/* Open modal */}
                        <button
                          onClick={() => openAddItemModal(m)}
                          className="flex-1 py-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                          title="Chọn số lượng & ghi chú"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                          Tuỳ chọn
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredMenus.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                    <span className="material-symbols-outlined text-6xl mb-2">search_off</span>
                    <p className="font-medium">Không tìm thấy món nào</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ RIGHT SIDEBAR (BILL) ══════════ */}
      <div className="w-[380px] flex flex-col h-full bg-white shadow-xl z-10 border-l" style={{ borderColor: 'var(--color-border)' }}>

        {/* Bill header */}
        <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          {selectedTable ? (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-2xl ${currentOrder ? 'text-orange-500' : 'text-gray-400'}`}>
                    {currentOrder ? 'room_service' : 'table_restaurant'}
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-800">{selectedTable.name}</h2>
                  {currentOrder && (
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      ĐANG PHỤC VỤ
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 ml-8">
                  {selectedTable.zone} · {selectedTable.capacity} chỗ
                  {billElapsed && ` · ⏱ ${billElapsed}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setCurrentOrder(null);
                  setActiveTab('TABLES');
                  // Refresh ngay để trạng thái bàn & giá hiển thị đúng
                  fetchTables();
                  fetchAllActiveOrders();
                }}
                className="text-gray-400 hover:text-gray-700 p-1"
                title="Đóng hóa đơn"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
              <div>
                <p className="font-bold text-gray-700">Hóa đơn</p>
                <p className="text-xs">Chọn một bàn để bắt đầu</p>
              </div>
            </div>
          )}
        </div>

        {/* Bill items */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#F8FAFC' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-4xl mb-2">progress_activity</span>
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : currentOrder?.items && currentOrder.items.length > 0 ? (
            <div className="p-3 space-y-2">
              {/* Items list */}
              {currentOrder.items.map((item, idx) => (
                <div key={item.id}
                  className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 leading-tight truncate">{item.productName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <StatusChip status={item.status}/>
                        {item.note && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md font-semibold border text-purple-700 bg-purple-50 border-purple-200">
                            <span className="material-symbols-outlined text-[11px]">sticky_note_2</span>
                            {item.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-extrabold text-orange-500 text-sm shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{formatCurrency(item.price)}/sp</span>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        className="w-8 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleUpdateQty(item.id, item.quantity, -1)}>
                        <span className="material-symbols-outlined text-[16px]">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                      </button>
                      <span className="w-7 text-center text-sm font-extrabold text-gray-800">{item.quantity}</span>
                      <button
                        className="w-8 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                        onClick={() => handleUpdateQty(item.id, item.quantity, 1)}>
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary section */}
              <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Số món</span>
                  <span className="text-xs font-bold text-gray-800">
                    {currentOrder.items.reduce((s, i) => s + i.quantity, 0)} món
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Thời gian</span>
                  <span className="text-xs font-bold text-gray-800">{billElapsed || '—'}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm font-bold text-gray-700">Tổng tiền</span>
                  <span className="text-2xl font-extrabold text-orange-500">
                    {formatCurrency(currentOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20 space-y-2">
              <span className="material-symbols-outlined text-6xl opacity-30">point_of_sale</span>
              <p className="text-sm font-medium">
                {currentOrder ? 'Chưa có món nào được gọi' : 'Chọn bàn để xem hóa đơn'}
              </p>
              {currentOrder && (
                <p className="text-xs opacity-60">Nhấn vào thực đơn để gọi món</p>
              )}
            </div>
          )}
        </div>

        {/* Bill footer */}
        <div className="p-4 border-t bg-white shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          {currentOrder && currentOrder.items.length === 0 && (
            <button
              onClick={handleCancelOrder}
              disabled={paying}
              className="w-full mb-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold
                hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Hủy phục vụ
            </button>
          )}
          <button
            disabled={!currentOrder || currentOrder.items.length === 0 || paying}
            onClick={openPaymentModal}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400
              disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all
              flex justify-center items-center gap-2 text-base active:scale-[0.98]"
          >
            {paying
              ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> XỬ LÝ...</>
              : <><span className="material-symbols-outlined">point_of_sale</span> THANH TOÁN</>}
          </button>
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}

      {/* 1. Mở bàn */}
      {showOpenTable && selectedTable && (
        <div className="modal-backdrop" onClick={() => { setShowOpenTable(false); setSelectedTable(null); setTableReservation(null); }}>
          <div className="modal-box text-center max-w-sm" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              tableReservation ? 'bg-yellow-100' : 'bg-orange-100'
            }`}>
              <span className={`material-symbols-outlined text-4xl ${
                tableReservation ? 'text-yellow-600' : 'text-orange-500'
              }`}>
                {tableReservation ? 'event_seat' : 'door_open'}
              </span>
            </div>

            {tableReservation ? (
              selectedTable?.status === 'RESERVED' ? (
                // RESERVED table: customer has arrived, confirm seating
                <>
                  <h3 className="modal-title !mb-2">Xác nhận khách đặt trước đã đến</h3>
                  <p className="text-gray-500 text-sm mb-3">Bàn <span className="font-bold text-orange-500">{selectedTable.name}</span> đang được giữ cho:</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-[18px]">person</span>
                      <span className="font-bold text-gray-800">{tableReservation.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-[18px]">phone_iphone</span>
                      <span className="text-gray-700">{tableReservation.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-[18px]">group</span>
                      <span className="text-gray-700">{tableReservation.partySize} khách</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-600 text-[18px]">schedule</span>
                      <span className="text-gray-700">
                        {(() => {
                          const d = new Date(tableReservation.reservedAt);
                          return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                        })()}
                      </span>
                    </div>
                    {tableReservation.note && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-yellow-600 text-[18px]">sticky_note_2</span>
                        <span className="text-gray-600 text-sm italic">{tableReservation.note}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-5">Nhấn “Bắt đầu phục vụ” để chuyển trạng thái đặt bàn thành <span className="font-semibold text-green-600">Đã nhận bàn</span> và mở bàn.</p>
                </>
              ) : (
                // EMPTY table with an upcoming reservation: show warning
                <>
                  <h3 className="modal-title !mb-2">Mở bàn phục vụ</h3>
                  <p className="text-gray-500 text-sm mb-1">Bắt đầu nhận đặt món tại</p>
                  <p className="text-xl font-extrabold text-orange-500 mb-1">{selectedTable.name}</p>
                  <p className="text-xs text-gray-400 mb-4">{selectedTable.zone} · {selectedTable.capacity} chỗ ngồi</p>
                  {/* Warning: upcoming reservation today */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0">warning</span>
                      <div>
                        <p className="text-amber-800 font-bold text-sm">Bàn này đã có đặt trước hôm nay!</p>
                        <p className="text-amber-700 text-xs mt-0.5">
                          Khách <strong>{tableReservation.customerName}</strong> — {tableReservation.partySize} người, đến lúc{' '}
                          <strong>
                            {(() => {
                              const d = new Date(tableReservation.reservedAt);
                              return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                            })()}
                          </strong>
                        </p>
                        <p className="text-amber-600 text-xs mt-1">Vui lòng đảm bảo giải phóng bàn kịp giờ!</p>
                      </div>
                    </div>
                  </div>
                </>
              )
            ) : (
              // Normal EMPTY table, no upcoming reservation today
              <>
                <h3 className="modal-title !mb-2">Mở bàn phục vụ</h3>
                <p className="text-gray-500 text-sm mb-1">Bắt đầu nhận đặt món tại</p>
                <p className="text-xl font-extrabold text-orange-500 mb-1">{selectedTable.name}</p>
                <p className="text-xs text-gray-400 mb-6">{selectedTable.zone} · {selectedTable.capacity} chỗ ngồi</p>
              </>
            )}

            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => { setShowOpenTable(false); setSelectedTable(null); setTableReservation(null); }}>Huỷ</button>
              <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all ${
                tableReservation ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-orange-500 hover:bg-orange-600'
              }`} onClick={confirmOpenTable}>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Bắt đầu phục vụ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Chọn số lượng & ghi chú */}
      {showQtyModal && selectedMenu && (
        <div className="modal-backdrop" onClick={() => setShowQtyModal(false)}>
          <div className="modal-box max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">add_shopping_cart</span>
              Thêm vào hóa đơn
            </h3>

            {/* Product preview */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-xl mb-5 border border-gray-100">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                {selectedMenu.imageUrl
                  ? <img src={selectedMenu.imageUrl} alt={selectedMenu.productName} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400">fastfood</span>
                    </div>}
              </div>
              <div>
                <p className="font-bold text-gray-800">{selectedMenu.productName}</p>
                <p className="text-orange-500 font-extrabold text-lg">{formatCurrency(selectedMenu.localPrice)}</p>
                <p className="text-xs text-gray-400">{selectedMenu.categoryName}</p>
              </div>
            </div>

            {/* Qty stepper */}
            <div className="flex items-center justify-center gap-5 mb-5">
              <button
                onClick={() => setQtyValue(Math.max(1, qtyValue - 1))}
                className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center
                  hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition-all text-gray-600">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="text-4xl font-extrabold text-gray-800 w-14 text-center">{qtyValue}</span>
              <button
                onClick={() => setQtyValue(qtyValue + 1)}
                className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center
                  hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all text-gray-600">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* Subtotal preview */}
            <div className="flex justify-between items-center px-4 py-2 bg-orange-50 rounded-lg mb-5">
              <span className="text-sm text-orange-700 font-medium">Tạm tính:</span>
              <span className="font-extrabold text-orange-500">{formatCurrency(selectedMenu.localPrice * qtyValue)}</span>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="label text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                Ghi chú chế biến:
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Ví dụ: không cay, ít đường, thêm đá..."
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setShowQtyModal(false)}>Huỷ</button>
              <button className="btn-primary flex-1" onClick={handleAddItem}>
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                Thêm vào hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Thanh toán */}
      {showPaymentModal && currentOrder && (
        <div className="modal-backdrop" onClick={() => !paying && setShowPaymentModal(false)}>
          <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">payments</span>
              Thanh toán hóa đơn
            </h3>

            {/* Method tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
              {(['CASH', 'QR'] as const).map(m => (
                <button key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                    ${paymentMethod === m ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <span className="material-symbols-outlined text-[18px]">{m === 'CASH' ? 'payments' : 'qr_code_scanner'}</span>
                  {m === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản QR'}
                </button>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-5">
              <div>
                <p className="text-xs text-orange-700/60 font-medium uppercase tracking-wider">{selectedTable?.name}</p>
                <p className="text-orange-800 font-bold">Tổng cần thu</p>
              </div>
              <span className="font-extrabold text-3xl text-orange-500">{formatCurrency(currentOrder.totalPrice)}</span>
            </div>

            {/* Cash method */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="label text-xs text-gray-500">Tiền khách đưa:</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">VNĐ</span>
                    <input
                      type="number" className="input text-2xl font-extrabold py-4 pl-14 text-right"
                      value={cashReceived || ''} placeholder="0"
                      onChange={e => setCashReceived(Number(e.target.value))} autoFocus/>
                  </div>
                </div>
                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {[currentOrder.totalPrice, 100000, 200000, 500000].map((amt, i) => (
                    <button key={i}
                      onClick={() => setCashReceived(amt)}
                      className="py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700
                        hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors">
                      {i === 0 ? 'Vừa đủ' : formatCurrency(amt).replace(' đ', 'k').replace(',000', '')}
                    </button>
                  ))}
                </div>
                {cashReceived > 0 && (
                  <div className={`flex justify-between items-center p-4 rounded-xl border ${
                    cashReceived >= currentOrder.totalPrice
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'}`}>
                    <span className={`font-bold text-sm ${cashReceived >= currentOrder.totalPrice ? 'text-green-700' : 'text-red-700'}`}>
                      {cashReceived >= currentOrder.totalPrice ? 'Tiền thừa trả khách:' : 'Còn thiếu:'}
                    </span>
                    <span className={`font-extrabold text-xl ${cashReceived >= currentOrder.totalPrice ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(cashReceived - currentOrder.totalPrice))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* QR method */}
            {paymentMethod === 'QR' && (
              <div className="flex flex-col items-center gap-3 animate-fade-in">
                <div className="relative p-3 border-2 border-dashed border-orange-400 rounded-3xl bg-white">
                  <img
                    src={`https://img.vietqr.io/image/970436-00000000000-compact2.png?amount=${currentOrder.totalPrice}&addInfo=DonHang${currentOrder.id}&accountName=PROPOS`}
                    alt="VietQR" className="w-56 h-56 rounded-2xl object-contain"/>
                  {paying && (
                    <div className="absolute inset-0 bg-white/80 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm">
                      <span className="material-symbols-outlined animate-spin text-orange-500 text-5xl mb-2">progress_activity</span>
                      <span className="font-bold text-orange-500">Đang xác nhận...</span>
                    </div>
                  )}
                </div>
                <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-orange-500 text-[18px] animate-pulse">radar</span>
                  Đang chờ khách quét mã...
                </p>
                <button onClick={handleCheckout} disabled={paying}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                  [Demo] Giả lập quét mã thành công
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button className="btn-ghost flex-1 py-3" onClick={() => setShowPaymentModal(false)} disabled={paying}>Huỷ bỏ</button>
              {paymentMethod === 'CASH' && (
                <button
                  className="btn-primary flex-1 py-3 text-base"
                  disabled={cashReceived < currentOrder.totalPrice || paying}
                  onClick={handleCheckout}>
                  {paying ? 'Đang xử lý...' : '✓ Xác nhận & In bill'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
