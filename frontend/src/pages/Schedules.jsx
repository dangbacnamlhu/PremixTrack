import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Schedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    planned_date: '',
    planned_time: '08:00',
    quantity: '',
    unit: 'kg',
    priority: 'medium',
    notes: '',
  });

  const canCreate = ['admin', 'planner'].includes(user?.role);

  const fetchSchedules = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    api
      .get('/schedules', { params })
      .then((res) => {
        if (res.data.success) {
          setSchedules(res.data.data.schedules);
          setPagination(res.data.data.pagination || { page: 1, limit: 10, total: 0 });
        }
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchedules(pagination.page);
  }, [pagination.page, statusFilter]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.planned_date || !form.quantity) return;
    api
      .post('/schedules', {
        ...form,
        quantity: Number(form.quantity),
      })
      .then((res) => {
        if (res.data.success) {
          setShowForm(false);
          setForm({ planned_date: '', planned_time: '08:00', quantity: '', unit: 'kg', priority: 'medium', notes: '' });
          fetchSchedules(1);
        }
      })
      .catch((err) => alert(err.response?.data?.error || 'Tạo lịch thất bại'));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch đặt premix</h1>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-blue-700"
          >
            + Tạo lịch mới
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tạo lịch đặt mới</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến</label>
              <input
                type="date"
                value={form.planned_date}
                onChange={(e) => setForm({ ...form, planned_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ</label>
              <input
                type="time"
                value={form.planned_time}
                onChange={(e) => setForm({ ...form, planned_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tùy chọn"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg font-medium">
                Tạo lịch
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Đang tải...</div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-muted">Chưa có lịch đặt nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-muted">
                <th className="px-5 py-3 font-medium">Mã lịch</th>
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Số lượng</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium">Người tạo</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{s.scheduleCode}</td>
                  <td className="px-5 py-3">{s.plannedDate} {s.plannedTime}</td>
                  <td className="px-5 py-3">{s.quantity} {s.unit}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        s.status === 'completed' ? 'bg-green-100 text-green-800' :
                        s.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        s.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">{s.createdBy?.fullName || '-'}</td>
                  <td className="px-5 py-3">
                    <Link to={`/schedules/${s.id}`} className="text-accent hover:underline">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-muted">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} bản ghi)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
