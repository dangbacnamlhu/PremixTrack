import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/schedules/${id}`)
      .then((res) => {
        if (res.data.success) setSchedule(res.data.data);
      })
      .catch(() => setSchedule(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-muted">Đang tải...</div>;
  if (!schedule) {
    return (
      <div className="text-center py-8">
        <p className="text-muted mb-4">Không tìm thấy lịch đặt.</p>
        <Link to="/schedules" className="text-accent hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const statusLabel = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/schedules" className="text-accent hover:underline text-sm">← Quay lại danh sách</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{schedule.scheduleCode}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
              schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
              schedule.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-700'
            }`}
          >
            {statusLabel[schedule.status] || schedule.status}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted">Ngày dự kiến</div>
              <div className="font-medium">{schedule.plannedDate} {schedule.plannedTime}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Số lượng</div>
              <div className="font-medium">{schedule.quantity} {schedule.unit}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Ưu tiên</div>
              <div className="font-medium">{schedule.priority}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Người tạo</div>
              <div className="font-medium">{schedule.createdBy?.fullName} ({schedule.createdBy?.email})</div>
            </div>
            {schedule.approvedBy && (
              <div>
                <div className="text-sm text-muted">Người duyệt</div>
                <div className="font-medium">{schedule.approvedBy.fullName}</div>
              </div>
            )}
          </div>
          {schedule.notes && (
            <div>
              <div className="text-sm text-muted">Ghi chú</div>
              <div className="text-gray-900">{schedule.notes}</div>
            </div>
          )}
          {schedule.items?.length > 0 && (
            <div>
              <div className="text-sm text-muted mb-2">Chi tiết nguyên liệu</div>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium">Nguyên liệu</th>
                    <th className="px-4 py-2 text-left font-medium">Số lượng</th>
                    <th className="px-4 py-2 text-left font-medium">Đơn vị</th>
                    <th className="px-4 py-2 text-left font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-4 py-2">{item.ingredientName}</td>
                      <td className="px-4 py-2">{item.quantityRequired}</td>
                      <td className="px-4 py-2">{item.unit}</td>
                      <td className="px-4 py-2">{item.percentage ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
