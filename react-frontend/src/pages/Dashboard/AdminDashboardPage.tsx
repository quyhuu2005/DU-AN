import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div>
      {/* Welcome Message */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-on-surface">Chào mừng trở lại, Boss!</h2>
        <p className="text-on-surface-variant mt-1">Tổng quan hoạt động hệ thống hôm nay.</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-32 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant font-medium">Tổng doanh thu toàn chuỗi</span>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-on-surface">1.2B VNĐ</span>
            <div className="flex items-center text-secondary font-bold bg-secondary-container px-2 py-1 rounded text-xs">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
              +15%
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-32 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant font-medium">Số chi nhánh đang hoạt động</span>
            <span className="material-symbols-outlined text-primary">store</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-on-surface">12</span>
            <div className="flex items-center text-secondary font-bold border border-secondary px-2 py-1 rounded text-[10px]">
              ACTIVE
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-32 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant font-medium">Tổng số nhân viên</span>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-on-surface">450</span>
            <span className="text-sm text-on-surface-variant">Toàn hệ thống</span>
          </div>
        </div>
      </div>

      {/* Chart Section Placeholder */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface mb-4">Biểu đồ Doanh thu</h3>
        <div className="w-full h-64 bg-surface-container-low border border-dashed border-outline-variant rounded-lg flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">bar_chart</span>
            <p className="text-on-surface-variant">Khu vực hiển thị Line Chart Visualization</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low">
          <h3 className="text-lg font-bold text-on-surface">Top 5 chi nhánh đạt doanh thu cao nhất</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Chi nhánh</th>
                <th className="p-4 font-bold text-right">Doanh thu</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-on-surface">
              {[
                { id: '#CN01', name: 'Chi nhánh Quận 1', revenue: '320,000,000 VNĐ', status: 'Active' },
                { id: '#CN03', name: 'Chi nhánh Quận 3', revenue: '285,500,000 VNĐ', status: 'Active' },
                { id: '#CN07', name: 'Chi nhánh Quận 7', revenue: '250,000,000 VNĐ', status: 'Active' },
                { id: '#CN10', name: 'Chi nhánh Quận 10', revenue: '190,200,000 VNĐ', status: 'Active' },
                { id: '#CN05', name: 'Chi nhánh Quận 5', revenue: '154,800,000 VNĐ', status: 'Warning' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="p-4 text-on-surface-variant">{row.id}</td>
                  <td className="p-4 font-bold">{row.name}</td>
                  <td className="p-4 text-right">{row.revenue}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-secondary-container text-secondary' : 'bg-error-container text-error'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
