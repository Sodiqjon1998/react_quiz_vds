import { useState, useEffect } from 'react';

function KunlikVazifalar() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [userName, setUserName] = useState('');
    const [savingTaskId, setSavingTaskId] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState({});
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState('boy');
    const [isSending, setIsSending] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const boyEmojis = ['⚽', '🏀', '🏈', '⚾', '🎮', '🚀', '🚗', '✈️', '🦖', '🦁', '🐯', '🤖', '👾', '🎯', '🏆', '⭐', '🔥', '💪', '🎸', '🥇'];
    const girlEmojis = ['🌸', '🌺', '🌷', '🦋', '🎀', '👑', '💝', '🧸', '🎨', '🌈', '⭐', '✨', '💖', '🦄', '🌟', '🎵', '🍓', '🍰', '🌼', '💐'];

    // Telegram bot token - BARCHA SINFLAR UCHUN BITTA BOT
    const TELEGRAM_BOT_TOKEN = '7592801638:AAEClfSkBNUweKdfJkB7_C2zfrOmOKc20r4';

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserProfile(user);

                if (!userName && user.first_name && user.last_name) {
                    setUserName(`${user.first_name} ${user.last_name}`);
                } else if (!userName && user.name) {
                    setUserName(user.name);
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
            console.error('Sinf ma\'lumoti topilmadi!');
            alert('❌ Xatolik: Sinf ma\'lumoti topilmadi! Iltimos, qaytadan login qiling.');
            return false;
        }

        const CHAT_ID = classInfo.telegram_chat_id;
        const TOPIC_ID = classInfo.telegram_topic_id;

        if (!CHAT_ID) {
            console.error(`"${classInfo.name}" sinfi uchun Telegram chat ID sozlanmagan!`);
            alert(`❌ Xatolik: "${classInfo.name}" sinfi uchun Telegram guruh ID topilmadi!\n\nIltimos, administratorga murojaat qiling.`);
            return false;
        }

        const completedCount = tasksData.filter(t => t.is_completed === true).length;
        const totalTasks = tasksData.length;

        const completedTasks = tasksData
            .filter(t => t.is_completed === true)
            .map(t => `✅ ${t.emoji} ${t.name}`)
            .join('\n');

        const notCompletedTasks = tasksData
            .filter(t => t.is_completed === false)
            .map(t => `❌ ${t.emoji} ${t.name}`)
            .join('\n');

        const date = new Date(selectedDate).toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
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

            const payload = {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            };

            if (TOPIC_ID && TOPIC_ID !== '0' && TOPIC_ID !== 0) {
                payload.message_thread_id = parseInt(TOPIC_ID);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!data.ok) {
                console.error('Telegram API xato:', data);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Telegram yuborishda xato:', error);
            return false;
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (token) {
                const response = await fetch(
                    `https://quizvds-production.up.railway.app/api/tasks?date=${selectedDate}`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
                );

                const data = await response.json();
                if (data.success) {
                    setTasks(data.data.tasks);
                }
            } else {
                setTasks([
                    { id: 1, name: 'Erta uyg\'onish', emoji: '🌅', is_completed: null },
                    { id: 2, name: 'Jismoniy tarbiya', emoji: '🏃', is_completed: null },
                    { id: 3, name: 'Nonushtaga yordam', emoji: '🍳', is_completed: null },
                    { id: 4, name: 'Xonani tartiblash', emoji: '🏠', is_completed: null },
                    { id: 5, name: 'Duo qilish', emoji: '🤲', is_completed: null },
                    { id: 6, name: 'Mehr berish', emoji: '❤️', is_completed: null },
                    { id: 7, name: 'Kitob o\'qish', emoji: '📚', is_completed: null },
                    { id: 8, name: 'Uy ishlariga yordam', emoji: '🏠', is_completed: null },
                    { id: 9, name: '5 ta inglizcha so\'z', emoji: '🔤', is_completed: null },
                    { id: 10, name: 'Oyoq kiyim tozalash', emoji: '👟', is_completed: null }
                ]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
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
                `https://quizvds-production.up.railway.app/api/stats/monthly?year=${year}&month=${month}`,
                { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
            );

            const data = await response.json();
            if (data.success) {
                setMonthlyStats(data.data);
            }
        } catch (err) {
            console.error('Stats error:', err);
        }
    };

    const toggleTaskStatus = async (taskId, newStatus) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, is_completed: newStatus } : task
            )
        );

        try {
            setSavingTaskId(taskId);
            const token = localStorage.getItem('token');

            if (token) {
                const response = await fetch(`https://quizvds-production.up.railway.app/api/tasks/${taskId}/toggle`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: selectedDate,
                        is_completed: newStatus
                    })
                });

                if (!response.ok) {
                    console.error('Server error:', await response.text());
                }
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
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];
        const today = new Date().toISOString().split('T')[0];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '8px' }}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasReport = monthlyStats[dateStr] || false;
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            const isFuture = dateStr > today;
            const isDisabled = isPast || isFuture;

            days.push(
                <div
                    key={day}
                    onClick={() => {
                        if (!isDisabled) {
                            setSelectedDate(dateStr);
                            setShowCalendar(false);
                        }
                    }}
                    style={{
                        padding: '8px',
                        textAlign: 'center',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        borderRadius: '8px',
                        background: isDisabled ? '#fafafa' :
                            hasReport ? '#333' :
                                isToday ? '#666' : 'white',
                        color: isDisabled ? '#ccc' : (hasReport || isToday ? 'white' : '#333'),
                        fontWeight: hasReport || isToday ? '600' : '400',
                        border: '1px solid ' + (isDisabled ? '#f0f0f0' : hasReport ? '#333' : isToday ? '#666' : '#e5e7eb'),
                        opacity: isDisabled ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        boxShadow: (hasReport || isToday) && !isDisabled ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                >
                    {day}
                    {hasReport && <div style={{ fontSize: '8px', marginTop: '2px' }}>✓</div>}
                </div>
            );
        }

        return days;
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #333',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <h5 style={{ color: '#333', margin: 0 }}>Yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            padding: '15px',
            paddingBottom: '30px',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    marginBottom: '15px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        color: '#333',
                        fontWeight: '700',
                        fontSize: '1.75rem',
                        marginBottom: '8px'
                    }}>
                        Kunlik Vazifalar
                    </h1>
                    <p style={{ color: '#666', marginBottom: '5px', fontSize: '14px' }}>
                        Bugungi vazifalari bajarishini belgilang
                    </p>

                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        {userProfile?.class?.name && (
                            <div style={{
                                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                color: 'white',
                                fontWeight: '600',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🏫 {userProfile.class.name}
                            </div>
                        )}

                        <p style={{
                            color: '#333',
                            fontWeight: '600',
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            {new Date(selectedDate).toLocaleDateString('uz-UZ', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                weekday: 'long'
                            })}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{
                            marginTop: '12px',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: '2px solid #333',
                            background: 'white',
                            color: '#333',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        📅 Kalendar ko'rish
                    </button>
                </div>

                {showCalendar && (
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        marginBottom: '15px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px',
                            gap: '10px'
                        }}>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    background: 'white',
                                    color: '#333',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    minWidth: '40px',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                ←
                            </button>
                            <h3 style={{
                                margin: 0,
                                color: '#333',
                                fontSize: '1rem',
                                textAlign: 'center',
                                flex: 1
                            }}>
                                {currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    background: 'white',
                                    color: '#333',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    minWidth: '40px',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                →
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
                                <div key={day} style={{
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: '#333',
                                    padding: '6px',
                                    fontSize: '13px'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '8px'
                        }}>
                            {renderCalendar()}
                        </div>

                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                            <div>⚫ Qora: Yuborilgan kunlar</div>
                            <div>⚪ Kulrang: Bugungi kun (faqat bugun kiritish mumkin)</div>
                            <div>⚪ Och kulrang: O'tgan va kelguvchi kunlar</div>
                        </div>
                    </div>
                )}

                <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    marginBottom: '15px',
                    position: 'relative'
                }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Ismingizni kiriting..."
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 50px 12px 15px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                fontSize: '15px',
                                background: 'white',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#f5f5f5',
                                border: 'none',
                                borderRadius: '8px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '20px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#e5e5e5'}
                            onMouseLeave={(e) => e.target.style.background = '#f5f5f5'}
                        >
                            😊
                        </button>
                    </div>

                    {showEmojiPicker && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: '15px',
                            marginTop: '8px',
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            width: '240px'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '12px',
                                borderBottom: '2px solid #f0f0f0',
                                paddingBottom: '8px'
                            }}>
                                <button
                                    onClick={() => setEmojiCategory('boy')}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: emojiCategory === 'boy' ? '#333' : '#f5f5f5',
                                        color: emojiCategory === 'boy' ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    👦 O'g'il bola
                                </button>
                                <button
                                    onClick={() => setEmojiCategory('girl')}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: emojiCategory === 'girl' ? '#333' : '#f5f5f5',
                                        color: emojiCategory === 'girl' ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    👧 Qiz bola
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '8px'
                            }}>
                                {(emojiCategory === 'boy' ? boyEmojis : girlEmojis).map((emoji, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setUserName(userName + emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        style={{
                                            background: '#f5f5f5',
                                            border: 'none',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '22px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#e5e5e5';
                                            e.target.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = '#f5f5f5';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                    marginBottom: '15px'
                }}>
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '16px',
                                padding: '18px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '15px',
                                gap: '12px'
                            }}>
                                <div style={{
                                    background: '#333',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    flexShrink: 0,
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    flexGrow: 1,
                                    fontSize: '14px'
                                }}>
                                    <span style={{ marginRight: '6px' }}>{task.emoji}</span>
                                    {task.name}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '15px'
                            }}>
                                <div>
                                    <input
                                        type="radio"
                                        name={`task-${task.id}`}
                                        id={`yes-${task.id}`}
                                        checked={task.is_completed === true}
                                        onChange={() => toggleTaskStatus(task.id, true)}
                                        style={{ display: 'none' }}
                                    />
                                    <label
                                        htmlFor={`yes-${task.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '55px',
                                            height: '55px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '22px',
                                            border: '3px solid #10b981',
                                            background: task.is_completed === true ? '#10b981' : 'white',
                                            color: task.is_completed === true ? 'white' : '#10b981',
                                            boxShadow: task.is_completed === true ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                                            transform: task.is_completed === true ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        ✅
                                    </label>
                                </div>

                                <div>
                                    <input
                                        type="radio"
                                        name={`task-${task.id}`}
                                        id={`no-${task.id}`}
                                        checked={task.is_completed === false}
                                        onChange={() => toggleTaskStatus(task.id, false)}
                                        style={{ display: 'none' }}
                                    />
                                    <label
                                        htmlFor={`no-${task.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '55px',
                                            height: '55px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '22px',
                                            border: '3px solid #ef4444',
                                            background: task.is_completed === false ? '#ef4444' : 'white',
                                            color: task.is_completed === false ? 'white' : '#ef4444',
                                            boxShadow: task.is_completed === false ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                                            transform: task.is_completed === false ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        ❌
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={async () => {
                        if (!userName.trim()) {
                            alert('Iltimos, ismingizni kiriting!');
                            return;
                        }

                        const incompleteTasks = tasks.filter(t => t.is_completed === null);
                        if (incompleteTasks.length > 0) {
                            alert('Iltimos, barcha vazifalar uchun javob tanlang!');
                            return;
                        }

                        setIsSending(true);

                        const telegramSuccess = await sendToTelegram(userName, tasks);

                        setIsSending(false);

                        if (telegramSuccess) {
                            alert('✅ Muvaffaqiyatli yuborildi!\n\n📨 Telegramga ham xabar yuborildi!\n🏫 Sinf: ' + (userProfile?.class?.name || 'Noma\'lum'));
                        } else {
                            alert('⚠️ Ma\'lumot saqlandi!\n\n❌ Telegram xabari yuborilmadi.\nIltimos, administratorga murojaat qiling.');
                        }

                        fetchMonthlyStats();
                    }}
                    disabled={isSending}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '12px',
                        background: isSending ? '#999' : '#333',
                        color: 'white',
                        cursor: isSending ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s ease',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {isSending ? (
                        <>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            Yuborilmoqda...
                        </>
                    ) : (
                        <>📨 Yuborish</>
                    )}
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @media (max-width: 640px) {
                    body {
                        font-size: 14px;
                    }
                }
            `}</style>
        </div>
    );
}

export default KunlikVazifalar;