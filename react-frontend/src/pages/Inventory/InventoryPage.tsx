import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryItem, InventoryTransaction } from '../../services/inventoryService';

const STOCK_STATUS_CONFIG = {
  SUFFICIENT:    { label: 'Đủ hàng',  color: '#10b981', bg: '#ecfdf5', icon: 'check_circle'    },
  LOW:           { label: 'Sắp hết',  color: '#f59e0b', bg: '#fffbeb', icon: 'warning'          },
  OUT_OF_STOCK:  { label: 'Hết hàng', color: '#ef4444', bg: '#fef2f2', icon: 'cancel'           },
} as const;

const EXPORT_REASONS = ['Tiêu thụ hàng ngày', 'Hàng hỏng/hết hạn', 'Điều chỉnh tồn kho', 'Khác'];
const UNITS = ['kg', 'lít', 'cái', 'hộp', 'gói', 'chai', 'túi', 'bó', 'kg', 'gram'];

export default function InventoryPage() {
  const { user } = useAuth();
  const { error, success, Toasts } = useToast();

  const [items, setItems]       = useState<InventoryItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUFFICIENT' | 'LOW' | 'OUT_OF_STOCK'>('ALL');

  const isBoss = user?.role === 'BOSS';
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState('');

  // Fetch branches for BOSS
  useEffect(() => {
    if (!isBoss) return;
    import('../../services/branchService').then(({ branchService }) => {
      branchService.getAll(0, 100, '', 'ACTIVE').then(res => setBranches(res.content)).catch(() => {});
    });
  }, [isBoss]);

  const activeBranchId = isBoss ? Number(branchFilter) : user?.branchId;

  // Modal states
  const [showCreate, setShowCreate]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [showImport, setShowImport]     = useState(false);
  const [showExport, setShowExport]     = useState(false);
  const [showHistory, setShowHistory]   = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [txLoading, setTxLoading]       = useState(false);

  // Form data
  const [createForm, setCreateForm] = useState({ name: '', unit: 'kg', quantity: 0, minStock: 0 });
  const [editForm, setEditForm]     = useState({ name: '', unit: 'kg', minStock: 0 });
  const [importForm, setImportForm] = useState({ quantity: '', note: '' });
  const [exportForm, setExportForm] = useState({ quantity: '', reason: EXPORT_REASONS[0], note: '' });

  const fetchItems = useCallback(async () => {
    if (!activeBranchId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await inventoryService.getAll(activeBranchId, search);
      setItems(res.data ?? []);
    } catch (e: any) {
      error(e.message || 'Lỗi tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filteredItems = statusFilter === 'ALL' ? items : items.filter(i => i.stockStatus === statusFilter);

  // Handlers
  const handleCreate = async () => {
    if (!activeBranchId) return error('Vui lòng chọn chi nhánh');
    if (!createForm.name.trim() || !createForm.unit) return error('Vui lòng điền đầy đủ tên và đơn vị tính.');
    if (createForm.quantity < 0 || createForm.minStock < 0) return error('Số lượng không được âm.');
    try {
      await inventoryService.create(activeBranchId, {
        name: createForm.name.trim(), unit: createForm.unit,
        quantity: createForm.quantity, minStock: createForm.minStock,
      });
      success('Thêm mặt hàng thành công');
      setShowCreate(false);
      setCreateForm({ name: '', unit: 'kg', quantity: 0, minStock: 0 });
      fetchItems();
    } catch (e: any) { error(e.message); }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    if (!editForm.name.trim()) return error('Tên không được để trống.');
    if (editForm.minStock < 0) return error('Mức tối thiểu không được âm.');
    try {
      await inventoryService.update(selectedItem.id, {
        name: editForm.name.trim(), unit: editForm.unit, minStock: editForm.minStock,
      });
      success('Cập nhật thành công');
      setShowEdit(false);
      fetchItems();
    } catch (e: any) { error(e.message); }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm(`Xóa mặt hàng "${item.name}" khỏi kho?`)) return;
    try {
      await inventoryService.delete(item.id);
      success(`Đã xóa "${item.name}"`);
      fetchItems();
    } catch (e: any) { error(e.message); }
  };

  const handleImport = async () => {
    if (!selectedItem) return;
    const qty = parseFloat(importForm.quantity);
    if (isNaN(qty) || qty <= 0) return error('Số lượng phải là số dương lớn hơn 0.');
    try {
      await inventoryService.importStock(selectedItem.id, {
        quantity: qty, note: importForm.note || undefined,
        performedBy: user!.id!, performedByName: user!.fullName || '',
      });
      success(`Nhập kho thành công: +${qty} ${selectedItem.unit}`);
      setShowImport(false);
      setImportForm({ quantity: '', note: '' });
      fetchItems();
    } catch (e: any) { error(e.message); }
  };

  const handleExport = async () => {
    if (!selectedItem) return;
    const qty = parseFloat(exportForm.quantity);
    if (isNaN(qty) || qty <= 0) return error('Số lượng phải là số dương lớn hơn 0.');
    if (qty > selectedItem.quantity) return error(`Số lượng xuất vượt quá tồn kho (${selectedItem.quantity} ${selectedItem.unit}).`);
    try {
      await inventoryService.exportStock(selectedItem.id, {
        quantity: qty, reason: exportForm.reason, note: exportForm.note || undefined,
        performedBy: user!.id!, performedByName: user!.fullName || '',
      });
      success(`Xuất kho thành công: -${qty} ${selectedItem.unit}`);
      setShowExport(false);
      setExportForm({ quantity: '', reason: EXPORT_REASONS[0], note: '' });
      fetchItems();
    } catch (e: any) { error(e.message); }
  };

  const handleViewHistory = async (item: InventoryItem) => {
    setSelectedItem(item);
    setShowHistory(true);
    setTxLoading(true);
    try {
      const res = await inventoryService.getTransactions(item.id);
      setTransactions(res.data ?? []);
    } catch (e: any) { error(e.message); }
    finally { setTxLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const counts = {
    SUFFICIENT:   items.filter(i => i.stockStatus === 'SUFFICIENT').length,
    LOW:          items.filter(i => i.stockStatus === 'LOW').length,
    OUT_OF_STOCK: items.filter(i => i.stockStatus === 'OUT_OF_STOCK').length,
  };

  return (
    <div>
      <Toasts />
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>Quản lý Kho</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Theo dõi tồn kho, nhập/xuất hàng và nhận cảnh báo khi nguyên liệu sắp hết tại chi nhánh.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => { setCreateForm({ name: '', unit: 'kg', quantity: 0, minStock: 0 }); setShowCreate(true); }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm mặt hàng
        </button>
      </div>

      {isBoss && (
        <div className="mb-5">
          <select className="input max-w-xs" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="" disabled>-- Chọn chi nhánh để quản lý kho --</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([['SUFFICIENT', '📦 Đủ hàng', '#10b981'], ['LOW', '⚠️ Sắp hết', '#f59e0b'], ['OUT_OF_STOCK', '❌ Hết hàng', '#ef4444']] as const).map(([key, label, color]) => (
          <div
            key={key}
            className="card !p-5 cursor-pointer transition-all hover:shadow-lg"
            style={{ borderLeft: `4px solid ${color}` }}
            onClick={() => setStatusFilter(statusFilter === key ? 'ALL' : key)}
          >
            <p className="text-3xl font-extrabold" style={{ color }}>{counts[key]}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input
            className="input pl-10"
            placeholder="Tìm kiếm nguyên liệu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'SUFFICIENT', 'LOW', 'OUT_OF_STOCK'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                statusFilter === f
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'ALL' ? 'Tất cả' : STOCK_STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              {['Tên nguyên liệu', 'Đơn vị', 'Tồn kho', 'Mức tối thiểu', 'Trạng thái', 'Cập nhật', 'Thao tác'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span>
              </td></tr>
            ) : isBoss && !branchFilter ? (
              <tr><td colSpan={7} className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-gray-200">store</span>
                <p className="text-gray-400 mt-2 text-sm">Vui lòng chọn chi nhánh để quản lý kho.</p>
              </td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-gray-200">inventory_2</span>
                <p className="text-gray-400 mt-2 text-sm">Không có mặt hàng nào. Nhấn "Thêm mặt hàng" để bắt đầu.</p>
              </td></tr>
            ) : filteredItems.map(item => {
              const sc = STOCK_STATUS_CONFIG[item.stockStatus];
              return (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.unit}</td>
                  <td className="px-4 py-3">
                    <span className="text-xl font-extrabold" style={{ color: sc.color }}>{item.quantity}</span>
                    <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.minStock} {item.unit}</td>
                  <td className="px-4 py-3">
                    <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{sc.icon}</span>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        title="Nhập kho"
                        onClick={() => { setSelectedItem(item); setImportForm({ quantity: '', note: '' }); setShowImport(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-100 text-green-600 transition-colors"
                      ><span className="material-symbols-outlined text-[18px]">add_circle</span></button>
                      <button
                        title="Xuất kho"
                        onClick={() => { setSelectedItem(item); setExportForm({ quantity: '', reason: EXPORT_REASONS[0], note: '' }); setShowExport(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 text-orange-600 transition-colors"
                      ><span className="material-symbols-outlined text-[18px]">remove_circle</span></button>
                      <button
                        title="Lịch sử"
                        onClick={() => handleViewHistory(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-100 text-blue-600 transition-colors"
                      ><span className="material-symbols-outlined text-[18px]">history</span></button>
                      <button
                        title="Sửa"
                        onClick={() => { setSelectedItem(item); setEditForm({ name: item.name, unit: item.unit, minStock: item.minStock }); setShowEdit(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                      ><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button
                        title="Xóa"
                        onClick={() => handleDelete(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 text-red-500 transition-colors"
                      ><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MODALS ── */}

      {/* Create */}
      {showCreate && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-md">
            <h3 className="modal-title flex items-center gap-2"><span className="material-symbols-outlined">inventory_2</span>Thêm mặt hàng mới</h3>
            <div className="space-y-4 my-5">
              <div><label className="label">Tên nguyên liệu *</label><input className="input" placeholder="VD: Thịt bò, Gạo, Dầu ăn..." value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Đơn vị tính *</label>
                <select className="input" value={createForm.unit} onChange={e => setCreateForm(p => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Tồn kho ban đầu</label><input type="number" min="0" className="input" value={createForm.quantity} onChange={e => setCreateForm(p => ({ ...p, quantity: +e.target.value }))} /></div>
                <div><label className="label">Mức tối thiểu</label><input type="number" min="0" className="input" value={createForm.minStock} onChange={e => setCreateForm(p => ({ ...p, minStock: +e.target.value }))} /></div>
              </div>
            </div>
            <div className="flex gap-3"><button className="btn-ghost flex-1" onClick={() => setShowCreate(false)}>Hủy</button><button className="btn-primary flex-1" onClick={handleCreate}>Lưu</button></div>
          </div>
        </div>
      )}

      {/* Edit */}
      {showEdit && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-md">
            <h3 className="modal-title flex items-center gap-2"><span className="material-symbols-outlined">edit</span>Sửa mặt hàng</h3>
            <div className="space-y-4 my-5">
              <div><label className="label">Tên nguyên liệu *</label><input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Đơn vị tính *</label>
                <select className="input" value={editForm.unit} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div><label className="label">Mức tối thiểu</label><input type="number" min="0" className="input" value={editForm.minStock} onChange={e => setEditForm(p => ({ ...p, minStock: +e.target.value }))} /></div>
            </div>
            <div className="flex gap-3"><button className="btn-ghost flex-1" onClick={() => setShowEdit(false)}>Hủy</button><button className="btn-primary flex-1" onClick={handleEdit}>Lưu</button></div>
          </div>
        </div>
      )}

      {/* Import */}
      {showImport && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-md">
            <h3 className="modal-title flex items-center gap-2 !text-green-600"><span className="material-symbols-outlined">add_circle</span>Nhập kho</h3>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--color-bg)' }}>
              <p className="font-bold text-lg">{selectedItem.name}</p>
              <p className="text-sm text-gray-500">Tồn kho hiện tại: <strong className="text-green-600">{selectedItem.quantity} {selectedItem.unit}</strong></p>
            </div>
            <div className="space-y-4 my-4">
              <div>
                <label className="label">Số lượng nhập ({selectedItem.unit}) *</label>
                <input type="number" min="0.001" step="0.001" className="input text-xl font-bold" placeholder="0" value={importForm.quantity} onChange={e => setImportForm(p => ({ ...p, quantity: e.target.value }))} autoFocus />
              </div>
              <div><label className="label">Ghi chú (tùy chọn)</label><input className="input" placeholder="Nhập từ nhà cung cấp A..." value={importForm.note} onChange={e => setImportForm(p => ({ ...p, note: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3"><button className="btn-ghost flex-1" onClick={() => setShowImport(false)}>Hủy</button><button className="flex-1 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors" onClick={handleImport}>✓ Xác nhận nhập</button></div>
          </div>
        </div>
      )}

      {/* Export */}
      {showExport && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-md">
            <h3 className="modal-title flex items-center gap-2 !text-orange-600"><span className="material-symbols-outlined">remove_circle</span>Xuất kho</h3>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--color-bg)' }}>
              <p className="font-bold text-lg">{selectedItem.name}</p>
              <p className="text-sm text-gray-500">Tồn kho hiện tại: <strong className="text-orange-600">{selectedItem.quantity} {selectedItem.unit}</strong></p>
            </div>
            <div className="space-y-4 my-4">
              <div>
                <label className="label">Số lượng xuất ({selectedItem.unit}) *</label>
                <input type="number" min="0.001" step="0.001" max={selectedItem.quantity} className="input text-xl font-bold" placeholder="0" value={exportForm.quantity} onChange={e => setExportForm(p => ({ ...p, quantity: e.target.value }))} autoFocus />
                {exportForm.quantity && parseFloat(exportForm.quantity) > selectedItem.quantity && (
                  <p className="text-red-500 text-xs mt-1">⚠️ Vượt quá tồn kho ({selectedItem.quantity} {selectedItem.unit})</p>
                )}
              </div>
              <div>
                <label className="label">Lý do *</label>
                <select className="input" value={exportForm.reason} onChange={e => setExportForm(p => ({ ...p, reason: e.target.value }))}>
                  {EXPORT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="label">Ghi chú (tùy chọn)</label><input className="input" placeholder="Thêm ghi chú..." value={exportForm.note} onChange={e => setExportForm(p => ({ ...p, note: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3"><button className="btn-ghost flex-1" onClick={() => setShowExport(false)}>Hủy</button><button className="flex-1 py-2.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors" onClick={handleExport}>✓ Xác nhận xuất</button></div>
          </div>
        </div>
      )}

      {/* History */}
      {showHistory && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-2xl">
            <h3 className="modal-title flex items-center gap-2"><span className="material-symbols-outlined">history</span>Lịch sử giao dịch: {selectedItem.name}</h3>
            <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
              {txLoading ? (
                <div className="flex justify-center py-8"><span className="material-symbols-outlined animate-spin text-3xl text-gray-300">progress_activity</span></div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Chưa có giao dịch nào.</p>
              ) : transactions.map(tx => (
                <div key={tx.id} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0 font-bold ${tx.type === 'IMPORT' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {tx.type === 'IMPORT' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className={`font-bold text-sm ${tx.type === 'IMPORT' ? 'text-green-600' : 'text-orange-600'}`}>
                        {tx.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}: {tx.quantity} {selectedItem.unit}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(tx.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tx.performedByName && <><strong>{tx.performedByName}</strong> · </>}
                      {tx.reason && <span>{tx.reason} · </span>}
                      {tx.note || 'Không có ghi chú'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4"><button className="btn-ghost w-full" onClick={() => setShowHistory(false)}>Đóng</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
