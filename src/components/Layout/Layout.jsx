import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../Dashboard/Dashboard';
import Darslar from '../Pages/Darslar';
import Topshiriqlar from '../Pages/Topshiriqlar';
import QuizPage from '../Quiz/QuizPage';
import Kitobxonlik from '../Pages/Kitobxonlik';
import KunlikVazifalar from '../Pages/KunlikVazifalar';
import Profile from '../Pages/Profile';

function Layout({ user, onLogout }) {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [quizParams, setQuizParams] = useState(null);

    // Body class boshqarish (menu ochiq/yopiq)
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('layout-menu-expanded');
        } else {
            document.body.classList.remove('layout-menu-expanded');
        }
    }, [isMobileMenuOpen]);

    // URL hash orqali navigatsiya
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1); // "#" ni olib tashlash
            console.log('Current hash:', hash); // DEBUG

            if (hash.startsWith('quiz/')) {
                const parts = hash.split('/');
                console.log('Hash parts:', parts); // DEBUG

                if (parts.length === 3) {
                    const [_, subjectId, quizId] = parts;
                    console.log('Parsed params:', { subjectId, quizId }); // DEBUG

                    setQuizParams({ subjectId, quizId });
                    setCurrentPage('quiz');
                }
            } else if (hash) {
                setCurrentPage(hash);
            } else {
                setCurrentPage('dashboard');
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavigate = (page) => {
        window.location.hash = page;
        setIsMobileMenuOpen(false);
    };

    const handleQuizBack = () => {
        window.location.hash = 'dashboard';
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard user={user} />;
            case 'darslar':
                return <Darslar />;
            case 'topshiriqlar':
                return <Topshiriqlar />;
            case 'kitobxonlik':
                return <Kitobxonlik />;
            case 'vazifalar':
                return <KunlikVazifalar />;
            case 'quiz':
                return quizParams ? (
                    <QuizPage
                        quizId={quizParams.quizId}
                        subjectId={quizParams.subjectId}
                        onBack={handleQuizBack}
                    />
                ) : (
                    <Dashboard user={user} />
                );
            case 'profil':
                return <Profile />;
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

            {/* Layout Overlay - menu ochiq bo'lsa ko'rinadi */}
            <div
                className={`layout-overlay ${isMobileMenuOpen ? 'layout-overlay-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Main Content */}
            <div className="layout-page">
                <Navbar
                    user={user}
                    onLogout={onLogout}
                    onToggleMobileMenu={toggleMobileMenu}
                />

                <div className="content-wrapper">
                    <div className="container-xxl flex-grow-1 container-p-y">
                        {renderPage()}
                    </div>

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