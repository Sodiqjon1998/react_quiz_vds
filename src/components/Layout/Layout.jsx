import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Darslar from '../Pages/Darslar';
import Topshiriqlar from '../Pages/Topshiriqlar';
import Dashboard from '../Dashboard/Dashboard';


function Layout({ user, onLogout }) {
    const [currentPage, setCurrentPage] = useState('dashboard');

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
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-700">
                                Salom, <strong>{user?.username || 'User'}</strong>!
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default Layout;