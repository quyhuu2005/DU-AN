import { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import type { Category, CategoryFormData } from '../../types';
import Modal from '../../components/base/Modal';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

const EMPTY_FORM: CategoryFormData = { name: '' };

const CATEGORY_ICONS = [
  'restaurant', 'lunch_dining', 'local_pizza', 'ramen_dining',
  'local_cafe', 'icecream', 'set_meal', 'bakery_dining',
];

export default function CategoryPage() {
  const { success, error, Toasts } = useToast();

  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');

  const [showForm, setShowForm]       = useState(false);
  const [editTarget, setEditTarget]   = useState<Category | null>(null);
  const [form, setForm]               = useState<CategoryFormData>(EMPTY_FORM);
  const [nameError, setNameError]     = useState('');
  const [saving, setSaving]           = useState(false);

  const [deleteTarget, setDeleteTarget]   = useState<Category | null>(null);
  const [deleting, setDeleting]           = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
    } catch {
      error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Form ──
  const openAdd = () => { setForm(EMPTY_FORM); setNameError(''); setEditTarget(null); setShowForm(true); };
  const openEdit = (c: Category) => { setForm({ name: c.name }); setNameError(''); setEditTarget(c); setShowForm(true); };
  const closeForm = () => setShowForm(false);

  const validateForm = (): boolean => {
    if (!form.name.trim()) { setNameError('Tên danh mục không được để trống'); return false; }
    // Check duplicate
    const isDup = categories.some(
      (c) => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editTarget?.id
    );
    if (isDup) { setNameError('Danh mục này đã tồn tại'); return false; }
    setNameError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await categoryService.update(editTarget.id, { name: form.name.trim() });
        success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create({ name: form.name.trim() });
        success('Thêm danh mục thành công');
      }
      closeForm();
      fetchCategories();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.itemCount > 0) {
      error('Không thể xóa danh mục đang có món ăn. Vui lòng chuyển các món sang danh mục khác trước.');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await categoryService.delete(deleteTarget.id);
      success('Đã xóa danh mục');
      setDeleteTarget(null);
      fetchCategories();
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <Toasts />

      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Danh mục</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Phân loại món ăn trong thực đơn gốc
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd} id="btn-add-category">
          <span className="material-symbols-outlined text-base">add</span>
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base"
          style={{ color: 'var(--color-text-placeholder)' }}>search</span>
        <input
          id="category-search"
          className="input pl-10"
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Card grid ── */}
      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="material-symbols-outlined animate-spin text-4xl block mb-2">progress_activity</span>
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="material-symbols-outlined text-5xl block mb-2">category</span>
          Chưa có danh mục nào
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((c, i) => (
            <div key={c.id} className="card flex flex-col items-center text-center py-5 gap-2 hover:shadow-md transition-shadow">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                style={{ background: 'var(--color-primary-light)' }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-primary)' }}>
                  {CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
                </span>
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{c.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{c.itemCount} món ăn</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="btn-icon w-8 h-8"
                  title="Chỉnh sửa"
                  id={`btn-edit-cat-${c.id}`}
                  onClick={() => openEdit(c)}
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                  className="btn-icon w-8 h-8"
                  title={c.itemCount > 0 ? 'Không thể xóa danh mục đang có món ăn' : 'Xóa danh mục'}
                  id={`btn-delete-cat-${c.id}`}
                  onClick={() => c.itemCount > 0
                    ? error('Không thể xóa danh mục đang có món ăn.')
                    : setDeleteTarget(c)}
                  style={{ color: c.itemCount > 0 ? 'var(--color-text-placeholder)' : 'var(--color-danger)', cursor: c.itemCount > 0 ? 'not-allowed' : 'pointer' }}
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <Modal
          title={editTarget ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          onClose={closeForm}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="cat-name">
                Tên danh mục <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="cat-name"
                className={`input ${nameError ? 'error' : ''}`}
                placeholder="VD: Tráng miệng"
                value={form.name}
                onChange={(e) => { setForm({ name: e.target.value }); setNameError(''); }}
                autoFocus
              />
              {nameError && (
                <p className="field-error">
                  <span className="material-symbols-outlined text-sm">error</span>{nameError}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button className="btn-ghost flex-1" onClick={closeForm} disabled={saving}>Hủy</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving} id="btn-save-category">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Xóa danh mục "${deleteTarget.name}"?`}
          description="Hành động này không thể hoàn tác."
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
