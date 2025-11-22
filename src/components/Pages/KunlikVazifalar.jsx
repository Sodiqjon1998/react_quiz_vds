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

    useEffect(() => {
        fetchTasks();
        fetchMonthlyStats();
    }, [selectedDate]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (token) {
                const response = await fetch(
                    `http://localhost:8000/api/tasks?date=${selectedDate}`,
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
                `http://localhost:8000/api/stats/monthly?year=${year}&month=${month}`,
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
                const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/toggle`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: selectedDate,
                        is_completed: newStatus  // BU MUHIM!
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

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '10px' }}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasReport = monthlyStats[dateStr] || false;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            days.push(
                <div
                    key={day}
                    onClick={() => {
                        setSelectedDate(dateStr);
                        setShowCalendar(false);
                    }}
                    style={{
                        padding: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        background: hasReport ? 'linear-gradient(45deg, #28a745, #20c997)' :
                            isToday ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white',
                        color: hasReport || isToday ? 'white' : '#333',
                        fontWeight: hasReport || isToday ? '600' : '400',
                        border: '2px solid ' + (hasReport ? '#28a745' : isToday ? '#667eea' : '#e1e5e9'),
                        transition: 'all 0.3s ease'
                    }}
                >
                    {day}
                    {hasReport && <div style={{ fontSize: '10px', marginTop: '2px' }}>✓</div>}
                </div>
            );
        }

        return days;
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <h5 style={{ color: 'white' }}>Yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            paddingBottom: '40px',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '30px',
                    borderRadius: '25px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700',
                        fontSize: '2.2rem',
                        marginBottom: '10px'
                    }}>
                        Kunlik Vazifalar
                    </h1>
                    <p style={{ color: '#666', margin: 0 }}>Bugungi vazifalari bajarishini belgilang</p>

                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: '2px solid #667eea',
                            background: 'white',
                            color: '#667eea',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        📅 Kalendar ko'rish
                    </button>
                </div>

                {showCalendar && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        padding: '30px',
                        borderRadius: '25px',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    border: '2px solid #667eea',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                ←
                            </button>
                            <h3 style={{ margin: 0, color: '#667eea' }}>
                                {currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    border: '2px solid #667eea',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                →
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
                                <div key={day} style={{ textAlign: 'center', fontWeight: '600', color: '#667eea', padding: '8px' }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                            {renderCalendar()}
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                            <div>🟢 Yashil: Yuborilgan kunlar</div>
                            <div>🔵 Ko'k: Bugungi kun</div>
                        </div>
                    </div>
                )}

                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '20px',
                    borderRadius: '25px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
                    marginBottom: '20px'
                }}>
                    <input
                        type="text"
                        placeholder="Ismingizni kiriting..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '15px',
                            fontSize: '16px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                                border: '2px solid rgba(102, 126, 234, 0.1)',
                                borderRadius: '20px',
                                padding: '25px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    color: 'white',
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    marginRight: '15px',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    flexShrink: 0
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ fontWeight: '600', color: '#333', flexGrow: 1, fontSize: '15px' }}>
                                    {task.emoji} {task.name}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
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
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '24px',
                                            border: '3px solid #28a745',
                                            background: task.is_completed === true ? 'linear-gradient(45deg, #28a745, #20c997)' : 'white',
                                            color: task.is_completed === true ? 'white' : '#28a745',
                                            boxShadow: task.is_completed === true ? '0 10px 25px rgba(40, 167, 69, 0.3)' : 'none',
                                            transform: task.is_completed === true ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.3s ease'
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
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '24px',
                                            border: '3px solid #dc3545',
                                            background: task.is_completed === false ? 'linear-gradient(45deg, #dc3545, #e83e8c)' : 'white',
                                            color: task.is_completed === false ? 'white' : '#dc3545',
                                            boxShadow: task.is_completed === false ? '0 10px 25px rgba(220, 53, 69, 0.3)' : 'none',
                                            transform: task.is_completed === false ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.3s ease'
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
                    onClick={() => {
                        if (!userName.trim()) {
                            alert('Iltimos, ismingizni kiriting!');
                            return;
                        }

                        const incompleteTasks = tasks.filter(t => t.is_completed === null);
                        if (incompleteTasks.length > 0) {
                            alert('Iltimos, barcha vazifalar uchun javob tanlang!');
                            return;
                        }

                        alert('Muvaffaqiyatli yuborildi! ✅');
                        fetchMonthlyStats();
                    }}
                    style={{
                        width: '100%',
                        padding: '18px',
                        fontSize: '18px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '15px',
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease',
                        marginBottom: '20px'
                    }}
                >
                    Yuborish
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default KunlikVazifalar;