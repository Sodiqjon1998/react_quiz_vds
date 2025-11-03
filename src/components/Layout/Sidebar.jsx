import React from 'react';

function Sidebar({ currentPage, onNavigate, onLogout }) {
  const menuItems = [
    { id: 'dashboard', icon: 'ri-home-smile-line', label: 'Bosh sahifa' },
    { id: 'darslar', icon: 'ri-book-open-line', label: 'Darslar' },
    { id: 'topshiriqlar', icon: 'ri-file-list-3-line', label: 'Topshiriqlar' },
    { id: 'natijalar', icon: 'ri-bar-chart-box-line', label: 'Natijalar' },
    { id: 'profil', icon: 'ri-user-line', label: 'Profil' },
    { id: 'sozlamalar', icon: 'ri-settings-4-line', label: 'Sozlamalar' },
  ];

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu">
      {/* Logo */}
      <div className="app-brand demo">
        <a href="javascript:void(0);" className="app-brand-link">
          <span className="app-brand-text demo menu-text fw-semibold ms-2">
            AYM Platform
          </span>
        </a>

        <a href="javascript:void(0);" className="layout-menu-toggle menu-link text-large ms-auto">
          <i className="ri ri-close-line"></i>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      {/* Menu */}
      <ul className="menu-inner py-1">
        {menuItems.map(item => (
          <li 
            key={item.id} 
            className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
          >
            <a 
              href="javascript:void(0);" 
              className="menu-link"
              onClick={() => onNavigate(item.id)}
            >
              <i className={`menu-icon icon-base ri ${item.icon}`}></i>
              <div>{item.label}</div>
            </a>
          </li>
        ))}

        {/* Logout */}
        <li className="menu-item mt-5">
          <a 
            href="javascript:void(0);" 
            className="menu-link"
            onClick={onLogout}
          >
            <i className="menu-icon icon-base ri ri-logout-box-r-line"></i>
            <div>Chiqish</div>
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;