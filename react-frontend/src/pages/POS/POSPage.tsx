import { useState, useEffect } from 'react';
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
import { formatCurrency } from '../../utils';

export default function POSPage() {
  const { user } = useAuth();
  const { error, success, Toasts } = useToast();
  
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [categories, setCats] = useState<Category[]>([]);
  const [menus, setMenus] = useState<BranchMenu[]>([]);
  
  const [activeTab, setActiveTab] = useState<'TABLES' | 'MENU'>('TABLES');
  const [catFilter, setCatFilter] = useState('');
  
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<BranchMenu | null>(null);
  const [qtyValue, setQtyValue] = useState(1);
  const [cashReceived, setCashReceived] = useState(0);
  
  const [showOpenTable, setShowOpenTable] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!user?.branchId) return;
    fetchTables();
    categoryService.getAll().then(r => setCats(r.data)).catch(() => {});
    branchMenuService.getAll(user.branchId, 0, 1000).then(r => setMenus(r.content)).catch(() => {});
  }, [user?.branchId]);

  const fetchTables = async () => {
    if (!user?.branchId) return;
    try {
      const res = await tableService.getAll(user.branchId);
      setTables(res.data);
    } catch { /* silent */ }
  };

  const handleSelectTable = async (table: DiningTable) => {
    setSelectedTable(table);
    setLoading(true);
    try {
      const res = await orderService.getActiveOrderByTable(table.id);
      if (res.data) {
        setCurrentOrder(res.data);
        setActiveTab('MENU'); 
      } else {
        if (table.status === 'EMPTY') {
          setShowOpenTable(true);
        } else {
          setCurrentOrder(null);
        }
      }
    } catch (e: any) {
      error(e.message || 'Lỗi khi chọn bàn');
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmOpenTable = async () => {
    if (!selectedTable || !user?.branchId || !user?.id) return;
    try {
      const res = await orderService.createOrder(user.branchId, selectedTable.id, user.id);
      setCurrentOrder(res.data);
      setShowOpenTable(false);
      setActiveTab('MENU');
      fetchTables();
    } catch (e: any) {
      error(e.message || 'Lỗi mở bàn');
    }
  };

  const openAddItemModal = (menu: BranchMenu) => {
    if (!currentOrder) {
      error('Vui lòng chọn bàn để gọi món');
      return;
    }
    if (!menu.isAvailable) {
      error('Món này đã hết');
      return;
    }
    setSelectedMenu(menu);
    setQtyValue(1);
    setShowQtyModal(true);
  };

  const handleAddItem = async () => {
    if (!currentOrder || !selectedMenu) return;
    try {
      const res = await orderService.addItem(currentOrder.id, selectedMenu.productId, qtyValue);
      setCurrentOrder(res.data);
      setShowQtyModal(false);
      success(`Đã thêm ${qtyValue} ${selectedMenu.productName}`);
    } catch (e: any) {
      error(e.message || 'Lỗi thêm món');
    }
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
    } catch (e: any) {
      error(e.message || 'Lỗi cập nhật');
    }
  };

  const handleCheckout = async () => {
    if (!currentOrder) return;
    setPaying(true);
    try {
      await orderService.checkout(currentOrder.id);
      success('Thanh toán thành công & Giải phóng bàn');
      setCurrentOrder(null);
      setSelectedTable(null);
      setShowPaymentModal(false);
      setActiveTab('TABLES');
      fetchTables();
    } catch (e: any) {
      error(e.message || 'Lỗi thanh toán');
    } finally {
      setPaying(false);
    }
  };

  // Need to map category id/name roughly if needed, since BranchMenu only has categoryName
  const catsMap: Record<string, string> = {};
  categories.forEach(c => catsMap[c.id.toString()] = c.name);

  const filteredMenus = catFilter ? menus.filter(m => m.categoryName === catsMap[catFilter]) : menus;

  return (
    <div className="flex h-screen font-sans" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <Toasts />
      
      {/* ── MAIN CONTENT (Left 70%) ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header & Tabs */}
        <div className="flex items-center justify-between p-4 border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex gap-2">
            <button 
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors ${activeTab === 'TABLES' ? 'bg-[#f97316] text-white shadow-md' : 'btn-ghost'}`}
              onClick={() => setActiveTab('TABLES')}
            >
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">grid_view</span>Sơ đồ bàn</span>
            </button>
            <button 
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors ${activeTab === 'MENU' ? 'bg-[#f97316] text-white shadow-md' : 'btn-ghost'}`}
              onClick={() => setActiveTab('MENU')}
            >
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">restaurant_menu</span>Thực đơn</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user?.fullName}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Chi nhánh {user?.branchId}</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
              }}
              className="btn-ghost !text-red-600 hover:!bg-red-50 !border-red-200"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'TABLES' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {tables.map(t => {
                const isSelected = selectedTable?.id === t.id;
                const isEmpty = t.status === 'EMPTY';
                return (
                  <div 
                    key={t.id} 
                    onClick={() => handleSelectTable(t)}
                    className={`relative rounded-2xl p-5 cursor-pointer flex flex-col items-center justify-center min-h-[140px] transition-all
                      ${isSelected ? 'ring-4 ring-[#f97316] ring-offset-2' : 'hover:shadow-md'}
                      ${isEmpty ? 'bg-white border' : 'bg-red-50 border border-red-200 text-red-700'}
                    `}
                    style={{ borderColor: isEmpty ? 'var(--color-border)' : undefined }}
                  >
                    <span className={`material-symbols-outlined text-4xl mb-2 ${isEmpty ? 'text-gray-400' : 'text-red-500'}`}>
                      {isEmpty ? 'table_restaurant' : 'room_service'}
                    </span>
                    <span className="font-bold text-lg">{t.name}</span>
                    <span className={`text-xs mt-1 ${isEmpty ? 'text-gray-500' : 'text-red-600 font-medium'}`}>
                      {t.zone} - {t.capacity} chỗ
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'MENU' && (
            <div className="flex flex-col h-full">
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                <button 
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border
                    ${catFilter === '' ? 'bg-[#f97316] text-white border-[#f97316] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setCatFilter('')}
                >
                  Tất cả
                </button>
                {categories.map(c => (
                  <button 
                    key={c.id}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border
                      ${catFilter === c.id.toString() ? 'bg-[#f97316] text-white border-[#f97316] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setCatFilter(c.id.toString())}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
                {filteredMenus.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => openAddItemModal(m)}
                    className={`card !p-3 flex flex-col transition-all group
                      ${m.isAvailable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'opacity-50 cursor-not-allowed grayscale'}
                    `}
                  >
                    <div className="w-full h-36 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                      {m.imageUrl ? (
                         <img src={m.imageUrl} alt={m.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                         <span className="material-symbols-outlined text-gray-300 text-5xl">fastfood</span>
                      )}
                    </div>
                    <span className="font-bold text-sm mb-1 line-clamp-2">{m.productName}</span>
                    <span className="text-[#f97316] font-extrabold mt-auto text-lg">{formatCurrency(m.localPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SIDEBAR BILL (Right 30%) ── */}
      <div className="w-[400px] flex flex-col h-full shadow-xl z-10" style={{ background: 'var(--color-surface)' }}>
        {/* Bill Header */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined">receipt_long</span>
            Hóa đơn thanh toán
          </h2>
          {selectedTable ? (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Bàn đang phục vụ: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedTable.name}</strong>
            </p>
          ) : (
            <p className="text-sm mt-1 text-gray-400">Vui lòng chọn bàn để order</p>
          )}
        </div>

        {/* Bill Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ background: 'var(--color-bg)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-4xl mb-2">progress_activity</span>
              <span>Đang tải...</span>
            </div>
          ) : currentOrder?.items && currentOrder.items.length > 0 ? (
            currentOrder.items.map(item => (
              <div key={item.id} className="bg-white border rounded-xl p-3 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-bold text-sm text-gray-800 line-clamp-2">{item.productName}</span>
                  <span className="font-bold text-[#f97316] shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">{formatCurrency(item.price)}/sp</span>
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                    <button className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-l-lg transition-colors" onClick={() => handleUpdateQty(item.id, item.quantity, -1)}>
                      <span className="material-symbols-outlined text-[18px]">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-r-lg transition-colors" onClick={() => handleUpdateQty(item.id, item.quantity, 1)}>
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-60">
              <span className="material-symbols-outlined text-7xl">point_of_sale</span>
              <p className="font-medium text-sm">Chưa có món nào được gọi</p>
            </div>
          )}
        </div>

        {/* Bill Footer */}
        <div className="p-5 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium mb-1">Tổng tiền:</span>
            <span className="text-4xl font-extrabold text-[#f97316]">
              {formatCurrency(currentOrder?.totalPrice || 0)}
            </span>
          </div>
          <button 
            disabled={!currentOrder || currentOrder.items.length === 0 || paying}
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-[#f97316] hover:bg-[#ea6c10] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg active:scale-[0.98]"
          >
            {paying ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span> ĐANG XỬ LÝ...</>
            ) : (
              <><span className="material-symbols-outlined">point_of_sale</span> THANH TOÁN</>
            )}
          </button>
        </div>
      </div>
      {/* ── MODALS ── */}
      
      {/* 1. Mở bàn Modal */}
      {showOpenTable && (
        <div className="modal-backdrop">
          <div className="modal-box text-center">
            <span className="material-symbols-outlined text-6xl text-[#f97316] mb-4">door_open</span>
            <h3 className="modal-title">Mở bàn phục vụ</h3>
            <p className="mb-6 text-gray-600">Xác nhận bắt đầu phục vụ tại <strong>{selectedTable?.name}</strong>?</p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setShowOpenTable(false)}>Hủy</button>
              <button className="btn-primary flex-1" onClick={confirmOpenTable}>Bắt đầu</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Chọn số lượng Modal */}
      {showQtyModal && selectedMenu && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="modal-title flex items-center gap-2">
              <span className="material-symbols-outlined">add_shopping_cart</span>
              Chọn số lượng
            </h3>
            <div className="flex items-center gap-4 my-6 p-4 bg-gray-50 rounded-xl">
              <img src={selectedMenu.imageUrl} className="w-16 h-16 rounded-lg object-cover border" alt="" />
              <div>
                <p className="font-bold">{selectedMenu.productName}</p>
                <p className="text-[#f97316] font-bold">{formatCurrency(selectedMenu.localPrice)}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100" onClick={() => setQtyValue(Math.max(1, qtyValue - 1))}>
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="text-3xl font-extrabold w-12 text-center">{qtyValue}</span>
              <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100" onClick={() => setQtyValue(qtyValue + 1)}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setShowQtyModal(false)}>Hủy</button>
              <button className="btn-primary flex-1" onClick={handleAddItem}>Thêm vào hóa đơn</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Thanh toán Modal */}
      {showPaymentModal && currentOrder && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-lg">
            <h3 className="modal-title flex items-center gap-2">
              <span className="material-symbols-outlined">payments</span>
              Xác nhận thanh toán
            </h3>
            <div className="space-y-4 my-6">
              <div className="flex justify-between text-lg">
                <span className="text-gray-500">Tổng tiền cần thu:</span>
                <span className="font-extrabold text-2xl text-[#f97316]">{formatCurrency(currentOrder.totalPrice)}</span>
              </div>
              <div className="space-y-2">
                <label className="label">Tiền khách đưa:</label>
                <input 
                  type="number" 
                  className="input text-2xl font-bold py-4" 
                  value={cashReceived || ''} 
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  placeholder="Nhập số tiền..."
                  autoFocus
                />
              </div>
              {cashReceived > 0 && (
                <div className="flex justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-green-700 font-bold text-lg">Tiền thối lại:</span>
                  <span className="text-green-700 font-extrabold text-xl">
                    {formatCurrency(Math.max(0, cashReceived - currentOrder.totalPrice))}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setShowPaymentModal(false)}>Hủy</button>
              <button 
                className="btn-primary flex-1" 
                disabled={cashReceived < currentOrder.totalPrice || paying}
                onClick={handleCheckout}
              >
                {paying ? 'Đang xử lý...' : 'Xác nhận & In bill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
