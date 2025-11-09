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

            // ✅ TO'G'RI API ENDPOINT
            // ✅ Sizning hozirgi route'ingizga mos
            const response = await fetch('http://localhost:8000/api/quiz', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server xatosi yoki avtorizatsiya muammosi!');
            }

            const data = await response.json();

            console.log('API Response:', data); // Debug uchun

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

    // ✅ YANGI: Quiz holatini aniqlash
    const getQuizStatus = (quiz) => {
        if (!quiz.attachment) {
            return {
                text: 'Vaqt belgilanmagan',
                class: 'bg-secondary',
                icon: 'ri-time-line',
                canStart: false
            };
        }

        if (quiz.is_expired) {
            return {
                text: 'Muddati o\'tgan',
                class: 'bg-danger',
                icon: 'ri-close-circle-line',
                canStart: false
            };
        }

        if (quiz.is_upcoming) {
            return {
                text: 'Yaqinda boshlanadi',
                class: 'bg-warning',
                icon: 'ri-calendar-line',
                canStart: false
            };
        }

        if (quiz.attempts.used >= quiz.attempts.total) {
            return {
                text: 'Urinishlar tugadi',
                class: 'bg-info',
                icon: 'ri-forbid-line',
                canStart: false
            };
        }

        return {
            text: 'Mavjud',
            class: 'bg-success',
            icon: 'ri-check-circle-line',
            canStart: true
        };
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Yuklanmoqda...</span>
                    </div>
                    <h5 className="text-muted">Quizlar yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <div className="d-flex align-items-start">
                    <i className="ri-error-warning-line fs-4 me-3"></i>
                    <div>
                        <h5 className="alert-heading">Xatolik yuz berdi!</h5>
                        <p className="mb-3">{error}</p>
                        <button className="btn btn-danger" onClick={fetchQuizzes}>
                            <i className="ri-refresh-line me-1"></i>
                            Qayta yuklash
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <div className="col-md-6 text-center text-md-end order-1 order-md-2">
                            <div className="card-body pb-0 px-0 px-md-4">
                                <img
                                    src="/assets/img/illustrations/man-with-laptop-light.png"
                                    height="140"
                                    alt="View Badge User"
                                    data-app-dark-img="illustrations/man-with-laptop-dark.png"
                                    data-app-light-img="illustrations/man-with-laptop-light.png"
                                />
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
                            <p className="mb-0">Jami Quizlar</p>
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
                            <p className="mb-0">Topshirilgan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quizzes Table */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="ri-file-list-3-line me-2"></i>
                            Mavjud Quizlar
                        </h5>
                        <button className="btn btn-sm btn-primary" onClick={fetchQuizzes}>
                            <i className="ri-refresh-line me-1"></i>
                            Yangilash
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '25%' }}>Quiz nomi</th>
                                        <th style={{ width: '15%' }} className="text-center">Fan</th>
                                        <th style={{ width: '12%' }} className="text-center">Sana</th>
                                        <th style={{ width: '10%' }} className="text-center">Vaqt</th>
                                        <th style={{ width: '12%' }} className="text-center">Urinishlar</th>
                                        <th style={{ width: '13%' }} className="text-center">Holat</th>
                                        <th style={{ width: '13%' }} className="text-center">Amal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5">
                                                <div className="text-center">
                                                    <i className="ri-inbox-line text-muted" style={{ fontSize: '60px', opacity: 0.3 }}></i>
                                                    <h5 className="text-muted mt-3 mb-1">Hozircha quizlar mavjud emas</h5>
                                                    <p className="text-muted small">Yangi quizlar qo'shilganida bu yerda ko'rinadi</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        quizzes.map(quiz => {
                                            const status = getQuizStatus(quiz);

                                            return (
                                                <tr key={quiz.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-sm bg-label-primary rounded me-3">
                                                                <i className="ri-file-list-line"></i>
                                                            </div>
                                                            <div>
                                                                <strong className="d-block">{quiz.name}</strong>
                                                                <small className="text-muted">{quiz.class}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-info-subtle text-info px-3 py-2">
                                                            <i className="ri-book-line me-1"></i>
                                                            {quiz.subject.name}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {quiz.attachment ? (
                                                            <span className="text-nowrap">
                                                                <i className="ri-calendar-line me-1 text-muted"></i>
                                                                {quiz.attachment.date}
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-secondary">-</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {quiz.attachment ? (
                                                            <span className="text-nowrap">
                                                                <i className="ri-time-line me-1 text-muted"></i>
                                                                {quiz.attachment.time}
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-secondary">-</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <span className={`badge ${quiz.attempts.used >= quiz.attempts.total
                                                                    ? 'bg-danger'
                                                                    : 'bg-primary'
                                                                } px-3 py-2`}>
                                                                {quiz.attempts.used}/{quiz.attempts.total}
                                                            </span>
                                                            {quiz.attempts.remaining > 0 && (
                                                                <small className="text-muted mt-1">
                                                                    {quiz.attempts.remaining} qolgan
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge ${status.class} px-3 py-2`}>
                                                            <i className={`${status.icon} me-1`}></i>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className={`btn btn-sm ${status.canStart ? 'btn-primary' : 'btn-secondary'} shadow-sm`}
                                                            disabled={!status.canStart}
                                                            onClick={() => {
                                                                if (status.canStart) {
                                                                    window.location.href = `#quiz/${quiz.subject.id}/${quiz.id}`;
                                                                }
                                                            }}
                                                            title={!status.canStart ? status.text : 'Quizni boshlash'}
                                                        >
                                                            {status.canStart ? (
                                                                <>
                                                                    <i className="ri-play-circle-line me-1"></i>
                                                                    Boshlash
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="ri-lock-line me-1"></i>
                                                                    Bloklangan
                                                                </>
                                                            )}
                                                        </button>
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