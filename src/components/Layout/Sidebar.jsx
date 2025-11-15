import React from 'react';

function Sidebar({ currentPage, onNavigate, onLogout, isMobileMenuOpen, onCloseMobileMenu }) {
  const menuItems = [
    { id: 'dashboard', icon: 'ri-home-smile-line', label: 'Bosh sahifa' },
    { id: 'darslar', icon: 'ri-book-open-line', label: 'Darslar' },
    { id: 'topshiriqlar', icon: 'ri-file-list-3-line', label: 'Topshiriqlar' },
    { id: 'kitobxonlik', icon: 'ri-mic-line', label: 'Kitobxonlik' },
    { id: 'vazifalar', icon: 'ri-task-line', label: 'Kunlik vazifalar' },
    { id: 'quiz', icon: 'ri-file-list-3-line', label: 'Quiz' },
    { id: 'natijalar', icon: 'ri-bar-chart-box-line', label: 'Natijalar' },
    { id: 'profil', icon: 'ri-user-line', label: 'Profil' },
    { id: 'sozlamalar', icon: 'ri-settings-4-line', label: 'Sozlamalar' },
  ];

  return (
    <aside 
      id="layout-menu" 
      className={`layout-menu menu-vertical menu bg-menu-theme ${isMobileMenuOpen ? 'show' : ''}`}
    >
      {/* Logo */}
      <div className="app-brand demo">
        <a href="/" className="app-brand-link">
          <span className="app-brand-text demo menu-text fw-semibold ms-2">
            AYM Platform
          </span>
        </a>

        {/* Close button (faqat mobile da ko'rinadi) */}
        <a 
          href="#" 
          className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
          onClick={(e) => {
            e.preventDefault();
            onCloseMobileMenu();
          }}
        >
          <i className="icon-base ri ri-close-line icon-22px"></i>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      {/* Menu Items */}
      <ul className="menu-inner py-1">
        {menuItems.map(item => (
          <li 
            key={item.id} 
            className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
          >
            <a 
              href="#" 
              className="menu-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
              <i className={`menu-icon icon-base ri ${item.icon} icon-22px`}></i>
              <div className="text-truncate">{item.label}</div>
            </a>
          </li>
        ))}

        {/* Logout */}
        <li className="menu-item mt-5">
          <a 
            href="#" 
            className="menu-link text-danger"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
          >
            <i className="menu-icon icon-base ri ri-logout-box-r-line icon-22px"></i>
            <div className="text-truncate">Chiqish</div>
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;