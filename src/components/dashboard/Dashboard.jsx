// Dashboard Component
function Dashboard({ user, onLogout }) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">
                            Salom, <strong>{user.username || user.name}</strong>!
                        </span>
                        <button
                            onClick={onLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Xush kelibsiz! 🎉
                    </h2>
                    <p className="text-gray-600">
                        Siz muvaffaqiyatli tizimga kirdingiz.
                    </p>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Foydalanuvchi ma'lumotlari
                    </h3>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <strong>Username:</strong> {user.username || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <strong>Email:</strong> {user.email || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <strong>Role:</strong> {user.role || 'User'}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="text-blue-900 font-semibold mb-2">Darslar</h4>
                        <p className="text-3xl font-bold text-blue-700">12</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h4 className="text-green-900 font-semibold mb-2">Topshiriqlar</h4>
                        <p className="text-3xl font-bold text-green-700">8</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h4 className="text-purple-900 font-semibold mb-2">Natijalar</h4>
                        <p className="text-3xl font-bold text-purple-700">95%</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;