import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  FileQuestion, 
  FileSignature, 
  FileCheck2,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, signOut, isLoading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, roles: ['admin', 'guru', 'siswa'] },
    // Admin Only
    { name: 'Manajemen User', path: '/app/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Manajemen Soal', path: '/app/admin/questions', icon: FileQuestion, roles: ['admin'] },
    { name: 'Manajemen Ujian', path: '/app/admin/exams', icon: FileSignature, roles: ['admin'] },
    { name: 'Rekap Hasil', path: '/app/admin/results', icon: FileCheck2, roles: ['admin'] },
    // Guru Only
    { name: 'Bank Soal', path: '/app/guru/questions', icon: FileQuestion, roles: ['guru'] },
    { name: 'Buat Ujian', path: '/app/guru/exams', icon: FileSignature, roles: ['guru'] },
    { name: 'Hasil Ujian Siswa', path: '/app/guru/results', icon: FileCheck2, roles: ['guru'] },
    // Siswa Only
    { name: 'Daftar Ujian', path: '/app/siswa/exams', icon: FileSignature, roles: ['siswa'] },
    { name: 'Hasil Ujian', path: '/app/siswa/results', icon: FileCheck2, roles: ['siswa'] },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-base text-red-600">SMK PRIMA</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:static inset-y-0 left-0 w-[240px] bg-white border-r border-gray-200 z-10 transition-transform duration-200 flex flex-col py-6
      `}>
        <div className="px-6 pb-8 flex items-center gap-3 hidden md:flex">
          <div className="w-8 h-8 flex-shrink-0 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <div className="font-bold text-base text-red-600 leading-tight">SMK PRIMA</div>
            <div className="text-[10px] text-gray-500 leading-tight">UNGGUL &bull; CBT SYSTEM</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <nav className="flex flex-col">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const isExact = item.path === '/app' && location.pathname !== '/app';
              
              const activeClass = isActive && !isExact ? "bg-red-100 text-red-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900";
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${activeClass} flex items-center p-3 rounded-lg font-medium mb-1 transition-all`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="flex-shrink-0 mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6 text-[12px] text-gray-500 border-t border-gray-200 mt-4 leading-relaxed hidden md:block">
          TKJ &bull; DKV &bull; AK &bull; BC<br/>MPLB &bull; BD
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-0">
          <div className="font-semibold text-gray-500 text-sm hidden sm:block">
            {/* Context aware header text could be placed here, for now it matches the design */}
            Sistem Informasi Ujian Berbasis Komputer
          </div>
          <div className="flex-1 sm:hidden"></div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <div className="font-semibold text-sm text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
            <button 
              onClick={signOut}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-md text-sm font-semibold hover:bg-red-50 transition-colors ml-2"
            >
              Keluar
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-0 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
