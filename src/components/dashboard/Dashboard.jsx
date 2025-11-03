function Dashboard({ user }) {
    return (
        <div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
                <h2 className="text-3xl font-bold mb-2">
                    Xush kelibsiz! 🎉
                </h2>
                <p className="text-blue-100 text-lg">
                    Siz muvaffaqiyatli tizimga kirdingiz.
                </p>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Foydalanuvchi ma'lumotlari
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Username</p>
                        <p className="font-semibold text-gray-900">{user?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Role</p>
                        <p className="font-semibold text-gray-900">{user?.role || 'User'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <p className="font-semibold text-green-600">Active</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-700 font-semibold">Darslar</h4>
                        <span className="text-3xl">📚</span>
                    </div>
                    <p className="text-4xl font-bold text-blue-600">12</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-700 font-semibold">Topshiriqlar</h4>
                        <span className="text-3xl">✍️</span>
                    </div>
                    <p className="text-4xl font-bold text-green-600">8</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-700 font-semibold">Natijalar</h4>
                        <span className="text-3xl">🎯</span>
                    </div>
                    <p className="text-4xl font-bold text-purple-600">95%</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;