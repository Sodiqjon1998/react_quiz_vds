import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

function Login({ onLoginSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ 1-QADAM: CSRF cookie olish
            await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
                method: 'GET',
                credentials: 'include', // ✅ MUHIM: Cookie almashish uchun
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('✅ CSRF cookie olindi');

            // ✅ 2-QADAM: Login so'rovi
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                credentials: 'include', // ✅ MUHIM: Session cookie yuborish uchun
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // ✅ Laravel uchun muhim
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();
            console.log('📥 Login response:', data);

            if (data.token && data.user) {
                // localStorage ga saqlash
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                console.log('✅ Login muvaffaqiyatli:', data.user.name);

                // Parent componentga yuborish
                if (onLoginSuccess) {
                    onLoginSuccess(data.token, data.user);
                }
            } else {
                setError(data.message || 'Login yoki parol noto\'g\'ri!');
            }
        } catch (err) {
            console.error('❌ Login Error:', err);
            setError('Server bilan bog\'lanishda xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3 transition-transform hover:rotate-0">
                        <LogIn className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Xush kelibsiz! 👋</h2>
                    <p className="text-gray-500 font-medium">Andijon Yuksalish Maktabi</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block ml-1">Login</label>
                        <div className="relative group">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400 font-medium"
                                placeholder="Loginingizni kiriting"
                                required
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block ml-1">Parol</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 pl-11 pr-11 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400 font-medium"
                                placeholder="Parolingizni kiriting"
                                required
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group select-none">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 rounded transition-colors peer-checked:bg-orange-500 peer-checked:border-orange-500 peer-focus:ring-2 peer-focus:ring-orange-200"></div>
                                <svg
                                    className="absolute w-3 h-3 text-white hidden peer-checked:block left-1 top-1 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">Eslab qolish</span>
                        </label>
                        <button type="button" className="text-sm font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                            Parolni unutdingizmi?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Kirilmoqda...
                            </>
                        ) : (
                            <>
                                Tizimga kirish
                                <LogIn className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Akkauntingiz yo'qmi?{' '}
                        <button type="button" className="font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                            Ro'yxatdan o'tish
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;