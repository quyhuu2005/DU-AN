import { useEffect, useRef, useState } from 'react';
import { menuService } from '../../services/menuService';
import { uploadService } from '../../services/uploadService';
import { categoryService } from '../../services/categoryService';
import type { MenuItem, MenuItemFormData, Category } from '../../types';
import { formatCurrency } from '../../utils';
import Modal from '../../components/base/Modal';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

const EMPTY_FORM: MenuItemFormData = { name: '', categoryId: 0, basePrice: 0, description: '', imageUrl: '' };

export default function MasterMenuPage() {
  const { success, error, Toasts } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [items, setItems]       = useState<MenuItem[]>([]);
  const [cats, setCats]         = useState<Category[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [form, setForm]             = useState<MenuItemFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});
  const [saving, setSaving]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await menuService.getAll(page, 10, search, catFilter);
      setItems(res.content);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalElements);
    } catch {
      error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = async () => {
    try {
      const res = await categoryService.getAll();
      setCats(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchCats(); }, []);
  useEffect(() => { fetchItems(); }, [page, catFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); fetchItems(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Form ──
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, categoryId: cats[0]?.id ?? 0 });
    setFormErrors({});
    setEditTarget(null);
    setShowForm(true);
  };
  const openEdit = (m: MenuItem) => {
    setForm({ name: m.name, categoryId: m.categoryId, basePrice: m.basePrice, description: m.description, imageUrl: m.imageUrl ?? '' });
    setFormErrors({});
    setEditTarget(m);
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const validateForm = (): boolean => {
    const errs: typeof formErrors = {};
    if (!form.name.trim())         errs.name       = 'Tên món ăn không được để trống';
    if (!form.categoryId)          errs.categoryId = 'Vui lòng chọn danh mục';
    if (form.basePrice <= 0)       errs.basePrice  = 'Giá gốc phải lớn hơn 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await menuService.update(editTarget.id, form);
        success('Cập nhật món ăn thành công');
      } else {
        await menuService.create(form);
        success('Thêm món ăn thành công. Đã tự động phân bổ xuống các chi nhánh.');
      }
      closeForm();
      fetchItems();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.hasOrders) {
      error('Không thể xóa do món này đã phát sinh hóa đơn. Vui lòng sử dụng tính năng Ẩn món.');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await menuService.delete(deleteTarget.id);
      success('Đã xóa món ăn');
      setDeleteTarget(null);
      fetchItems();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const onFormChange = <K extends keyof MenuItemFormData>(field: K, value: MenuItemFormData[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const PAGE_SIZE = 10;
  const start = page * PAGE_SIZE + 1;
  const end   = Math.min((page + 1) * PAGE_SIZE, totalItems);

  return (
    <div>
      <Toasts />

      <div className="page-header">
        <div>
          <h1 className="page-title">Thực đơn Gốc</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Quản lý danh sách món ăn chuẩn cho toàn hệ thống
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd} id="btn-add-menu-item">
          <span className="material-symbols-outlined text-base">add</span>
          Thêm món ăn
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base"
            style={{ color: 'var(--color-text-placeholder)' }}>search</span>
          <input
            id="menu-search"
            className="input pl-10"
            placeholder="Tìm tên món..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="menu-cat-filter"
          className="input w-44"
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(0); }}
        >
          <option value="">Tất cả danh mục</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: 56 }}>Ảnh</th>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá gốc</th>
              <th>Mô tả</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined animate-spin text-3xl block mx-auto mb-2">progress_activity</span>Đang tải...
              </td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined text-4xl block mb-2">restaurant_menu</span>Chưa có món ăn nào
              </td></tr>
            ) : items.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.imageUrl
                    ? <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-lg object-cover" />
                    : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--color-primary-light)' }}>
                        <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)' }}>restaurant</span>
                      </div>
                    )
                  }
                </td>
                <td className="font-semibold">{m.name}</td>
                <td>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    {m.categoryName}
                  </span>
                </td>
                <td className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(m.basePrice)}
                </td>
                <td className="text-sm max-w-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {m.description || '—'}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button className="btn-icon" title="Chỉnh sửa" onClick={() => openEdit(m)} id={`btn-edit-item-${m.id}`}>
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      className="btn-icon"
                      title={m.hasOrders ? 'Đã phát sinh hóa đơn — không thể xóa' : 'Xóa món ăn'}
                      id={`btn-delete-item-${m.id}`}
                      onClick={() => m.hasOrders
                        ? error('Không thể xóa do món này đã phát sinh hóa đơn.')
                        : setDeleteTarget(m)}
                      style={{ color: m.hasOrders ? 'var(--color-text-placeholder)' : 'var(--color-danger)', cursor: m.hasOrders ? 'not-allowed' : 'pointer' }}
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span>Hiển thị {start}–{end} / {totalItems} món ăn</span>
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
          title={editTarget ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
          onClose={closeForm}
          size="md"
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="label" htmlFor="item-name">Tên món <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input id="item-name" className={`input ${formErrors.name ? 'error' : ''}`}
                placeholder="VD: Phở bò đặc biệt"
                value={form.name} onChange={(e) => onFormChange('name', e.target.value)} />
              {formErrors.name && <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{formErrors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="label" htmlFor="item-cat">Danh mục <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select id="item-cat" className={`input ${formErrors.categoryId ? 'error' : ''}`}
                value={form.categoryId}
                onChange={(e) => onFormChange('categoryId', Number(e.target.value))}>
                <option value={0} disabled>-- Chọn danh mục --</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {formErrors.categoryId && <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{formErrors.categoryId}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="label" htmlFor="item-price">Giá gốc (VNĐ) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input id="item-price" type="number" min={0} className={`input ${formErrors.basePrice ? 'error' : ''}`}
                placeholder="0"
                value={form.basePrice || ''}
                onChange={(e) => onFormChange('basePrice', Number(e.target.value))} />
              {formErrors.basePrice && <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{formErrors.basePrice}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label" htmlFor="item-desc">Mô tả</label>
              <textarea id="item-desc" rows={3} className="input resize-none"
                placeholder="Mô tả ngắn về món ăn..."
                value={form.description}
                onChange={(e) => onFormChange('description', e.target.value)} />
            </div>

            {/* Ảnh món ăn */}
            <div>
              <label className="label">Ảnh món ăn</label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const url = await uploadService.uploadImage(file);
                    onFormChange('imageUrl', url);
                    success('Đã tải ảnh lên thành công');
                  } catch (err: any) {
                    error(err.message ?? 'Upload thất bại');
                  } finally {
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }}
              />

              {form.imageUrl ? (
                /* Preview */
                <div className="relative w-full h-44 rounded-xl overflow-hidden border group"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-sm font-semibold"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <span className="material-symbols-outlined text-base">upload</span>
                      Đổi ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => onFormChange('imageUrl', '')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-sm font-semibold text-red-500"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Xóa
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload box */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-primary/60 hover:bg-primary/[0.02] disabled:opacity-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined text-3xl animate-spin" style={{ color: 'var(--color-primary)' }}>progress_activity</span>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Đang tải ảnh...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-primary)' }}>add_photo_alternate</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Nhấn để chọn ảnh từ máy</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>JPG, PNG, WEBP — tối đa 10MB</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Auto-sync note */}
            {!editTarget && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <span className="material-symbols-outlined text-base mt-0.5">info</span>
                <span>Món ăn sẽ tự động được phân bổ xuống tất cả chi nhánh với trạng thái <strong>Ngừng bán</strong>.</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button className="btn-ghost flex-1" onClick={closeForm} disabled={saving}>Hủy</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving} id="btn-save-menu-item">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Xóa món "${deleteTarget.name}"?`}
          description="Hành động này sẽ xóa món khỏi tất cả chi nhánh (chỉ áp dụng nếu chưa có hóa đơn)."
          confirmText="Xóa"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
