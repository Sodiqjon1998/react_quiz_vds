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
                        background: isDisabled ? '#f5f5f5' : 
                                   hasReport ? '#10b981' : 
                                   isToday ? '#6366f1' : 'white',
                        color: isDisabled ? '#999' : (hasReport || isToday ? 'white' : '#333'),
                        fontWeight: hasReport || isToday ? '600' : '400',
                        border: isDisabled ? '1px solid #e5e5e5' : '1px solid ' + (hasReport ? '#10b981' : isToday ? '#6366f1' : '#e5e7eb'),
                        opacity: isDisabled ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        fontSize: '14px'
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
                background: '#6366f1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
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
                    <h5 style={{ color: 'white', margin: 0 }}>Yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#6366f1',
            padding: '15px',
            paddingBottom: '30px',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ 
                    background: 'white',
                    padding: '20px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '15px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        color: '#6366f1',
                        fontWeight: '700',
                        fontSize: '1.75rem',
                        marginBottom: '8px'
                    }}>
                        Kunlik Vazifalar
                    </h1>
                    <p style={{ color: '#6b7280', marginBottom: '5px', fontSize: '14px' }}>
                        Bugungi vazifalari bajarishini belgilang
                    </p>
                    <p style={{ 
                        color: '#6366f1', 
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
                    
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        style={{
                            marginTop: '12px',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: '2px solid #6366f1',
                            background: 'white',
                            color: '#6366f1',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        📅 Kalendar ko'rish
                    </button>
                </div>

                {/* Calendar */}
                {showCalendar && (
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
                                    border: '2px solid #6366f1',
                                    background: 'white',
                                    color: '#6366f1',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    minWidth: '40px'
                                }}
                            >
                                ←
                            </button>
                            <h3 style={{ 
                                margin: 0, 
                                color: '#6366f1', 
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
                                    border: '2px solid #6366f1',
                                    background: 'white',
                                    color: '#6366f1',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    minWidth: '40px'
                                }}
                            >
                                →
                            </button>
                        </div>
                        
                        {/* Weekdays */}
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
                                    color: '#6366f1', 
                                    padding: '6px',
                                    fontSize: '13px'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Calendar Days */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(7, 1fr)', 
                            gap: '8px' 
                        }}>
                            {renderCalendar()}
                        </div>
                        
                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#6b7280' }}>
                            <div>🟢 Yashil: Yuborilgan kunlar</div>
                            <div>🔵 Ko'k: Bugungi kun (faqat bugun kiritish mumkin)</div>
                            <div>⚪ Kulrang: O'tgan va kelguvchi kunlar</div>
                        </div>
                    </div>
                )}

                {/* Name Input */}
                <div style={{ 
                    background: 'white',
                    padding: '15px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '15px'
                }}>
                    <input
                        type="text"
                        placeholder="Ismingizni kiriting..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 15px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            fontSize: '15px',
                            background: 'white',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Tasks Grid */}
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
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginBottom: '15px',
                                gap: '12px'
                            }}>
                                <div style={{
                                    background: '#6366f1',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    flexShrink: 0
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
                                            boxShadow: task.is_completed === true ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
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
                                            boxShadow: task.is_completed === false ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
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

                {/* Submit Button */}
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
                        padding: '15px',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '12px',
                        background: '#6366f1',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.2s ease',
                        marginBottom: '15px'
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