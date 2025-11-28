import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Target, CheckCircle, XCircle, AlertCircle, Lock, Play, RefreshCw, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../config';


// ==========================================
// ⚙️ SOZLAMALAR (CONFIG)
// ==========================================

function Dashboard({ user = { first_name: 'Jasur', last_name: 'Aliyev' } }) {
    const [quizzes, setQuizzes] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            // API_BASE_URL dan foydalanish
            const response = await fetch(`${API_BASE_URL}/api/quiz`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server xatosi!');
            }

            const data = await response.json();
            if (data.success) {
                setQuizzes(data.data.quizzes);
                setStatistics(data.data.statistics);
            } else {
                throw new Error(data.message || 'Ma\'lumot yuklashda xatolik');
            }
        } catch (err) {
            console.error('Quiz yuklashda xatolik:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getQuizStatus = (quiz) => {
        if (!quiz.attachment) {
            return { text: 'Vaqt belgilanmagan', bgColor: '#6C757D', icon: <Clock className="w-4 h-4" />, canStart: false };
        }
        if (quiz.is_expired) {
            return { text: 'Muddati o\'tgan', bgColor: '#DC3545', icon: <XCircle className="w-4 h-4" />, canStart: false };
        }
        if (quiz.is_upcoming) {
            return { text: 'Yaqinda boshlanadi', bgColor: '#FFC107', icon: <AlertCircle className="w-4 h-4" />, canStart: false };
        }
        if (quiz.attempts.used >= quiz.attempts.total) {
            return { text: 'Urinishlar tugadi', bgColor: '#17A2B8', icon: <Lock className="w-4 h-4" />, canStart: false };
        }
        return { text: 'Mavjud', bgColor: '#28A745', icon: <CheckCircle className="w-4 h-4" />, canStart: true };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5">
                <div className="text-center">
                    <RefreshCw className="w-16 h-16 text-orange-500 mx-auto animate-spin" />
                    <h5 className="mt-5 text-gray-800 font-semibold text-lg">Quizlar yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-5 flex items-center justify-center">
                <div className="max-w-lg w-full bg-white p-8 rounded-2xl border-2 border-red-500 shadow-lg">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h5 className="mt-5 text-red-500 font-bold text-xl">Xatolik yuz berdi!</h5>
                        <p className="text-gray-600 mt-3">{error}</p>
                        <button
                            onClick={fetchQuizzes}
                            className="mt-6 px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Qayta yuklash
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border-l-4 border-orange-500">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                Xush kelibsiz, <span className="text-orange-500">{user?.first_name} {user?.last_name}</span>!
                            </h1>
                            <p className="text-gray-600 mt-1">Yangi imkoniyatlarni kashf eting va muvaffaqiyatga erishing</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-orange-500 mb-1">{statistics?.total || 0}</h2>
                        <p className="text-gray-600 text-sm font-medium">Jami Quizlar</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-green-500 mb-1">{statistics?.completed || 0}</h2>
                        <p className="text-gray-600 text-sm font-medium">Topshirilgan</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-yellow-500 mb-1">
                            {(statistics?.total || 0) - (statistics?.completed || 0)}
                        </h2>
                        <p className="text-gray-600 text-sm font-medium">Kutilmoqda</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-orange-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-orange-500 mb-1">
                            {statistics?.total ? Math.round((statistics.completed / statistics.total) * 100) : 0}%
                        </h2>
                        <p className="text-gray-600 text-sm font-medium">Muvaffaqiyat</p>
                    </div>
                </div>

                {/* Quizzes Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-white border-t-4 border-orange-500 p-5 flex justify-between items-center flex-wrap gap-4 shadow-sm">
                        <h5 className="text-gray-900 font-bold text-lg lg:text-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            Mavjud Quizlar
                        </h5>
                        <button
                            onClick={fetchQuizzes}
                            className="px-5 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Yangilash
                        </button>
                    </div>

                    <div className="p-5">
                        {quizzes.length === 0 ? (
                            <div className="text-center py-16">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h5 className="text-gray-400 font-semibold text-lg">Hozircha quizlar mavjud emas</h5>
                                <p className="text-gray-400 text-sm mt-2">Yangi quizlar qo'shilganida bu yerda ko'rinadi</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quiz nomi</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fan</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sinf</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sana</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vaqt</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Urinishlar</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {quizzes.map(quiz => {
                                                const status = getQuizStatus(quiz);
                                                return (
                                                    <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                                                                    <BookOpen className="w-5 h-5 text-white" />
                                                                </div>
                                                                <span className="font-semibold text-gray-900">{quiz.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="px-3 py-1 rounded-lg bg-cyan-100 text-cyan-700 text-sm font-medium">
                                                                {quiz.subject.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-600 font-medium">{quiz.class}</td>
                                                        <td className="px-4 py-4 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                {quiz.attachment ? quiz.attachment.date : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                {quiz.attachment ? quiz.attachment.time : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`px-3 py-1 rounded-lg font-bold text-sm ${quiz.attempts.used >= quiz.attempts.total
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {quiz.attempts.used}/{quiz.attempts.total}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span
                                                                className="px-3 py-1 rounded-lg text-white text-sm font-medium flex items-center gap-2 w-fit"
                                                                style={{ backgroundColor: status.bgColor }}
                                                            >
                                                                {status.icon}
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <button
                                                                disabled={!status.canStart}
                                                                onClick={() => {
                                                                    if (status.canStart) {
                                                                        console.log(window.location.href = `#/quiz/${quiz.subject.id}/${quiz.id}`);
                                                                        
                                                                        window.location.href = `#quiz/${quiz.subject.id}/${quiz.id}`;
                                                                    }
                                                                }}
                                                                className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${status.canStart
                                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {status.canStart ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                                {status.canStart ? 'Boshlash' : 'Bloklangan'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {quizzes.map(quiz => {
                                        const status = getQuizStatus(quiz);
                                        return (
                                            <div
                                                key={quiz.id}
                                                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 truncate">{quiz.name}</h3>
                                                        <p className="text-sm text-gray-600">{quiz.class}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-3 space-y-3 mb-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium">Fan:</span>
                                                        <span className="px-3 py-1 rounded-lg bg-cyan-100 text-cyan-700 text-xs font-medium">
                                                            {quiz.subject.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            Sana:
                                                        </span>
                                                        <span className="text-sm text-gray-900 font-semibold">
                                                            {quiz.attachment ? quiz.attachment.date : '-'}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            Vaqt:
                                                        </span>
                                                        <span className="text-sm text-gray-900 font-semibold">
                                                            {quiz.attachment ? quiz.attachment.time : '-'}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                                            <Target className="w-4 h-4" />
                                                            Urinishlar:
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-lg font-bold text-sm ${quiz.attempts.used >= quiz.attempts.total
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {quiz.attempts.used}/{quiz.attempts.total}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium">Status:</span>
                                                        <span
                                                            className="px-3 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-2"
                                                            style={{ backgroundColor: status.bgColor }}
                                                        >
                                                            {status.icon}
                                                            {status.text}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    disabled={!status.canStart}
                                                    onClick={() => {
                                                        if (status.canStart) {
                                                            window.location.href = `#quiz/${quiz.subject.id}/${quiz.id}`;
                                                        }
                                                    }}
                                                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${status.canStart
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {status.canStart ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                                    {status.canStart ? 'Boshlash' : 'Bloklangan'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;