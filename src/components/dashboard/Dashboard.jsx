import { useState, useEffect } from 'react';

function Dashboard({ user }) {
    const [quizzes, setQuizzes] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const token = localStorage.getItem('token');
            // 🎯 O'ZGARTIRILDI: API manzili /api/quizzes dan /api/index ga o'zgartirildi
            const response = await fetch('http://localhost:8000/api/index', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Agar javob xato (401, 403, 404, 500) bo'lsa, xatolik tashlaymiz
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server xatosi yoki avtorizatsiya muammosi!');
            }

            const data = await response.json();



            if (data.success) {
                setQuizzes(data.data.quizzes);
                setStatistics(data.data.statistics);
            }
        } catch (err) {
            console.error('Quiz yuklashda xatolik:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'AVAILABLE': { text: 'Mavjud', class: 'bg-success' },
            'NOT_STARTED': { text: 'Boshlanmagan', class: 'bg-warning' },
            'EXPIRED': { text: 'Tugagan', class: 'bg-danger' },
            'NO_ATTEMPTS': { text: 'Urinishlar tugagan', class: 'bg-secondary' }
        };
        return badges[status] || badges['AVAILABLE'];
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    // UI qismi o'zgarishsiz qoldi...
    return (
        <div className="row g-6">
            {/* Welcome Card */}
            <div className="col-md-12 col-xxl-8">
                <div className="card">
                    <div className="d-flex align-items-end row">
                        <div className="col-md-6 order-2 order-md-1">
                            <div className="card-body">
                                <h4 className="card-title mb-4">
                                    Xush kelibsiz, <span className="fw-bold">{user?.name}!</span> 🎉
                                </h4>
                                <p className="mb-0">Siz muvaffaqiyatli tizimga kirdingiz.</p>
                                <p>Yangi imkoniyatlarni kashf eting!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="col-xxl-2 col-sm-6">
                <div className="card h-100">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div className="avatar">
                                <div className="avatar-initial bg-label-primary rounded-3">
                                    <i className="icon-base ri ri-file-list-3-line icon-24px"></i>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <p className="mb-0 text-success me-1">+22%</p>
                                <i className="icon-base ri ri-arrow-up-s-line text-success"></i>
                            </div>
                        </div>
                        <div className="card-info mt-5">
                            <h5 className="mb-1">{statistics?.total || 0}</h5>
                            <p>Jami Quizlar</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xxl-2 col-sm-6">
                <div className="card h-100">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div className="avatar">
                                <div className="avatar-initial bg-label-success rounded-3">
                                    <i className="icon-base ri ri-checkbox-circle-line icon-24px"></i>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <p className="mb-0 text-success me-1">+38%</p>
                                <i className="icon-base ri ri-arrow-up-s-line text-success"></i>
                            </div>
                        </div>
                        <div className="card-info mt-5">
                            <h5 className="mb-1">{statistics?.completed || 0}</h5>
                            <p>Topshirilgan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quizzes List */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Mavjud Quizlar</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Quiz nomi</th>
                                        <th>Fan</th>
                                        <th>Sana</th>
                                        <th>Vaqt</th>
                                        <th>Urinishlar</th>
                                        <th>Holat</th>
                                        <th>Amal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                Hozircha quizlar mavjud emas
                                            </td>
                                        </tr>
                                    ) : (
                                        quizzes.map(quiz => {
                                            const badge = getStatusBadge(quiz.status);
                                            return (
                                                <tr key={quiz.id}>
                                                    <td>{quiz.name}</td>
                                                    <td>{quiz.subject.name}</td>
                                                    <td>{quiz.date}</td>
                                                    <td>{quiz.time}</td>
                                                    <td>
                                                        <span className="badge bg-label-primary">
                                                            {quiz.attempts.used}/{quiz.attempts.total}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${badge.class}`}>
                                                            {badge.text}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {quiz.status === 'AVAILABLE' && (
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => {
                                                                    // Quiz sahifasiga o'tish
                                                                    window.location.href = `#quiz/${quiz.subject.id}/${quiz.id}`;
                                                                }}
                                                            >
                                                                Boshlash
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;