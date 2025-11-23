import React, { useState } from 'react';

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
                if (data.token && data.user) {
                    // localStorage ga saqlash
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Sinf ma'lumotini tekshirish
                    if (data.user.class) {
                        console.log('User sinfi:', data.user.class.name);
                    } else {
                        console.warn('User sinfi topilmadi!');
                    }
                    
                    // Parent componentga yuborish
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                padding: '40px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '10px'
                    }}>
                        Andijon Yuksalish Maktabi
                    </h2>
                    <div style={{
                        width: '60px',
                        height: '4px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        margin: '0 auto',
                        borderRadius: '2px'
                    }}></div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>
                        Welcome! 👋
                    </h3>
                    <p style={{
                        color: '#6b7280',
                        marginTop: '8px',
                        fontSize: '15px'
                    }}>
                        Please sign-in to your account
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        borderLeft: '4px solid #ef4444',
                        color: '#991b1b',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <p style={{
                            fontWeight: '500',
                            margin: 0
                        }}>
                            ❌ {error}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 45px 12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    padding: '4px',
                                    color: '#6b7280'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}>
                            <input
                                type="checkbox"
                                name="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    marginRight: '8px',
                                    cursor: 'pointer'
                                }}
                            />
                            <span style={{ color: '#374151' }}>Remember Me</span>
                        </label>
                        <button
                            type="button"
                            style={{
                                fontSize: '14px',
                                color: '#667eea',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                    >
                        {loading ? 'Loading...' : 'Sign in'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '25px',
                    fontSize: '14px',
                    color: '#6b7280'
                }}>
                    New on our platform?{' '}
                    <button
                        type="button"
                        style={{
                            color: '#667eea',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;