import { useState, useEffect } from 'react';

function Dashboard({ user }) {
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

            const response = await fetch('http://localhost:8000/api/quiz', {
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
            return { text: 'Vaqt belgilanmagan', class: 'bg-secondary', icon: 'ri-time-line', canStart: false };
        }
        if (quiz.is_expired) {
            return { text: 'Muddati o\'tgan', class: 'bg-danger', icon: 'ri-close-circle-line', canStart: false };
        }
        if (quiz.is_upcoming) {
            return { text: 'Yaqinda boshlanadi', class: 'bg-warning', icon: 'ri-calendar-line', canStart: false };
        }
        if (quiz.attempts.used >= quiz.attempts.total) {
            return { text: 'Urinishlar tugadi', class: 'bg-info', icon: 'ri-forbid-line', canStart: false };
        }
        return { text: 'Mavjud', class: 'bg-success', icon: 'ri-check-circle-line', canStart: true };
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f5f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    <h5 style={{ marginTop: '20px', color: '#666' }}>Quizlar yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', background: '#f5f5f9', minHeight: '100vh' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '16px', border: '2px solid #dc3545' }}>
                    <div style={{ textAlign: 'center' }}>
                        <i className="ri-error-warning-line" style={{ fontSize: '60px', color: '#dc3545' }}></i>
                        <h5 style={{ marginTop: '20px', color: '#dc3545' }}>Xatolik yuz berdi!</h5>
                        <p style={{ color: '#666', marginTop: '10px' }}>{error}</p>
                        <button
                            onClick={fetchQuizzes}
                            style={{
                                marginTop: '20px',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#dc3545',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            <i className="ri-refresh-line"></i> Qayta yuklash
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#f5f5f9', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Statistics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {/* Card 1 - Jami Quizlar */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        borderLeft: '4px solid #667eea',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#667eea'
                            }}>
                                📋
                            </div>
                            {/* <span style={{ color: '#28a745', fontSize: '14px', fontWeight: '600' }}>+22%</span> */}
                        </div>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#667eea', margin: '0 0 8px 0' }}>
                            {statistics?.total || 0}
                        </h2>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Jami Quizlar</p>
                    </div>

                    {/* Card 2 - Topshirilgan */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        borderLeft: '4px solid #28a745',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(40, 167, 69, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#28a745'
                            }}>
                                ✅
                            </div>
                            {/* <span style={{ color: '#28a745', fontSize: '14px', fontWeight: '600' }}>+38%</span> */}
                        </div>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#28a745', margin: '0 0 8px 0' }}>
                            {statistics?.completed || 0}
                        </h2>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Topshirilgan</p>
                    </div>

                    {/* Card 3 - Kutilmoqda */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        borderLeft: '4px solid #ffc107',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(255, 193, 7, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#ffc107'
                            }}>
                                ⏳
                            </div>
                            {/* <span style={{ color: '#ffc107', fontSize: '14px', fontWeight: '600' }}>-12%</span> */}
                        </div>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#ffc107', margin: '0 0 8px 0' }}>
                            {(statistics?.total || 0) - (statistics?.completed || 0)}
                        </h2>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Kutilmoqda</p>
                    </div>

                    {/* Card 4 - Foiz */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        borderLeft: '4px solid #007bff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(0, 123, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: '#007bff'
                            }}>
                                📊
                            </div>
                            {/* <span style={{ color: '#28a745', fontSize: '14px', fontWeight: '600' }}>+5%</span> */}
                        </div>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#007bff', margin: '0 0 8px 0' }}>
                            {statistics?.total ? Math.round((statistics.completed / statistics.total) * 100) : 0}%
                        </h2>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Muvaffaqiyat foizi</p>
                    </div>
                </div>

                {/* Welcome Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '30px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
                            Xush kelibsiz, <span style={{ color: '#667eea' }}>{user?.first_name + " " + user?.last_name}!</span> 🎉
                        </h1>
                        <p style={{ color: '#666', fontSize: '16px', marginBottom: '8px' }}>
                            Siz muvaffaqiyatli tizimga kirdingiz.
                        </p>
                        <p style={{ color: '#666', fontSize: '16px' }}>
                            Yangi imkoniyatlarni kashf eting!
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '120px' }}>👨‍💻</div>
                    </div>
                </div>

                {/* Quizzes Table */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '15px'
                    }}>
                        <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
                            <i className="ri-file-list-3-line" style={{ marginRight: '10px', color: '#667eea' }}></i>
                            Mavjud Quizlar
                        </h5>
                        <button
                            onClick={fetchQuizzes}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: '2px solid #667eea',
                                background: 'white',
                                color: '#667eea',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#667eea';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#667eea';
                            }}
                        >
                            <i className="ri-refresh-line"></i> Yangilash
                        </button>
                    </div>

                    {/* Mobile & Desktop Responsive */}
                    <div style={{ padding: '24px', overflowX: 'auto' }}>
                        {quizzes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <i className="ri-inbox-line" style={{ fontSize: '60px', color: '#ccc' }}></i>
                                <h5 style={{ marginTop: '20px', color: '#999' }}>Hozircha quizlar mavjud emas</h5>
                                <p style={{ color: '#999' }}>Yangi quizlar qo'shilganida bu yerda ko'rinadi</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {quizzes.map(quiz => {
                                    const status = getQuizStatus(quiz);

                                    return (
                                        <div
                                            key={quiz.id}
                                            style={{
                                                background: '#f8f9fa',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                border: '2px solid #e9ecef',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#667eea';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#e9ecef';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                gap: '16px',
                                                alignItems: 'center'
                                            }}>
                                                {/* Quiz Name */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: '#667eea',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '20px'
                                                        }}>
                                                            📝
                                                        </div>
                                                        <div>
                                                            <strong style={{ display: 'block', color: '#333', fontSize: '16px' }}>
                                                                {quiz.name}
                                                            </strong>
                                                            <small style={{ color: '#666' }}>{quiz.class}</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Subject */}
                                                <div>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        background: '#17a2b8',
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}>
                                                        📚 {quiz.subject.name}
                                                    </span>
                                                </div>

                                                {/* Date & Time */}
                                                <div>
                                                    {quiz.attachment ? (
                                                        <>
                                                            <div style={{ marginBottom: '4px', color: '#666' }}>
                                                                📅 {quiz.attachment.date}
                                                            </div>
                                                            <div style={{ color: '#666' }}>
                                                                ⏰ {quiz.attachment.time}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            background: '#6c757d',
                                                            color: 'white',
                                                            fontSize: '13px'
                                                        }}>-</span>
                                                    )}
                                                </div>

                                                {/* Attempts */}
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '10px 16px',
                                                        borderRadius: '8px',
                                                        background: quiz.attempts.used >= quiz.attempts.total ? '#dc3545' : '#667eea',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        fontSize: '16px'
                                                    }}>
                                                        {quiz.attempts.used}/{quiz.attempts.total}
                                                    </span>
                                                    {quiz.attempts.remaining > 0 && (
                                                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                                                            {quiz.attempts.remaining} qolgan
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        background: status.class === 'bg-success' ? '#28a745' :
                                                            status.class === 'bg-danger' ? '#dc3545' :
                                                                status.class === 'bg-warning' ? '#ffc107' :
                                                                    status.class === 'bg-info' ? '#17a2b8' : '#6c757d',
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <i className={status.icon}></i> {status.text}
                                                    </span>
                                                </div>

                                                {/* Action Button */}
                                                <div style={{ textAlign: 'center' }}>
                                                    <button
                                                        disabled={!status.canStart}
                                                        onClick={() => {
                                                            if (status.canStart) {
                                                                window.location.href = `#quiz/${quiz.subject.id}/${quiz.id}`;
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '12px 24px',
                                                            borderRadius: '10px',
                                                            border: 'none',
                                                            background: status.canStart ? '#28a745' : '#6c757d',
                                                            color: 'white',
                                                            cursor: status.canStart ? 'pointer' : 'not-allowed',
                                                            fontWeight: '600',
                                                            transition: 'all 0.3s ease',
                                                            fontSize: '14px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (status.canStart) {
                                                                e.target.style.transform = 'scale(1.05)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (status.canStart) {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = 'none';
                                                            }
                                                        }}
                                                    >
                                                        {status.canStart ? (
                                                            <>
                                                                <i className="ri-play-circle-line"></i> Boshlash
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="ri-lock-line"></i> Bloklangan
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;