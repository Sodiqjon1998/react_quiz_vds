import React from 'react';

function Navbar({ user, onLogout, onToggleMobileMenu }) {
    return (
        <nav className="layout-navbar container-xxl navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
            {/* Mobile menu toggle */}
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
                <a 
                    className="nav-item nav-link px-0 me-xl-6" 
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleMobileMenu(); // ← YANGI
                    }}
                >
                    <i className="icon-base ri ri-menu-line icon-22px"></i>
                </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center justify-content-end" id="navbar-collapse">
                {/* Search */}
                <div className="navbar-nav align-items-center">
                    <div className="nav-item navbar-search-wrapper mb-0">
                        <a className="nav-item nav-link search-toggler px-0" href="#">
                            <span className="d-inline-block text-body-secondary fw-normal">Qidirish...</span>
                        </a>
                    </div>
                </div>

                <ul className="navbar-nav flex-row align-items-center ms-md-auto">
                    {/* User Dropdown */}
                    <li className="nav-item navbar-dropdown dropdown-user dropdown">
                        <a className="nav-link dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
                            <div className="avatar avatar-online">
                                <span className="avatar-initial rounded-circle bg-label-primary">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end mt-3 py-2">
                            <li>
                                <a className="dropdown-item" href="#">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-2">
                                            <div className="avatar avatar-online">
                                                <span className="avatar-initial rounded-circle bg-label-primary">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-0 small">{user?.name || 'User'}</h6>
                                            <small className="text-body-secondary">{user?.role || 'Student'}</small>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li><div className="dropdown-divider"></div></li>
                            <li>
                                <a className="dropdown-item" href="#">
                                    <i className="icon-base ri ri-user-3-line icon-22px me-3"></i>
                                    <span className="align-middle">Profil</span>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="#">
                                    <i className="icon-base ri ri-settings-4-line icon-22px me-3"></i>
                                    <span className="align-middle">Sozlamalar</span>
                                </a>
                            </li>
                            <li><div className="dropdown-divider"></div></li>
                            <li>
                                <div className="d-grid px-4 pt-2 pb-1">
                                    <button
                                        className="btn btn-sm btn-danger d-flex"
                                        onClick={onLogout}
                                    >
                                        <small className="align-middle">Chiqish</small>
                                        <i className="icon-base ri ri-logout-box-r-line ms-2 icon-16px"></i>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;