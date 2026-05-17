import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { employeeService } from '../../services/employeeService';
import type { Employee, EmployeeFormData } from '../../services/employeeService';
import { branchService } from '../../services/branchService';
import type { Branch } from '../../types';
import Modal from '../../components/base/Modal';
import ConfirmDialog from '../../components/base/ConfirmDialog';

const EMPTY_FORM: EmployeeFormData = { username: '', password: '', fullName: '', role: 'STAFF', branch_id: undefined };

export default function EmployeePage() {
  const { user } = useAuth();
  const { success, error, Toasts } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  
  const [page, setPage] = useState(0);
  // const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState<Employee | null>(null);
  const [confirming, setConfirming] = useState(false);

  // For data isolation
  const isBoss = user?.role === 'BOSS';

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const bId = isBoss ? branchFilter : String(user?.branchId || '');
      const res = await employeeService.getAll(page, 10, search, roleFilter, bId);
      setEmployees(res.content);
      // setTotalPages(res.totalPages);
    } catch {
      error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    if (!isBoss) return;
    try {
      const res = await branchService.getAll(0, 100, '', 'ACTIVE');
      setBranches(res.content);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { fetchEmployees(); }, [page, roleFilter, branchFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); fetchEmployees(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { 
    setForm({ ...EMPTY_FORM, role: isBoss ? 'MANAGER' : 'STAFF', branch_id: isBoss ? undefined : user?.branchId }); 
    setEditTarget(null); 
    setShowForm(true); 
  };
  const openEdit = (e: Employee) => { 
    setForm({ username: e.username, fullName: e.fullName, role: e.role, branch_id: e.branchId, password: '' }); 
    setEditTarget(e); 
    setShowForm(true); 
  };

  const validateForm = () => {
    if (!form.username) return 'Email/Username bắt buộc';
    if (!form.fullName) return 'Tên hiển thị bắt buộc';
    if (!editTarget && !form.password) return 'Mật khẩu bắt buộc khi tạo mới';
    if (isBoss && !form.branch_id) return 'Bắt buộc chọn chi nhánh';
    return null;
  };

  const handleSave = async () => {
    const err = validateForm();
    if (err) { error(err); return; }

    setSaving(true);
    try {
      if (editTarget) {
        await employeeService.update(editTarget.id, form);
        success('Cập nhật nhân viên thành công');
      } else {
        await employeeService.create(form);
        success('Tạo tài khoản thành công');
      }
      setShowForm(false);
      fetchEmployees();
    } catch (e: any) {
      error(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      if (confirmTarget.status === 'ACTIVE') {
        await employeeService.deactivate(confirmTarget.id);
        success('Đã khóa tài khoản');
      } else {
        await employeeService.activate(confirmTarget.id);
        success('Đã mở khóa tài khoản');
      }
      setConfirmTarget(null);
      fetchEmployees();
    } catch (e: any) {
      error(e.message || 'Lỗi hệ thống');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <Toasts />
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Nhân sự</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Phân quyền và tài khoản đăng nhập</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <span className="material-symbols-outlined text-base">add</span>
          Thêm nhân viên
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input w-64" placeholder="Tìm tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-48" value={roleFilter} onChange={e => {setRoleFilter(e.target.value); setPage(0);}}>
          <option value="">Tất cả vai trò</option>
          {isBoss && <option value="MANAGER">Manager</option>}
          <option value="STAFF">Staff</option>
          <option value="CHEF">Chef</option>
        </select>
        {isBoss && (
          <select className="input w-48" value={branchFilter} onChange={e => {setBranchFilter(e.target.value); setPage(0);}}>
            <option value="">Tất cả chi nhánh</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ Tên</th>
              <th>Email/Username</th>
              <th>Vai trò</th>
              {isBoss && <th>Chi nhánh</th>}
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={isBoss ? 7 : 6} className="text-center py-10">Đang tải...</td></tr> : 
             employees.map(emp => (
              <tr key={emp.id}>
                <td className="font-mono text-xs">#{emp.id}</td>
                <td className="font-semibold">{emp.fullName}</td>
                <td>{emp.username}</td>
                <td>
                  <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-surface-bright)' }}>{emp.role}</span>
                </td>
                {isBoss && <td>{emp.branchName || '—'}</td>}
                <td>
                  {emp.status === 'ACTIVE' ? <span className="badge-success">Hoạt động</span> : <span className="badge-inactive">Bị khóa</span>}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="btn-icon" onClick={() => openEdit(emp)}><span className="material-symbols-outlined">edit</span></button>
                    <button className="btn-icon" onClick={() => setConfirmTarget(emp)} style={{ color: emp.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      <span className="material-symbols-outlined">{emp.status === 'ACTIVE' ? 'lock' : 'lock_open'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editTarget ? 'Sửa thông tin' : 'Thêm nhân viên'} onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <input className="input w-full" placeholder="Họ và tên *" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            <input className="input w-full" placeholder="Email/Username *" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            <input className="input w-full" type="password" placeholder={editTarget ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)" : "Mật khẩu *"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            
            {isBoss ? (
              <select className="input w-full" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="MANAGER">Manager</option>
                <option value="BOSS">Boss</option>
              </select>
            ) : (
              <select className="input w-full" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="STAFF">Staff</option>
                <option value="CHEF">Chef</option>
              </select>
            )}

            {isBoss && (
              <select className="input w-full" value={form.branch_id || ''} onChange={e => setForm({...form, branch_id: Number(e.target.value)})}>
                <option value="" disabled>-- Chọn chi nhánh --</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}

            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>Lưu</button>
            </div>
          </div>
        </Modal>
      )}

      {confirmTarget && (
        <ConfirmDialog
          message={confirmTarget.status === 'ACTIVE' ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản?'}
          confirmText="Đồng ý"
          onConfirm={handleToggleStatus}
          onCancel={() => setConfirmTarget(null)}
          loading={confirming}
        />
      )}
    </div>
  );
}
