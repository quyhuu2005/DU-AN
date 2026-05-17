import { useEffect, useState } from 'react';
import { branchService } from '../../services/branchService';
import type { Branch, BranchFormData } from '../../types';
import { isValidPhone } from '../../utils';
import Modal from '../../components/base/Modal';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

const EMPTY_FORM: BranchFormData = { name: '', address: '', phone: '' };

export default function BranchPage() {
  const { success, error, Toasts } = useToast();

  // ── State ──
  const [branches,    setBranches]    = useState<Branch[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);

  // Modal state
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<Branch | null>(null);
  const [form,        setForm]        = useState<BranchFormData>(EMPTY_FORM);
  const [formErrors,  setFormErrors]  = useState<Partial<BranchFormData>>({});
  const [saving,      setSaving]      = useState(false);

  // Confirm dialog
  const [confirmTarget, setConfirmTarget] = useState<Branch | null>(null);
  const [confirming,    setConfirming]    = useState(false);

  // ── Fetch ──
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await branchService.getAll(page, 10, search, statusFilter);
      setBranches(res.content);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalElements);
    } catch {
      error('Không thể tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, [page, statusFilter]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); fetchBranches(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Form helpers ──
  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditTarget(null); setShowForm(true); };
  const openEdit = (b: Branch) => {
    setForm({ name: b.name, address: b.address, phone: b.phone });
    setFormErrors({});
    setEditTarget(b);
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const validateForm = (): boolean => {
    const errs: Partial<BranchFormData> = {};
    if (!form.name.trim())    errs.name    = 'Tên chi nhánh không được để trống';
    if (!form.address.trim()) errs.address = 'Địa chỉ không được để trống';
    if (!form.phone.trim())   errs.phone   = 'Số điện thoại không được để trống';
    else if (!isValidPhone(form.phone)) errs.phone = 'Định dạng số điện thoại không hợp lệ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await branchService.update(editTarget.id, form);
        success('Cập nhật chi nhánh thành công');
      } else {
        await branchService.create(form);
        success('Thêm chi nhánh thành công');
      }
      closeForm();
      fetchBranches();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle status ──
  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      if (confirmTarget.status === 'ACTIVE') {
        await branchService.deactivate(confirmTarget.id);
        success('Đã ngừng hoạt động chi nhánh');
      } else {
        await branchService.activate(confirmTarget.id);
        success('Đã kích hoạt lại chi nhánh');
      }
      setConfirmTarget(null);
      fetchBranches();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Thao tác thất bại');
    } finally {
      setConfirming(false);
    }
  };

  const onChange = (field: keyof BranchFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const PAGE_SIZE = 10;
  const start = page * PAGE_SIZE + 1;
  const end   = Math.min((page + 1) * PAGE_SIZE, totalItems);

  return (
    <div>
      <Toasts />

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Chi nhánh</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Quản lý toàn bộ điểm kinh doanh trong hệ thống
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd} id="btn-add-branch">
          <span className="material-symbols-outlined text-base">add</span>
          Thêm chi nhánh
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base"
            style={{ color: 'var(--color-text-placeholder)' }}>search</span>
          <input
            id="branch-search"
            className="input pl-10"
            placeholder="Tìm kiếm tên, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="branch-status-filter"
          className="input w-48"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên chi nhánh</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined animate-spin text-3xl block mx-auto mb-2">progress_activity</span>
                Đang tải...
              </td></tr>
            ) : branches.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined text-4xl block mb-2">storefront</span>
                Chưa có chi nhánh nào
              </td></tr>
            ) : branches.map((b) => (
              <tr key={b.id}>
                <td className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  #{String(b.id).padStart(3, '0')}
                </td>
                <td className="font-semibold">{b.name}</td>
                <td style={{ color: 'var(--color-text-secondary)', maxWidth: 220 }} className="truncate">{b.address}</td>
                <td>{b.phone}</td>
                <td>
                  {b.status === 'ACTIVE'
                    ? <span className="badge-success"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>Hoạt động</span>
                    : <span className="badge-inactive">Ngừng hoạt động</span>
                  }
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="btn-icon"
                      title="Chỉnh sửa"
                      id={`btn-edit-branch-${b.id}`}
                      onClick={() => openEdit(b)}
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      className="btn-icon"
                      title={b.status === 'ACTIVE' ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
                      id={`btn-toggle-branch-${b.id}`}
                      onClick={() => setConfirmTarget(b)}
                      style={{ color: b.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)' }}
                    >
                      <span className="material-symbols-outlined text-base">
                        {b.status === 'ACTIVE' ? 'lock' : 'lock_open'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span>Hiển thị {start}–{end} / {totalItems} chi nhánh</span>
          <div className="flex gap-1">
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${page === i ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPage(i)}
              >{i + 1}</button>
            ))}
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <Modal
          title={editTarget ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
          onClose={closeForm}
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="label" htmlFor="branch-name">Tên chi nhánh <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input id="branch-name" className={`input ${formErrors.name ? 'error' : ''}`}
                placeholder="VD: Chi nhánh Quận 1" value={form.name} onChange={onChange('name')} />
              {formErrors.name && <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{formErrors.name}</p>}
            </div>
            {/* Address */}
            <div>
              <label className="label" htmlFor="branch-address">Địa chỉ <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input id="branch-address" className={`input ${formErrors.address ? 'error' : ''}`}
                placeholder="Số nhà, đường, quận, thành phố" value={form.address} onChange={onChange('address')} />
              {formErrors.address && <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{formErrors.address}</p>}
            </div>
            {/* Phone */}
            <div>
              <label className="label" htmlFor="branch-phone">Số điện thoại <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input id="branch-phone" type="tel" className={`input ${formErrors.phone ? 'error' : ''}`}
                placeholder="028xxxxxxxx" value={form.phone} onChange={onChange('phone')} />
              {formErrors.phone && <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{formErrors.phone}</p>}
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1" onClick={closeForm} disabled={saving}>Hủy</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving} id="btn-save-branch">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm Dialog ── */}
      {confirmTarget && (
        <ConfirmDialog
          message={confirmTarget.status === 'ACTIVE'
            ? 'Ngừng hoạt động chi nhánh này?'
            : 'Kích hoạt lại chi nhánh này?'}
          description={confirmTarget.status === 'ACTIVE'
            ? 'Hành động này sẽ ngăn nhân sự đăng nhập. Dữ liệu hóa đơn cũ vẫn được giữ lại.'
            : 'Chi nhánh sẽ hoạt động trở lại và nhân sự có thể đăng nhập.'}
          confirmText={confirmTarget.status === 'ACTIVE' ? 'Ngừng hoạt động' : 'Kích hoạt'}
          variant={confirmTarget.status === 'ACTIVE' ? 'danger' : 'warning'}
          onConfirm={handleToggleStatus}
          onCancel={() => setConfirmTarget(null)}
          loading={confirming}
        />
      )}
    </div>
  );
}
