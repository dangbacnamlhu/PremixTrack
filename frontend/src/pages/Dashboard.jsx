import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/schedules?limit=5').then((r) => r.data),
    ])
      .then(([schedRes]) => {
        if (schedRes.success) {
          const list = schedRes.data.schedules || [];
          setRecent(list);
          const byStatus = {};
          list.forEach((s) => {
            byStatus[s.status] = (byStatus[s.status] || 0) + 1;
          });
          setStats({
            total: schedRes.data.pagination?.total ?? list.length,
            byStatus,
          });
        }
      })
      .catch(() => setStats({ total: 0, byStatus: {} }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trang chủ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-muted">Tổng lịch đặt</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats?.total ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-muted">Chờ duyệt</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {stats?.byStatus?.pending ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="text-sm text-muted">Hoàn thành</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {stats?.byStatus?.completed ?? 0}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Lịch đặt gần đây</h2>
          <Link
            to="/schedules"
            className="text-sm text-accent hover:underline font-medium"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-muted">Chưa có lịch đặt nào.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-muted">
                  <th className="px-5 py-3 font-medium">Mã lịch</th>
                  <th className="px-5 py-3 font-medium">Ngày</th>
                  <th className="px-5 py-3 font-medium">Số lượng</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{s.scheduleCode}</td>
                    <td className="px-5 py-3">{s.plannedDate} {s.plannedTime}</td>
                    <td className="px-5 py-3">{s.quantity} {s.unit}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : s.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : s.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
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
        </div>
      </section>
    </div>
  );
}
