import { useState, useEffect } from 'react';
import {
    BookOpen, Calendar, Clock, Upload, Mic, Play, Square, RefreshCw,
    TrendingUp, CheckCircle, XCircle, AlertCircle, HardDrive, Sun,
    Activity, Coffee, Home, Heart, Smile, GraduationCap, Sparkles,
    LayoutGrid, User, Send, Star, Trophy, Zap, Award, Crown
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

// ==========================================
// ⚙️ SOZLAMALAR (CONFIG)
// ==========================================

function KunlikVazifalar() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [userName, setUserName] = useState('');
    const [savingTaskId, setSavingTaskId] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState({});
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isSending, setIsSending] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [showIconPicker, setShowIconPicker] = useState(false);

    // Telegram bot token
    const TELEGRAM_BOT_TOKEN = '7592801638:AAEClfSkBNUweKdfJkB7_C2zfrOmOKc20r4';

    // Vazifa nomiga qarab ikonka tanlash
    const getTaskIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('uyg\'onish')) return <Sun className="w-6 h-6 text-orange-500" />;
        if (lowerName.includes('jismoniy') || lowerName.includes('sport')) return <Activity className="w-6 h-6 text-blue-500" />;
        if (lowerName.includes('nonushta') || lowerName.includes('ovqat')) return <Coffee className="w-6 h-6 text-brown-500" />;
        if (lowerName.includes('xona') || lowerName.includes('uy')) return <Home className="w-6 h-6 text-indigo-500" />;
        if (lowerName.includes('duo')) return <Heart className="w-6 h-6 text-red-500" />;
        if (lowerName.includes('mehr')) return <Smile className="w-6 h-6 text-yellow-500" />;
        if (lowerName.includes('kitob')) return <BookOpen className="w-6 h-6 text-green-500" />;
        if (lowerName.includes('ingliz') || lowerName.includes('so\'z')) return <GraduationCap className="w-6 h-6 text-purple-500" />;
        if (lowerName.includes('oyoq') || lowerName.includes('tozalash')) return <Sparkles className="w-6 h-6 text-cyan-500" />;
        return <LayoutGrid className="w-6 h-6 text-gray-500" />;
    };

    // Foydalanuvchi tanlashi mumkin bo'lgan belgilar
    const userIcons = [
        { icon: <Star className="w-5 h-5" />, label: 'Yulduz' },
        { icon: <Trophy className="w-5 h-5" />, label: 'Kubok' },
        { icon: <Zap className="w-5 h-5" />, label: 'Chaqmoq' },
        { icon: <Award className="w-5 h-5" />, label: 'Medal' },
        { icon: <Crown className="w-5 h-5" />, label: 'Toj' },
        { icon: <Heart className="w-5 h-5" />, label: 'Yurak' },
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserProfile(user);

                if (!userName) {
                    if (user.first_name && user.last_name) {
                        setUserName(`${user.first_name} ${user.last_name}`);
                    } else if (user.name) {
                        setUserName(user.name);
                    }
                }
            } catch (err) {
                console.error('User data parse error:', err);
            }
        }

        fetchTasks();
        fetchMonthlyStats();
    }, [selectedDate]);

    const sendToTelegram = async (studentName, tasksData) => {
        const classInfo = userProfile?.class;

        if (!classInfo) {
            alert('❌ Xatolik: Sinf ma\'lumoti topilmadi! Iltimos, qaytadan login qiling.');
            return false;
        }

        const CHAT_ID = classInfo.telegram_chat_id;
        const TOPIC_ID = classInfo.telegram_topic_id;

        if (!CHAT_ID) {
            alert(`❌ Xatolik: "${classInfo.name}" sinfi uchun Telegram guruh ID topilmadi!`);
            return false;
        }

        const completedCount = tasksData.filter(t => t.is_completed === true).length;
        const totalTasks = tasksData.length;

        const completedTasks = tasksData
            .filter(t => t.is_completed === true)
            .map(t => `✅ ${t.name}`)
            .join('\n');

        const notCompletedTasks = tasksData
            .filter(t => t.is_completed === false)
            .map(t => `❌ ${t.name}`)
            .join('\n');

        const date = new Date(selectedDate).toLocaleDateString('uz-UZ', {
            day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
        });

        const message = `
📊 <b>Kunlik Hisobot</b>

👤 <b>O'quvchi:</b> ${studentName}
🏫 <b>Sinf:</b> ${classInfo.name}
📅 <b>Sana:</b> ${date}

📈 <b>Natija:</b> ${completedCount}/${totalTasks} ✅

${completedTasks ? `<b>✅ Bajarilgan vazifalar:</b>\n${completedTasks}\n` : ''}
${notCompletedTasks ? `\n<b>❌ Bajarilmagan vazifalar:</b>\n${notCompletedTasks}` : ''}

${completedCount === totalTasks ? '🎉 Ajoyib! Barcha vazifalar bajarildi!' : completedCount >= totalTasks * 0.7 ? '👏 Yaxshi natija!' : '💪 Harakat qiling!'}
        `.trim();

        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const payload = { chat_id: CHAT_ID, text: message, parse_mode: 'HTML' };
            if (TOPIC_ID && TOPIC_ID !== '0' && TOPIC_ID !== 0) payload.message_thread_id = parseInt(TOPIC_ID);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return data.ok;
        } catch (error) {
            console.error('Telegram error:', error);
            return false;
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Default tasks
            const defaultTasks = [
                { id: 1, name: 'Erta uyg\'onish', is_completed: null },
                { id: 2, name: 'Jismoniy tarbiya', is_completed: null },
                { id: 3, name: 'Nonushtaga yordam', is_completed: null },
                { id: 4, name: 'Xonani tartiblash', is_completed: null },
                { id: 5, name: 'Duo qilish', is_completed: null },
                { id: 6, name: 'Mehr berish', is_completed: null },
                { id: 7, name: 'Kitob o\'qish', is_completed: null },
                { id: 8, name: 'Uy ishlariga yordam', is_completed: null },
                { id: 9, name: '5 ta inglizcha so\'z', is_completed: null },
                { id: 10, name: 'Oyoq kiyim tozalash', is_completed: null }
            ];

            if (token) {
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/api/tasks?date=${selectedDate}`,
                        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
                    );
                    if (!response.ok) throw new Error('Server error');
                    const data = await response.json();
                    if (data.success && data.data.tasks.length > 0) {
                        setTasks(data.data.tasks);
                    } else {
                        setTasks(defaultTasks);
                    }
                } catch (e) {
                    console.warn("API ishlamadi, default vazifalar yuklanmoqda");
                    setTasks(defaultTasks);
                }
            } else {
                setTasks(defaultTasks);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            const response = await fetch(
                `${API_BASE_URL}/api/stats/monthly?year=${year}&month=${month}`,
                { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
            );
            const data = await response.json();
            if (data.success) setMonthlyStats(data.data);
        } catch (err) {
            console.error('Stats error:', err);
        }
    };

    const toggleTaskStatus = async (taskId, newStatus) => {
        setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, is_completed: newStatus } : task));
        try {
            setSavingTaskId(taskId);
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${API_BASE_URL}/api/tasks/${taskId}/toggle`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ date: selectedDate, is_completed: newStatus })
                });
            }
        } catch (err) {
            console.error('Toggle error:', err);
        } finally {
            setSavingTaskId(null);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5">
                <div className="text-center">
                    <RefreshCw className="w-16 h-16 text-orange-500 mx-auto animate-spin" />
                    <h5 className="mt-5 text-gray-800 font-semibold text-lg">Yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    const completedCount = tasks.filter(t => t.is_completed === true).length;
    const totalTasksCount = tasks.length;
    const progressPercentage = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border-l-4 border-orange-500">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kunlik Vazifalar</h1>
                            <p className="text-gray-600 mt-1">Bugungi vazifalaringizni belgilang va natijalarni kuzating</p>
                        </div>
                        {userProfile?.class?.name && (
                            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                                <Home className="w-5 h-5 text-orange-500" />
                                <span className="font-semibold text-gray-700">{userProfile.class.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <LayoutGrid className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-blue-500 mb-1">{totalTasksCount}</h2>
                        <p className="text-gray-600 text-sm font-medium">Jami vazifalar</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-green-500 mb-1">{completedCount}</h2>
                        <p className="text-gray-600 text-sm font-medium">Bajarildi</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-red-500 mb-1">
                            {tasks.filter(t => t.is_completed === false).length}
                        </h2>
                        <p className="text-gray-600 text-sm font-medium">Bajarilmadi</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-orange-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-orange-500 mb-1">{progressPercentage}%</h2>
                        <p className="text-gray-600 text-sm font-medium">Samaradorlik</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Calendar & User Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Date Selector */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-orange-500">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" />
                                    Kalendar
                                </h3>
                                <button
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="text-sm text-orange-600 font-medium hover:underline"
                                >
                                    {showCalendar ? 'Yashirish' : 'Ko\'rsatish'}
                                </button>
                            </div>

                            <div className="bg-orange-50 rounded-xl p-4 text-center mb-4 border border-orange-100">
                                <p className="text-orange-800 font-bold text-lg capitalize">
                                    {new Date(selectedDate).toLocaleDateString('uz-UZ', {
                                        day: 'numeric', month: 'long', weekday: 'long'
                                    })}
                                </p>
                            </div>

                            {showCalendar && (
                                <div className="animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
                                        <span className="font-bold text-gray-700 capitalize">
                                            {currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
                                            <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {(() => {
                                            const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                                            const days = [];
                                            const today = new Date().toISOString().split('T')[0];

                                            // Adjust starting day (JS Sunday is 0, usually calendar starts Monday)
                                            const adjustStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

                                            for (let i = 0; i < adjustStart; i++) days.push(<div key={`empty-${i}`} />);

                                            for (let day = 1; day <= daysInMonth; day++) {
                                                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const isSelected = dateStr === selectedDate;
                                                const hasReport = monthlyStats[dateStr];
                                                const isToday = dateStr === today;

                                                days.push(
                                                    <button
                                                        key={day}
                                                        onClick={() => { setSelectedDate(dateStr); setShowCalendar(false); }}
                                                        className={`
                                                            h-9 w-9 rounded-lg text-sm font-medium flex items-center justify-center relative transition-all
                                                            ${isSelected ? 'bg-orange-500 text-white shadow-md' :
                                                                hasReport ? 'bg-green-100 text-green-700 border border-green-200' :
                                                                    isToday ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-100 text-gray-600'}
                                                        `}
                                                    >
                                                        {day}
                                                        {hasReport && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></div>}
                                                    </button>
                                                );
                                            }
                                            return days;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Name Input */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                O'quvchi Ismi
                            </h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Ism familiya..."
                                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                />
                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <button
                                    onClick={() => setShowIconPicker(!showIconPicker)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>

                                {showIconPicker && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="grid grid-cols-4 gap-2">
                                            {userIcons.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setUserName(prev => prev + ' ' + (item.label === 'Yulduz' ? '⭐' : item.label === 'Kubok' ? '🏆' : '⚡')); // Oddiyroq qilib qo'shish
                                                        setShowIconPicker(false);
                                                    }}
                                                    className="p-2 hover:bg-orange-50 rounded-lg flex flex-col items-center gap-1 transition-colors"
                                                >
                                                    <div className="text-orange-500">{item.icon}</div>
                                                    <span className="text-[10px] text-gray-500">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tasks List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Vazifalar ro'yxati
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`
                                            relative border rounded-xl p-4 transition-all duration-200 hover:shadow-md
                                            ${task.is_completed === true ? 'bg-green-50 border-green-200' :
                                                task.is_completed === false ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`
                                                p-2 rounded-lg 
                                                ${task.is_completed === true ? 'bg-green-200 text-green-700' :
                                                    task.is_completed === false ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-600'}
                                            `}>
                                                {getTaskIcon(task.name)}
                                            </div>
                                            <span className="font-semibold text-gray-700 flex-1">{task.name}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleTaskStatus(task.id, true)}
                                                className={`
                                                    flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
                                                    ${task.is_completed === true
                                                        ? 'bg-green-500 text-white shadow-green-200 shadow-lg'
                                                        : 'bg-white border border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-500'}
                                                `}
                                            >
                                                <CheckCircle className="w-4 h-4" /> Bajarildi
                                            </button>
                                            <button
                                                onClick={() => toggleTaskStatus(task.id, false)}
                                                className={`
                                                    flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
                                                    ${task.is_completed === false
                                                        ? 'bg-red-500 text-white shadow-red-200 shadow-lg'
                                                        : 'bg-white border border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500'}
                                                `}
                                            >
                                                <XCircle className="w-4 h-4" /> Bajarilmadi
                                            </button>
                                        </div>

                                        {savingTaskId === task.id && (
                                            <div className="absolute top-2 right-2">
                                                <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={async () => {
                                        if (!userName.trim()) { alert('Iltimos, ismingizni kiriting!'); return; }
                                        if (tasks.some(t => t.is_completed === null)) { alert('Iltimos, barcha vazifalarni belgilang!'); return; }

                                        setIsSending(true);
                                        const success = await sendToTelegram(userName, tasks);
                                        setIsSending(false);

                                        if (success) alert('✅ Hisobot muvaffaqiyatli yuborildi!');
                                        else alert('⚠️ Saqlandi, lekin Telegramga yuborilmadi.');

                                        fetchMonthlyStats();
                                    }}
                                    disabled={isSending}
                                    className={`
                                        w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all
                                        ${isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'}
                                    `}
                                >
                                    {isSending ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    {isSending ? 'Yuborilmoqda...' : 'Hisobotni Yuborish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KunlikVazifalar;