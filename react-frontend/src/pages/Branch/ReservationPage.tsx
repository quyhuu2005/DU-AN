import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { reservationService } from '../../services/reservationService';
import type { Reservation, ReservationRequest } from '../../services/reservationService';
import type { DiningTable } from '../../services/tableService';

function formatDateForInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function ReservationPage() {
  const { user } = useAuth();
  const { error, success, Toasts } = useToast();

  const [date, setDate] = useState<string>(formatDateForInput(new Date()));
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSize, setFormSize] = useState(2);
  const [formTime, setFormTime] = useState('19:00');
  const [formDuration, setFormDuration] = useState(90);
  const [formNote, setFormNote] = useState('');
  const [formTableId, setFormTableId] = useState<number | null>(null);

  const [availableTables, setAvailableTables] = useState<DiningTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    if (!user?.branchId) return;
    setLoading(true);
    try {
      const res = await reservationService.getByDate(user.branchId, date);
      setReservations(res.data || []);
    } catch (e: any) {
      error('Lỗi tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [date, user?.branchId]);

  // Load available tables when datetime changes in form
  useEffect(() => {
    if (!showForm || !user?.branchId || !date || !formTime) return;
    const fetchAvail = async () => {
      setLoadingTables(true);
      try {
        const isoDateTime = `${date}T${formTime}:00`;
        const res = await reservationService.getAvailableTables(user.branchId!, isoDateTime, formDuration, formSize, editingId || undefined);
        setAvailableTables(res.data || []);
        // Reset selected table if it's no longer available
        if (formTableId && !(res.data || []).find((t: DiningTable) => t.id === formTableId)) {
          setFormTableId(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTables(false);
      }
    };
    const debounceId = setTimeout(fetchAvail, 500);
    return () => clearTimeout(debounceId);
  }, [showForm, date, formTime, formDuration, formSize, user?.branchId, editingId]);

  const handleSave = async () => {
    if (!formName.trim() || !formPhone.trim()) {
      error('Vui lòng nhập tên và SĐT');
      return;
    }
    if (!/^\d{10}$/.test(formPhone)) {
      error('Số điện thoại không hợp lệ ');
      return;
    }
    if (formName.length > 100) {
      error('Tên quá dài');
      return;
    }
    if (!user?.branchId) return;

    setSaving(true);
    try {
      const isoDateTime = `${date}T${formTime}:00`;
      const req: ReservationRequest = {
        branchId: user.branchId,
        tableId: formTableId,
        customerName: formName,
        customerPhone: formPhone,
        partySize: formSize,
        reservedAt: isoDateTime,
        durationMinutes: formDuration,
        note: formNote
      };
      
      if (editingId) {
        await reservationService.update(editingId, req);
        success('Cập nhật đặt bàn thành công');
      } else {
        await reservationService.create(req);
        success('Tạo đặt bàn thành công');
      }
      
      setShowForm(false);
      setEditingId(null);
      fetchReservations();
    } catch (e: any) {
      error(e.response?.data?.message || e.message || 'Lỗi lưu đặt bàn');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await reservationService.updateStatus(id, status);
      success('Cập nhật trạng thái thành công');
      fetchReservations();
    } catch (e: any) {
      error(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    'PENDING': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    'SEATED': { label: 'Đã nhận bàn', color: 'bg-green-100 text-green-700' },
    'CANCELLED': { label: 'Đã huỷ', color: 'bg-gray-100 text-gray-500' },
    'NO_SHOW': { label: 'Không đến', color: 'bg-red-100 text-red-700' },
    'COMPLETED': { label: 'Đã hoàn thành', color: 'bg-purple-100 text-purple-700' }
  };

  const filteredReservations = reservations.filter(r => 
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.customerPhone.includes(searchQuery)
  );

  const openEdit = (r: Reservation) => {
    setEditingId(r.id);
    setFormName(r.customerName);
    setFormPhone(r.customerPhone);
    setFormSize(r.partySize);
    
    const rDate = new Date(r.reservedAt);
    setDate(formatDateForInput(rDate));
    setFormTime(`${String(rDate.getHours()).padStart(2, '0')}:${String(rDate.getMinutes()).padStart(2, '0')}`);
    setFormDuration(r.durationMinutes);
    setFormNote(r.note || '');
    setFormTableId(r.tableId || null);
    
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <Toasts />
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đặt Bàn</h1>
          <p className="text-sm text-gray-500 mt-1">Sắp xếp và theo dõi lịch hẹn của khách hàng</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1 shadow-sm">
            <span className="material-symbols-outlined text-gray-400 mr-2">calendar_month</span>
            <input 
              type="date" 
              className="border-none outline-none text-sm font-semibold text-gray-700 py-1 cursor-pointer"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Tìm tên, SĐT..."
                className="input pl-9 w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => {
                setEditingId(null);
                setFormName(''); setFormPhone(''); setFormSize(2); setFormTime('19:00');
                setFormDuration(90); setFormNote(''); setFormTableId(null);
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo Đặt Bàn
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tổng lượt đặt</p>
          <p className="text-2xl font-extrabold text-gray-800">{reservations.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Đã xác nhận</p>
          <p className="text-2xl font-extrabold text-blue-800">
            {reservations.filter(r => r.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
          <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Đã nhận / Hoàn thành</p>
          <p className="text-2xl font-extrabold text-green-800">
            {reservations.filter(r => r.status === 'SEATED' || r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
          <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">No-show / Hủy</p>
          <p className="text-2xl font-extrabold text-red-800">
            {reservations.filter(r => r.status === 'NO_SHOW' || r.status === 'CANCELLED').length}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : reservations.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-3 opacity-30">event_busy</span>
            <p className="font-medium">Không có lịch đặt bàn nào trong ngày này</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Giờ đến</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Bàn / Khu</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ghi chú</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservations.sort((a,b) => a.reservedAt.localeCompare(b.reservedAt)).map(r => {
                const rDate = new Date(r.reservedAt);
                const timeStr = `${String(rDate.getHours()).padStart(2,'0')}:${String(rDate.getMinutes()).padStart(2,'0')}`;
                
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-base text-gray-800">{timeStr}</div>
                      <div className="text-xs text-gray-400 font-medium">({r.durationMinutes} phút)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{r.customerName}</div>
                      <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                        {r.customerPhone}
                      </div>
                      <div className="text-xs text-orange-600 font-bold bg-orange-50 inline-block px-1.5 rounded mt-1">
                        {r.partySize} khách
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.tableName ? (
                        <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                          {r.tableName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa xếp bàn</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusMap[r.status]?.color || 'bg-gray-100'}`}>
                        {statusMap[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                      {r.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                        <button onClick={() => openEdit(r)} className="text-orange-500 font-bold text-xs hover:underline mr-3">
                          <span className="material-symbols-outlined text-[14px] align-middle mr-1">edit</span>Sửa
                        </button>
                      )}
                      {r.status === 'PENDING' && (
                        <button onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')} className="text-blue-600 font-bold text-xs hover:underline mr-3">Xác nhận</button>
                      )}
                      {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                        <>
                          <button onClick={() => handleUpdateStatus(r.id, 'CANCELLED')} className="text-gray-500 font-bold text-xs hover:underline mr-3">Huỷ</button>
                          <button onClick={() => handleUpdateStatus(r.id, 'NO_SHOW')} className="text-red-500 font-bold text-xs hover:underline">No-show</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-box max-w-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">
                {editingId ? 'edit_calendar' : 'calendar_month'}
              </span>
              {editingId ? 'Sửa Đặt Bàn' : 'Đặt Bàn Mới'}
            </h3>
            
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="label">Tên khách hàng *</label>
                <input className="input" placeholder="Nguyễn Văn A" maxLength={100} value={formName} onChange={e => setFormName(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="label">Số điện thoại *</label>
                <input className="input" placeholder="090..." maxLength={20} value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Ngày đến</label>
                  <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} disabled />
                </div>
                <div>
                  <label className="label">Giờ đến *</label>
                  <input type="time" className="input" value={formTime} onChange={e => setFormTime(e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Số người</label>
                  <input type="number" min={1} className="input" value={formSize} onChange={e => setFormSize(Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">Dự kiến (phút)</label>
                  <select className="input" value={formDuration} onChange={e => setFormDuration(Number(e.target.value))}>
                    <option value={60}>1 tiếng (60p)</option>
                    <option value={90}>1.5 tiếng (90p)</option>
                    <option value={120}>2 tiếng (120p)</option>
                    <option value={180}>3 tiếng (180p)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="label flex items-center justify-between">
                <span>Chọn Bàn</span>
                {loadingTables && <span className="text-xs text-orange-500 animate-pulse">Đang tìm bàn trống...</span>}
              </label>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                {availableTables.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Không có bàn nào trống trong khung giờ này</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setFormTableId(null)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors
                        ${formTableId === null ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-orange-300'}`}
                    >
                      Chưa xếp bàn
                    </button>
                    {availableTables.map(t => {
                      const isSuitable = t.capacity >= formSize;
                      return (
                        <button key={t.id}
                          onClick={() => setFormTableId(t.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center gap-1.5
                            ${formTableId === t.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300'}
                            ${!isSuitable && formTableId !== t.id ? 'opacity-50' : ''}`}
                        >
                          {t.name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${formTableId === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {t.capacity} chỗ
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="label">Ghi chú đặc biệt</label>
              <input className="input" placeholder="Dị ứng đậu phộng, ghế trẻ em, sinh nhật..." value={formNote} onChange={e => setFormNote(e.target.value)} />
            </div>
            
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 py-2.5" onClick={() => setShowForm(false)} disabled={saving}>Huỷ</button>
              <button className="btn-primary flex-1 py-2.5" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Xác nhận đặt bàn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
