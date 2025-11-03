import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../Dashboard/Dashboard';
import Darslar from '../Pages/Darslar';
import Topshiriqlar from '../Pages/Topshiriqlar';

function Layout({ user, onLogout }) {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ← YANGI

    // Mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Sahifa o'zgarganda mobile menu yopiladi
    const handleNavigate = (page) => {
        setCurrentPage(page);
        setIsMobileMenuOpen(false); // Mobile menu yopish
    };

    // Sahifa render qilish
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard user={user} />;
            case 'darslar':
                return <Darslar />;
            case 'topshiriqlar':
                return <Topshiriqlar />;
            default:
                return <Dashboard user={user} />;
        }
    };

    return (
        <>
            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onLogout={onLogout}
                isMobileMenuOpen={isMobileMenuOpen}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />

            {/* Overlay (mobile menu ochiq bo'lsa) */}
            {isMobileMenuOpen && (
                <div 
                    className="layout-overlay layout-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className="layout-page">
                {/* Navbar */}
                <Navbar 
                    user={user} 
                    onLogout={onLogout}
                    onToggleMobileMenu={toggleMobileMenu}
                />

                {/* Content wrapper */}
                <div className="content-wrapper">
                    <div className="container-xxl flex-grow-1 container-p-y">
                        {renderPage()}
                    </div>

                    {/* Footer */}
                    <footer className="content-footer footer bg-footer-theme">
                        <div className="container-xxl">
                            <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
                                <div className="mb-2 mb-md-0">
                                    © 2024, made with ❤️ by <strong>Andijon Yuksalish Maktabi</strong>
                                </div>
                            </div>
                        </div>
                    </footer>

                    <div className="content-backdrop fade"></div>
                </div>
            </div>
        </>
    );
}

export default Layout;