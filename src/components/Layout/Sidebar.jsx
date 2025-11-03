import React from 'react';

function Sidebar({ currentPage, onNavigate, onLogout }) {
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Bosh sahifa' },
    { id: 'darslar', icon: '📚', label: 'Darslar' },
    { id: 'topshiriqlar', icon: '✍️', label: 'Topshiriqlar' },
    { id: 'natijalar', icon: '📊', label: 'Natijalar' },
    { id: 'profil', icon: '👤', label: 'Profil' },
    { id: 'sozlamalar', icon: '⚙️', label: 'Sozlamalar' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white min-h-screen flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-700">
        <h2 className="text-xl font-bold">AYM Platform</h2>
        <p className="text-indigo-300 text-sm mt-1">Andijon Yuksalish</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === item.id
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'hover:bg-indigo-700 text-indigo-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Chiqish</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;