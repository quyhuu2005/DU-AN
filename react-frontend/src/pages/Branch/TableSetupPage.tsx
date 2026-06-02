import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { tableService } from '../../services/tableService';
import type { DiningTable, DiningTableFormData } from '../../services/tableService';
import Modal from '../../components/base/Modal';
import ConfirmDialog from '../../components/base/ConfirmDialog';

/* ─── Status config ─── */
const STATUS_CFG: Record<string, { label: string; icon: string; dot: string; card: string; badge: string }> = {
  EMPTY: {
    label: 'Trống',
    icon: 'table_restaurant',
    dot: 'bg-green-400',
    card: 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-lg',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  OCCUPIED: {
    label: 'Đang dùng',
    icon: 'room_service',
    dot: 'bg-red-400',
    card: 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-md',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  RESERVED: {
    label: 'Đặt trước',
    icon: 'event_seat',
    dot: 'bg-yellow-400',
    card: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:shadow-md',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
};

/* ─── Capacity icon helper ─── */
function CapacityDots({ capacity }: { capacity: number }) {
  const max = Math.min(capacity, 10);
  return (
    <div className="flex flex-wrap gap-0.5 justify-center mt-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"/>
      ))}
      {capacity > 10 && <span className="text-[9px] text-gray-400 font-bold">+{capacity - 10}</span>}
    </div>
  );
}

/* ─── Single Table Card ─── */
function TableCard({
  table,
  onEdit,
  onDelete,
}: {
  table: DiningTable;
  onEdit: (t: DiningTable) => void;
  onDelete: (t: DiningTable) => void;
}) {
  const cfg = STATUS_CFG[table.status] ?? STATUS_CFG.EMPTY;
  return (
    <div className={`relative group rounded-2xl border p-4 flex flex-col items-center text-center
      transition-all duration-200 cursor-default ${cfg.card}`}>

      {/* Action buttons – appear on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(table)}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center
            text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
          title="Sửa bàn">
          <span className="material-symbols-outlined text-[15px]">edit</span>
        </button>
        <button
          onClick={() => onDelete(table)}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center
            text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors"
          title="Xoá bàn">
          <span className="material-symbols-outlined text-[15px]">delete</span>
        </button>
      </div>

      {/* Icon */}
      <span className={`material-symbols-outlined text-3xl mb-1
        ${table.status === 'OCCUPIED' ? 'text-red-400' : table.status === 'RESERVED' ? 'text-yellow-500' : 'text-gray-300'}`}>
        {cfg.icon}
      </span>

      {/* Name */}
      <p className="font-extrabold text-sm text-gray-800 truncate w-full">{table.name}</p>

      {/* Capacity dots */}
      <CapacityDots capacity={table.capacity}/>

      {/* Capacity label */}
      <p className="text-[10px] text-gray-400 mt-0.5">{table.capacity} chỗ ngồi</p>

      {/* Status badge */}
      <span className={`mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
        text-[10px] font-bold border ${cfg.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`}/>
        {cfg.label}
      </span>
    </div>
  );
}

/* ════════════════════════════════ MAIN PAGE ════════════════════════ */
export default function TableSetupPage() {
  const { user } = useAuth();
  const { success, error, Toasts } = useToast();

  const [tables,  setTables]  = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState('');

  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<DiningTable | null>(null);
  const [form,        setForm]        = useState<Partial<DiningTableFormData>>({});
  const [saving,      setSaving]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiningTable | null>(null);

  /* view state */
  const [zoneFilter,  setZoneFilter]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode,    setViewMode]    = useState<'grid' | 'zone'>('zone');

  const isBoss = user?.role === 'BOSS';

  /* ── fetch ── */
  const fetchTables = async (silent = false) => {
    const targetBranchId = isBoss ? branchFilter : String(user?.branchId || '');
    if (!targetBranchId) { if (!silent) setLoading(false); return; }
    
    if (!silent) setLoading(true);
    try {
      const res = await tableService.getAll(Number(targetBranchId));
      setTables(res.data);
    } catch { 
      if (!silent) error('Không thể tải sơ đồ bàn'); 
    }
    finally { if (!silent) setLoading(false); }
  };

  const fetchBranches = async () => {
    if (!isBoss) return;
    try {
      const { branchService } = await import('../../services/branchService');
      const res = await branchService.getAll(0, 100, '', 'ACTIVE');
      setBranches(res.content);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { fetchTables(); }, [branchFilter, user?.branchId]);

  /* auto-refresh tables every 15s to stay in sync with POS */
  useEffect(() => {
    const id = setInterval(() => {
      fetchTables(true);
    }, 15_000);
    return () => clearInterval(id);
  }, [branchFilter, user?.branchId]);

  /* ── derived ── */
  const zones = useMemo(() => {
    const set = new Set(tables.map(t => t.zone || 'Khu chung'));
    return Array.from(set).sort();
  }, [tables]);

  const filteredTables = useMemo(() => {
    let list = tables;
    if (zoneFilter)   list = list.filter(t => (t.zone || 'Khu chung') === zoneFilter);
    if (statusFilter) list = list.filter(t => t.status === statusFilter);
    return list;
  }, [tables, zoneFilter, statusFilter]);

  const tablesByZone = useMemo(() => {
    const map: Record<string, DiningTable[]> = {};
    filteredTables.forEach(t => {
      const z = t.zone || 'Khu chung';
      if (!map[z]) map[z] = [];
      map[z].push(t);
    });
    return map;
  }, [filteredTables]);

  /* stats */
  const totalCount    = tables.length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const emptyCount    = tables.filter(t => t.status === 'EMPTY').length;
  const reservedCount = tables.filter(t => t.status === 'RESERVED').length;
  const occupancyPct  = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;

  /* ── form handlers ── */
  const openAdd = () => {
    if (isBoss && !branchFilter) return error('Vui lòng chọn chi nhánh trước');
    setForm({ capacity: 4, zone: zoneFilter || '' });
    setEditTarget(null);
    setShowForm(true);
  };
  const openEdit = (t: DiningTable) => {
    setForm({ name: t.name, zone: t.zone, capacity: t.capacity });
    setEditTarget(t);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return error('Tên bàn bắt buộc');
    if (!form.capacity || form.capacity <= 0) return error('Sức chứa phải lớn hơn 0');
    setSaving(true);
    try {
      const targetBranchId = isBoss ? Number(branchFilter) : user!.branchId!;
      const data = { branchId: targetBranchId, name: form.name.trim(), zone: form.zone || '', capacity: form.capacity };
      if (editTarget) await tableService.update(editTarget.id, data);
      else await tableService.create(data);
      success(editTarget ? 'Cập nhật bàn thành công' : 'Thêm bàn thành công');
      setShowForm(false);
      fetchTables();
    } catch (e: any) { error(e.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tableService.delete(deleteTarget.id);
      success(`Đã xoá ${deleteTarget.name}`);
      setDeleteTarget(null);
      fetchTables();
    } catch (e: any) { error(e.message || 'Lỗi'); }
  };

  /* ─── RENDER ─── */
  const showContent = !loading && (!isBoss || !!branchFilter);
  const needBranch  = isBoss && !branchFilter;

  return (
    <div>
      <Toasts />

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sơ đồ bàn</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Quản lý không gian & trạng thái bàn ăn
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {isBoss && (
            <select className="input min-w-[180px]" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
              <option value="" disabled>-- Chọn chi nhánh --</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <button className="btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined text-base">add</span>
            Thêm bàn
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      {showContent && tables.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-slide-up">
          {[
            { label: 'Tổng bàn',     value: totalCount,    icon: 'table_restaurant', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
            { label: 'Đang phục vụ', value: occupiedCount, icon: 'room_service',     color: 'text-red-600',  bg: 'bg-red-50',  border: 'border-red-200' },
            { label: 'Bàn trống',    value: emptyCount,    icon: 'chair_alt',        color: 'text-green-600',bg: 'bg-green-50',border: 'border-green-200' },
            { label: 'Đặt trước',    value: reservedCount, icon: 'event_seat',       color: 'text-yellow-600',bg:'bg-yellow-50',border:'border-yellow-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} px-5 py-4 flex items-center gap-3`}>
              <span className={`material-symbols-outlined text-3xl ${s.color}`}>{s.icon}</span>
              <div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Occupancy bar */}
      {showContent && tables.length > 0 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 animate-slide-up shadow-sm">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
              <span>Tỉ lệ bàn đang được sử dụng</span>
              <span className="font-bold text-gray-800">{occupancyPct}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${occupancyPct}%`,
                  background: occupancyPct > 80
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : occupancyPct > 50
                    ? 'linear-gradient(90deg, #f97316, #ea580c)'
                    : 'linear-gradient(90deg, #22c55e, #16a34a)',
                }}
              />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-700 shrink-0">
            {occupiedCount}/{totalCount} bàn
          </div>
        </div>
      )}

      {/* ── Filter & View bar ── */}
      {showContent && tables.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          {/* Zone pills */}
          <div className="flex gap-2 flex-wrap flex-1">
            <button
              onClick={() => setZoneFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                ${zoneFilter === '' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
              Tất cả khu
            </button>
            {zones.map(z => (
              <button key={z}
                onClick={() => setZoneFilter(z)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                  ${zoneFilter === z ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
                <span className="material-symbols-outlined text-[12px] mr-0.5">location_on</span>
                {z}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            className="input !py-1.5 !px-3 text-xs !w-auto"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Mọi trạng thái</option>
            <option value="EMPTY">Bàn trống</option>
            <option value="OCCUPIED">Đang phục vụ</option>
            <option value="RESERVED">Đặt trước</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            {(['zone', 'grid'] as const).map(v => (
              <button key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-md transition-all ${viewMode === v ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                <span className="material-symbols-outlined text-[18px]">{v === 'zone' ? 'view_agenda' : 'grid_view'}</span>
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="text-xs text-gray-400 font-medium">{filteredTables.length} bàn</span>
        </div>
      )}

      {/* ── States ── */}
      {loading && <div className="text-center py-20 text-gray-400">Đang tải sơ đồ bàn...</div>}

      {needBranch && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <span className="material-symbols-outlined text-6xl mb-3 opacity-30">store</span>
          <p className="font-medium">Vui lòng chọn chi nhánh để xem sơ đồ bàn</p>
        </div>
      )}

      {showContent && tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <span className="material-symbols-outlined text-6xl mb-3 opacity-30">table_restaurant</span>
          <p className="font-medium text-lg mb-1">Chưa có bàn nào</p>
          <p className="text-sm mb-5">Bắt đầu thiết lập không gian nhà hàng</p>
          <button className="btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined text-base">add</span>
            Thêm bàn đầu tiên
          </button>
        </div>
      )}

      {showContent && filteredTables.length === 0 && tables.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-2 opacity-30">search_off</span>
          <p className="font-medium">Không có bàn nào phù hợp với bộ lọc</p>
          <button className="mt-3 text-sm text-orange-500 hover:underline"
            onClick={() => { setZoneFilter(''); setStatusFilter(''); }}>
            Xoá bộ lọc
          </button>
        </div>
      )}

      {/* ── Tables Display ── */}
      {showContent && filteredTables.length > 0 && (
        <>
          {/* Zone grouped view */}
          {viewMode === 'zone' && (
            <div className="space-y-8 animate-slide-up">
              {Object.entries(tablesByZone).map(([zone, zoneTables]) => {
                const zoneOccupied = zoneTables.filter(t => t.status === 'OCCUPIED').length;
                return (
                  <div key={zone}>
                    {/* Zone header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-orange-400">location_on</span>
                        <h2 className="font-extrabold text-gray-700 uppercase tracking-widest text-sm">{zone}</h2>
                      </div>
                      <div className="flex-1 h-px bg-gray-100"/>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          {zoneOccupied} đang dùng
                        </span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {zoneTables.length - zoneOccupied} trống
                        </span>
                        {/* Quick add button for this zone */}
                        <button
                          onClick={() => {
                            setForm({ capacity: 4, zone });
                            setEditTarget(null);
                            setShowForm(true);
                          }}
                          className="text-[11px] text-orange-500 hover:text-orange-700 font-bold flex items-center gap-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Thêm bàn
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {zoneTables.map(t => (
                        <TableCard key={t.id} table={t} onEdit={openEdit} onDelete={setDeleteTarget}/>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Flat grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 animate-slide-up">
              {filteredTables.map(t => (
                <TableCard key={t.id} table={t} onEdit={openEdit} onDelete={setDeleteTarget}/>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <Modal title={editTarget ? `Sửa bàn: ${editTarget.name}` : 'Thêm bàn mới'} onClose={() => setShowForm(false)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="label">Tên bàn <span className="text-red-500">*</span></label>
              <input
                className="input w-full"
                placeholder="Ví dụ: Bàn 01, Table VIP..."
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Khu vực</label>
              <input
                className="input w-full"
                placeholder="Tầng trệt, Lầu 1, Sân vườn, Khu VIP..."
                value={form.zone || ''}
                onChange={e => setForm({ ...form, zone: e.target.value })}
                list="zone-suggestions"
              />
              <datalist id="zone-suggestions">
                {zones.map(z => <option key={z} value={z}/>)}
              </datalist>
            </div>
            <div>
              <label className="label">Sức chứa (số chỗ ngồi) <span className="text-red-500">*</span></label>
              <input
                className="input w-full"
                type="number" min={1} max={50}
                placeholder="4"
                value={form.capacity || ''}
                onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
              />
              {/* Visual preview */}
              {form.capacity && form.capacity > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 p-2 bg-gray-50 rounded-lg">
                  {Array.from({ length: Math.min(form.capacity, 20) }).map((_, i) => (
                    <span key={i} className="w-5 h-5 rounded-full bg-orange-200 border border-orange-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px] text-orange-600">person</span>
                    </span>
                  ))}
                  {form.capacity > 20 && (
                    <span className="text-xs text-gray-400 font-bold self-center">+{form.capacity - 20}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Huỷ</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Đang lưu...</>
                  : <><span className="material-symbols-outlined text-[18px]">save</span> {editTarget ? 'Cập nhật' : 'Thêm bàn'}</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Xoá bàn "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xoá bàn"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
