import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { branchMenuService } from '../../services/branchMenuService';
import type { BranchMenu } from '../../services/branchMenuService';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types';
import { formatCurrency } from '../../utils';

export default function BranchMenuPage() {
  const { user } = useAuth();
  const { success, error, Toasts } = useToast();

  const [items, setItems] = useState<BranchMenu[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const isBoss = user?.role === 'BOSS';
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState('');

  const fetchItems = async () => {
    const targetBranchId = isBoss ? branchFilter : String(user?.branchId || '');
    if (!targetBranchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await branchMenuService.getAll(Number(targetBranchId), 0, 1000, search, catFilter);
      setItems(res.content);
    } catch {
      error('Không thể tải thực đơn');
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

  useEffect(() => {
    categoryService.getAll().then(r => setCats(r.data)).catch(() => {});
    fetchBranches();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchItems, 400);
    return () => clearTimeout(t);
  }, [search, catFilter, branchFilter, user?.branchId]);

  const handlePriceChange = async (id: number, val: string) => {
    const p = Number(val);
    if (isNaN(p) || p < 0) return;
    try {
      await branchMenuService.updatePrice(id, p);
      success('Đã lưu giá');
      setItems(prev => prev.map(i => i.id === id ? { ...i, localPrice: p } : i));
    } catch(e: any) {
      error(e.message || 'Lỗi');
    }
  };

  const handleToggle = async (m: BranchMenu) => {
    try {
      await branchMenuService.toggleStatus(m.id, !m.isAvailable);
      setItems(prev => prev.map(i => i.id === m.id ? { ...i, isAvailable: !m.isAvailable } : i));
    } catch(e: any) {
      error(e.message || 'Lỗi');
    }
  };

  return (
    <div>
      <Toasts />
      <div className="page-header">
        <div>
          <h1 className="page-title">Thực đơn Chi nhánh</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Tùy chỉnh giá bán & trạng thái món</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <input className="input w-64" placeholder="Tìm tên món..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-48" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {isBoss && (
          <select className="input w-48" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="" disabled>-- Chọn chi nhánh --</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{width: 56}}>Ảnh</th>
              <th>Tên món & Danh mục</th>
              <th>Giá gốc</th>
              <th>Giá bán tại CN</th>
              <th>Trạng thái (Đang bán)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-10">Đang tải...</td></tr> :
             isBoss && !branchFilter ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">Vui lòng chọn chi nhánh để xem thực đơn</td></tr> :
             items.length === 0 ? <tr><td colSpan={5} className="text-center py-10">Chưa có món ăn nào</td></tr> :
             items.map(m => (
               <tr key={m.id}>
                 <td>
                   {m.imageUrl ? <img src={m.imageUrl} className="w-10 h-10 rounded-lg object-cover"/> : <div className="w-10 h-10 bg-gray-800 rounded-lg" />}
                 </td>
                 <td>
                   <div className="font-semibold">{m.productName}</div>
                   <div className="text-xs text-gray-400">{m.categoryName}</div>
                 </td>
                 <td className="text-gray-400">{formatCurrency(m.basePrice)}</td>
                 <td>
                   <input type="number" min={0} className="input w-32" defaultValue={m.localPrice} onBlur={e => handlePriceChange(m.id, e.target.value)} />
                 </td>
                 <td>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={m.isAvailable} onChange={() => handleToggle(m)} className="sr-only" />
                     <div className={`w-10 h-6 rounded-full transition-colors ${m.isAvailable ? 'bg-green-500' : 'bg-gray-600'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${m.isAvailable ? 'translate-x-5' : 'translate-x-1'}`} />
                     </div>
                   </label>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
