import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-accent text-white' : 'text-muted hover:bg-gray-200'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center text-white font-bold">
                PT
              </div>
              <div>
                <div className="font-bold text-gray-900">PremixTrack</div>
                <div className="text-xs text-muted">Quản lý & theo dõi premix</div>
              </div>
            </NavLink>
            <nav className="flex gap-1 ml-6">
              <NavLink to="/" end className={navClass}>Trang chủ</NavLink>
              <NavLink to="/schedules" className={navClass}>Lịch đặt</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {user?.fullName} <span className="text-gray-400">({user?.role})</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
