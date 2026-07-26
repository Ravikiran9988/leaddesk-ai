import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, LogOut, Users, Kanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { USER_ROLES, ROLE_COLORS, canManageUsers } from '../utils/constants';

const AdminLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">AI LeadDesk</p>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                {user?.role && (
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_COLORS[user.role]}`}>
                    {USER_ROLES[user.role]}
                  </span>
                )}
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/admin" end className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/kanban" className={navLinkClass}>
              <Kanban className="h-4 w-4" />
              Kanban
            </NavLink>
            <NavLink to="/admin/assistant" className={navLinkClass}>
              <Bot className="h-4 w-4" />
              AI Assistant
            </NavLink>
            {canManageUsers(user?.role) && (
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="h-4 w-4" />
                Users
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
