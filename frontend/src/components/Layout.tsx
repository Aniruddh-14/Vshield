import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, UserPlus, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/candidates/new', icon: UserPlus, label: 'Add Candidate' },
];

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">VShield</span>
          <p className="text-xs text-indigo-300/70 -mt-0.5">Verification Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-3 text-xs font-semibold text-indigo-300/50 uppercase tracking-widest">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-indigo-200/70 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isActive ? 'bg-indigo-500/40' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {label}
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300/60 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-300/70 hover:bg-red-500/15 hover:text-red-300 transition-all"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5">
            <LogOut className="w-4 h-4" />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 shadow-xl shadow-slate-900/20">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full shadow-2xl">
            <button className="absolute top-4 right-4 p-1.5 text-indigo-300/70 hover:text-white rounded-lg z-10" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-900">VShield</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
