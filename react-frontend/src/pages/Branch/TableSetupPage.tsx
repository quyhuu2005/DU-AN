import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { tableService } from '../../services/tableService';
import type { DiningTable, DiningTableFormData } from '../../services/tableService';
import Modal from '../../components/base/Modal';
import ConfirmDialog from '../../components/base/ConfirmDialog';

export default function TableSetupPage() {
  const { user } = useAuth();
  const { success, error, Toasts } = useToast();

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DiningTable | null>(null);
  const [form, setForm] = useState<Partial<DiningTableFormData>>({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DiningTable | null>(null);

  const isBoss = user?.role === 'BOSS';
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState('');

  const fetchTables = async () => {
    const targetBranchId = isBoss ? branchFilter : String(user?.branchId || '');
    if (!targetBranchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await tableService.getAll(Number(targetBranchId));
      setTables(res.data);
    } catch {
      error('Không thể tải sơ đồ bàn');
    } finally {
      setLoading(false);
    }
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

  const openAdd = () => { 
    if (isBoss && !branchFilter) return error('Vui lòng chọn chi nhánh trước');
    setForm({ capacity: 4 }); setEditTarget(null); setShowForm(true); 
  };
  const openEdit = (t: DiningTable) => { setForm({ name: t.name, zone: t.zone, capacity: t.capacity }); setEditTarget(t); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) return error('Tên bàn bắt buộc');
    if (!form.capacity || form.capacity <= 0) return error('Sức chứa phải lớn hơn 0');
    setSaving(true);
    try {
      const targetBranchId = isBoss ? Number(branchFilter) : user!.branchId!;
      const data = { branchId: targetBranchId, name: form.name, zone: form.zone || '', capacity: form.capacity };
      if (editTarget) await tableService.update(editTarget.id, data);
      else await tableService.create(data);
      success('Lưu thành công');
      setShowForm(false);
      fetchTables();
    } catch (e: any) {
      error(e.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tableService.delete(deleteTarget.id);
      success('Đã xóa bàn');
      setDeleteTarget(null);
      fetchTables();
    } catch (e: any) {
      error(e.message || 'Lỗi');
    }
  };

  return (
    <div>
      <Toasts />
      <div className="page-header">
        <div>
          <h1 className="page-title">Sơ đồ bàn</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Thiết lập không gian quán</p>
        </div>
        <div className="flex gap-3">
          {isBoss && (
            <select className="input" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
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

      {loading ? <div className="text-center py-10">Đang tải...</div> : 
       (!isBoss || branchFilter) && tables.length === 0 ? <div className="text-center py-10">Chưa có bàn nào</div> :
       isBoss && !branchFilter ? <div className="text-center py-10 text-gray-400">Vui lòng chọn chi nhánh để xem sơ đồ bàn</div> :
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map(t => (
          <div key={t.id} className="card p-4 relative hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <span className={`material-symbols-outlined text-3xl ${t.status === 'EMPTY' ? 'text-gray-400' : 'text-orange-500'}`}>
                {t.status === 'EMPTY' ? 'table_bar' : 'local_dining'}
              </span>
              <div className="flex gap-1">
                <button className="text-gray-400 hover:text-white" onClick={() => openEdit(t)}><span className="material-symbols-outlined text-sm">edit</span></button>
                <button className="text-red-400 hover:text-red-500" onClick={() => setDeleteTarget(t)}><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            </div>
            <div className="font-bold">{t.name}</div>
            <div className="text-xs text-gray-400 flex justify-between mt-1">
              <span>{t.capacity} người</span>
              <span>{t.zone || 'Khu chung'}</span>
            </div>
          </div>
        ))}
      </div>
      }

      {showForm && (
        <Modal title={editTarget ? 'Sửa bàn' : 'Thêm bàn mới'} onClose={() => setShowForm(false)} size="sm">
          <div className="space-y-4">
            <input className="input w-full" placeholder="Tên bàn *" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="input w-full" placeholder="Khu vực (Tầng 1, Ngoài trời...)" value={form.zone || ''} onChange={e => setForm({...form, zone: e.target.value})} />
            <input className="input w-full" type="number" placeholder="Sức chứa *" value={form.capacity || ''} onChange={e => setForm({...form, capacity: Number(e.target.value)})} />
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>Lưu</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Xóa bàn "${deleteTarget.name}"?`}
          confirmText="Xóa"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
