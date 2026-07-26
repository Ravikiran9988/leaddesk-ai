import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, LogOut, Users, Kanban, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';
import NotificationCenter from './NotificationCenter';
import { USER_ROLES, ROLE_COLORS, canManageUsers } from '../utils/constants';

const AdminLayout = ({ children, title, subtitle, onSelectLead }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                AI LeadDesk Enterprise
              </p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Center Bell */}
              <NotificationCenter onSelectLead={onSelectLead} />

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
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
