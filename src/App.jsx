import React from 'react'
import { useState, useEffect } from 'react'
import Login from './Components/Login/Login'
import Layout from './Components/Layout/Layout'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        // Foydalanuvchi tizimda bo'lsa, Layout wrapperlari kerak
        <div className="layout-wrapper layout-content-navbar">
          <div className="layout-container">
            <Layout user={user} onLogout={handleLogout} />
          </div>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>

  );
}

export default App;