import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';

function Navbar({ user, onLogout, onToggleMobileMenu }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Dropdown tashqarisiga bosilganda yopish
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
            {/* Left Side: Mobile Toggle & Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleMobileMenu();
                    }}
                    className="xl:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Bar (Desktop) */}
                <div className="relative hidden md:block w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder-gray-400"
                        placeholder="Qidirish..."
                    />
                </div>
            </div>

            {/* Right Side: User Profile */}
            <div className="flex items-center gap-4">
                {/* Search Button (Mobile only) */}
                <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Search className="w-5 h-5" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 outline-none"
                    >
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-semibold text-gray-700 leading-none mb-0.5">
                                {user?.name || 'Foydalanuvchi'}
                            </p>
                            <p className="text-[11px] text-gray-500 leading-none font-medium uppercase tracking-wide">
                                {user?.role || 'O\'quvchi'}
                            </p>
                        </div>

                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden lg:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 origin-top-right">
                            {/* Mobile User Info inside Dropdown */}
                            <div className="px-4 py-3 border-b border-gray-50 lg:hidden bg-gray-50/50 mx-2 rounded-lg mb-1">
                                <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.role || 'Student'}</p>
                            </div>

                            <div className="py-1 px-1">
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors mx-1">
                                    <User className="w-4 h-4" />
                                    Profil
                                </a>
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors mx-1">
                                    <Settings className="w-4 h-4" />
                                    Sozlamalar
                                </a>
                            </div>

                            <div className="border-t border-gray-100 my-1"></div>

                            <div className="px-1">
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-left mx-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Chiqish
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;