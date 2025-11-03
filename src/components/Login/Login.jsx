import React, { useState } from 'react';



// Login Component
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: formData.username,
                password: formData.password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    onLoginSuccess(data.token, data.user);
                } else {
                    setError(data.message || 'Login xatosi!');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Server bilan bog\'lanishda xatolik!');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Andijon Yuksalish Maktabi
                    </h2>
                    <div className="w-16 h-1 bg-blue-600 mx-auto rounded"></div>
                </div>

                <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Welcome! 👋</h3>
                    <p className="text-gray-600 mt-2">Please sign-in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Remember Me</span>
                        </label>
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed font-medium transition-all transform hover:scale-105 active:scale-95"
                    >
                        {loading ? 'Loading...' : 'Sign in'}
                    </button>
                </div>

                <p className="text-center mt-6 text-sm text-gray-600">
                    New on our platform?{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 font-medium transition">
                        Create an account
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;