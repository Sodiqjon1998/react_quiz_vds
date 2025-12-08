import React from 'react';
import {
  Home, BookOpen, Mic, CheckSquare,
  FileText, User, LogOut, X, Menu,
  Swords, Trophy, Gamepad2
} from 'lucide-react';

function Sidebar({ currentPage, onNavigate, onLogout, isMobileMenuOpen, onCloseMobileMenu }) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Bosh sahifa' },
    { id: 'kitobxonlik', icon: Mic, label: 'Kitobxonlik' },
    { id: 'vazifalar', icon: CheckSquare, label: 'Kunlik vazifalar' },
    { id: 'musobaqa', icon: Gamepad2, label: 'Bilimlar Janggi' },
    { id: 'duel', icon: Swords, label: '1 vs 1 Duel' },
    { id: 'quiz', icon: FileText, label: 'Quiz' },
    { id: 'profil', icon: User, label: 'Profil' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden transition-opacity"
          onClick={onCloseMobileMenu}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out
          
          /* ⚠️ O'ZGARISH SHU YERDA: xl:static ni O'CHIRIB, xl:fixed QILDIK */
          xl:translate-x-0 xl:fixed xl:h-screen
          
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <a href="/" className="flex items-center gap-2 text-gray-900 hover:text-orange-600 transition-colors">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              A
            </div>
            <span className="font-bold text-lg tracking-tight">AYM Platform</span>
          </a>

          {/* Close button (Mobile) */}
          <button
            className="xl:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            onClick={onCloseMobileMenu}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 1280) {
                    onCloseMobileMenu();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                )}
              </button>
            );
          })}

          <div className="my-4 border-t border-gray-100" />

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group mt-auto"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
            <span className="truncate">Chiqish</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;