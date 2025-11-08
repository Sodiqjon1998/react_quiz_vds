import { useState, useEffect, useCallback } from 'react';

function QuizPage({ quizId, subjectId, onBack }) {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. LOCAL STORAGE FUNKSIYALARI ---

    // Progressni LocalStorage'ga saqlash
    const saveState = useCallback(() => {
        if (!quizId) return;
        try {
            const quizState = {
                answers: answers,
                markedForReview: markedForReview,
                currentQuestionIndex: currentQuestionIndex,
                // Server vaqti emas, qolgan vaqtni saqlaymiz (agar 0 dan katta bo'lsa)
                timeLeft: timeLeft > 0 ? timeLeft : 0,
            };
            localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(quizState));
        } catch (e) {
            console.error("Progressni saqlashda xatolik:", e);
        }
    }, [quizId, answers, markedForReview, currentQuestionIndex, timeLeft]);

    // Progressni o'chirish (faqat test yakunlanganda chaqiriladi)
    const clearState = useCallback(() => {
        if (quizId) {
            localStorage.removeItem(`quiz_progress_${quizId}`);
        }
    }, [quizId]);

    // Javoblarni saqlash uchun useEffect
    useEffect(() => {
        // Faqat yuklash tugagan bo'lsa va savollar mavjud bo'lsa saqlash
        if (!loading && questions.length > 0) {
            saveState();
        }
    }, [answers, markedForReview, currentQuestionIndex, timeLeft, loading, questions.length, saveState]);


    // --- 2. ASOSIY LOGIKA VA API SO'ROVLAR ---

    // Timer
    useEffect(() => {
        if (timeLeft <= 0 || loading || questions.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading, questions.length]);

    const startQuiz = async () => {
        try {
            setLoading(true);
            setError(null);
            // clearState(); // ❌ BU YERDAN O'CHIRILDI!

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/quiz/${quizId}/start`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Quiz boshlashda xatolik');
            }

            if (data.success) {
                setQuiz(data.data.quiz_details);
                setQuestions(data.data.questions);

                // Vaqtni sekundlarga aylantirish (serverdan kelgan maksimal vaqt)
                const timeString = data.data.quiz_details.attachment?.time || "00:30:00";
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                setTimeLeft(totalSeconds); // Avval maksimal vaqtni o'rnatamiz

                // 🌟 Saqlangan Javoblarni Tiklash
                const savedState = localStorage.getItem(`quiz_progress_${quizId}`);
                if (savedState) {
                    try {
                        const parsedState = JSON.parse(savedState);

                        setAnswers(parsedState.answers || {});
                        setMarkedForReview(parsedState.markedForReview || {});

                        // Faqatgina saqlangan holatdagi savol indeksi mavjud savollar oralig'ida bo'lsa tiklash
                        if (parsedState.currentQuestionIndex < data.data.questions.length) {
                            setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0);
                        } else {
                            setCurrentQuestionIndex(0);
                        }

                        // Qolgan vaqtni tiklash
                        if (parsedState.timeLeft > 0) {
                            setTimeLeft(parsedState.timeLeft);
                        }

                        console.log("Quiz holati LocalStorage'dan tiklandi.");

                    } catch (e) {
                        console.error("Saqlangan progressni yuklashda xatolik:", e);
                        localStorage.removeItem(`quiz_progress_${quizId}`);
                    }
                }
                // 🌟 Tiklash tugadi

                setLoading(false);
            }
        } catch (err) {
            console.error('Start quiz error:', err);
            setError(err.message);
            setLoading(false);
            alert(err.message);
            if (onBack) onBack();
        }
    };

    useEffect(() => {
        startQuiz();
    }, [quizId]);


    const handleAnswerSelect = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const toggleMarkForReview = (questionId) => {
        setMarkedForReview(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const handleSubmit = async () => {
        // ... (Qolgan handleSubmit mantig'i o'zgarmadi)
        if (isSubmitting) return;

        const unanswered = questions.length - Object.keys(answers).length;
        if (unanswered > 0 && timeLeft > 0) {
            if (!confirm(`${unanswered} ta savolga javob bermaganmisiz. Baribir topshirasizmi?`)) {
                return;
            }
        }

        setIsSubmitting(true);
        setTimeLeft(0);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/quiz/${quizId}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    answers: answers
                })
            });

            const data = await response.json();

            if (data.success) {
                // ✅ Muvaffaqiyatli topshirilgandan keyin LocalStorage'ni tozalash
                clearState();

                const result = data.data;
                alert(
                    `🎉 Quiz yakunlandi!\n\n` +
                    `✅ To'g'ri javoblar: ${result.score}/${result.total_questions}\n` +
                    `📊 Foiz: ${result.percentage}%\n` +
                    `${result.passed ? '✨ Tabriklaymiz! Siz testdan o\'tdingiz!' : '❌ Afsuski, test topshirilmadi (70% kerak edi)'}\n\n` +
                    `Exam ID: ${result.exam_id}`
                );
                if (onBack) onBack();
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Xatolik: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. YORDAMCHI FUNKSIYALAR VA UI LOGIKA ---
    // (Bu qismda o'zgarish yo'q, avvalgidek qoladi)

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (index) => {
        const questionId = questions[index]?.id;
        if (!questionId) return 'not-answered';

        if (markedForReview[questionId]) {
            return answers[questionId] ? 'answered-marked' : 'marked';
        }
        if (answers[questionId]) return 'answered';
        return 'not-answered';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Yuklanmoqda...</span>
                    </div>
                    <h5 className="text-muted">Quiz yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <h4><i className="ri-error-warning-line me-2"></i>Xatolik</h4>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={onBack}>
                    <i className="ri-arrow-left-line me-1"></i>Orqaga
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="row g-4">
            {/* Main Quiz Area */}
            <div className="col-lg-9">
                <div className="card shadow-sm border-0">
                    <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white py-3">
                        <div>
                            <h5 className="mb-1 text-white fw-bold">
                                <i className="ri-questionnaire-line me-2"></i>
                                Savol {currentQuestionIndex + 1} / {questions.length}
                            </h5>
                            <small className="text-white-50">
                                <i className="ri-book-line me-1"></i>
                                {quiz?.name} - {quiz?.subject?.name}
                            </small>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={markedForReview[currentQuestion?.id] || false}
                                    onChange={() => toggleMarkForReview(currentQuestion?.id)}
                                    id="markReview"
                                />
                                <label className="form-check-label text-white" htmlFor="markReview">
                                    <i className="ri-bookmark-line me-1"></i>
                                    Ko'rib chiqish uchun belgilash
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-4">
                        {/* Question Text */}
                        <div className="mb-4">
                            <div className="d-flex align-items-start mb-3">
                                <div className="badge bg-primary me-3 px-3 py-2 fs-6">
                                    {currentQuestionIndex + 1}
                                </div>
                                <h5 className="mb-0 flex-grow-1" dangerouslySetInnerHTML={{ __html: currentQuestion?.name }} />
                            </div>

                            {/* Question Image */}
                            {currentQuestion?.image && (
                                <div className="text-center mb-4">
                                    <img
                                        src={currentQuestion.image}
                                        alt="Savol rasmi"
                                        className="img-fluid rounded shadow-sm"
                                        style={{ maxWidth: '600px', maxHeight: '400px', objectFit: 'contain' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            console.error('Image load error:', currentQuestion.image);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="row g-3">
                            {currentQuestion?.options?.map((option, idx) => {
                                const isSelected = answers[currentQuestion.id] === option.id;
                                const letters = ['A', 'B', 'C', 'D'];

                                return (
                                    <div className="col-12" key={option.id}>
                                        <div
                                            className={`card cursor-pointer h-100 ${isSelected ? 'border-primary border-3 shadow' : 'border'}`}
                                            onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: isSelected ? '#f0f7ff' : 'transparent'
                                            }}
                                        >
                                            <div className="card-body p-3">
                                                <div className="form-check mb-0 d-flex align-items-start">
                                                    <input
                                                        className="form-check-input mt-1 me-3"
                                                        type="radio"
                                                        name={`question-${currentQuestion.id}`}
                                                        id={`option-${option.id}`}
                                                        checked={isSelected}
                                                        onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                                    />
                                                    <label className="form-check-label fw-semibold w-100" htmlFor={`option-${option.id}`}>
                                                        <span className={`badge ${isSelected ? 'bg-primary' : 'bg-label-primary'} me-2`}>
                                                            {letters[idx]}
                                                        </span>
                                                        <span dangerouslySetInnerHTML={{ __html: option.name }} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="card-footer d-flex justify-content-between align-items-center bg-light py-3">
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            <i className="ri-arrow-left-line me-2"></i>
                            Oldingi
                        </button>

                        <div className="text-center">
                            <small className="text-muted">
                                {Object.keys(answers).length} / {questions.length} savolga javob berildi
                            </small>
                        </div>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                className="btn btn-success btn-lg"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Yuklanmoqda...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-send-plane-fill me-2"></i>
                                        Yakunlash
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            >
                                Keyingi
                                <i className="ri-arrow-right-line ms-2"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - Navigation */}
            <div className="col-lg-3">
                <div className="card sticky-top shadow-sm border-0" style={{ top: '20px' }}>
                    <div className="card-header bg-info text-white">
                        <h6 className="mb-0 text-white fw-bold">
                            <i className="ri-dashboard-line me-2"></i>
                            Test Navigatsiyasi
                        </h6>
                    </div>
                    <div className="card-body">
                        {/* Timer */}
                        <div className={`alert ${timeLeft < 300 ? 'alert-danger' : 'alert-warning'} text-center mb-3 border-0`}>
                            <i className="ri-time-line fs-5 me-2"></i>
                            <strong>Qolgan vaqt:</strong>
                            <h4 className="mb-0 mt-2 fw-bold" style={{ color: timeLeft < 300 ? '#dc3545' : 'inherit' }}>
                                {formatTime(timeLeft)}
                            </h4>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Jarayon</small>
                                <small className="text-muted fw-bold">
                                    {Math.round((Object.keys(answers).length / questions.length) * 100)}%
                                </small>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-success"
                                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <hr />

                        {/* Question Grid */}
                        <div className="row g-2 mb-3">
                            {questions.map((_, index) => {
                                const status = getQuestionStatus(index);
                                let bgClass;

                                switch (status) {
                                    case 'answered-marked':
                                        bgClass = 'bg-warning'; // Javob berilgan va belgilangan
                                        break;
                                    case 'answered':
                                        bgClass = 'bg-success';
                                        break;
                                    case 'marked':
                                        bgClass = 'bg-info'; // Faqat belgilangan
                                        break;
                                    default:
                                        bgClass = 'bg-secondary';
                                }

                                return (
                                    <div className="col-3" key={index}>
                                        <button
                                            className={`btn ${bgClass} text-white w-100 ${currentQuestionIndex === index ? 'border border-dark border-3 shadow' : ''}`}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            style={{ fontSize: '14px', padding: '8px' }}
                                        >
                                            {index + 1}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="small mb-3">
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-success me-2" style={{ width: '20px', height: '20px' }}></span>
                                <span>Javob berilgan ({Object.keys(answers).length})</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-info me-2" style={{ width: '20px', height: '20px' }}></span>
                                <span>Ko'rib chiqish uchun ({Object.keys(markedForReview).filter(k => markedForReview[k]).length})</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2" style={{ width: '20px', height: '20px' }}></span>
                                <span>Javob berilmagan ({questions.length - Object.keys(answers).length})</span>
                            </div>
                        </div>

                        <hr />

                        {/* Submit Button */}
                        <button
                            className="btn btn-danger w-100 btn-lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Yuklanmoqda...
                                </>
                            ) : (
                                <>
                                    <i className="ri-send-plane-fill me-2"></i>
                                    Testni Tugatish
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizPage;