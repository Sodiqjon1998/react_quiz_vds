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
    const [showResultModal, setShowResultModal] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    // ✅ Rasm URL'ini to'g'rilash funksiyasi
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // Agar to'liq URL bo'lsa, o'zini qaytaradi
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Agar storage/ bilan boshlansa
        if (imagePath.startsWith('storage/')) {
            return `https://quizvds-production.up.railway.app/${imagePath}`;
        }
        
        // Boshqa holatlarda storage/ qo'shadi
        return `https://quizvds-production.up.railway.app/storage/${imagePath}`;
    };

    const saveState = useCallback(() => {
        if (!quizId) return;
        try {
            const quizState = {
                answers: answers,
                markedForReview: markedForReview,
                currentQuestionIndex: currentQuestionIndex,
                timeLeft: timeLeft > 0 ? timeLeft : 0,
            };
            localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(quizState));
        } catch (e) {
            console.error("Progressni saqlashda xatolik:", e);
        }
    }, [quizId, answers, markedForReview, currentQuestionIndex, timeLeft]);

    const clearState = useCallback(() => {
        if (quizId) {
            localStorage.removeItem(`quiz_progress_${quizId}`);
        }
    }, [quizId]);

    useEffect(() => {
        if (!loading && questions.length > 0) {
            saveState();
        }
    }, [answers, markedForReview, currentQuestionIndex, timeLeft, loading, questions.length, saveState]);

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

            const token = localStorage.getItem('token');
            const response = await fetch(`https://quizvds-production.up.railway.app/api/quiz/${quizId}/start`, {
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
                
                // ✅ Rasmlarni to'g'rilangan holda saqlash
                const processedQuestions = data.data.questions.map(q => ({
                    ...q,
                    image: getImageUrl(q.image)
                }));
                
                setQuestions(processedQuestions);

                const timeString = data.data.quiz_details.attachment?.time || "00:30:00";
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                setTimeLeft(totalSeconds);

                const savedState = localStorage.getItem(`quiz_progress_${quizId}`);
                if (savedState) {
                    try {
                        const parsedState = JSON.parse(savedState);
                        setAnswers(parsedState.answers || {});
                        setMarkedForReview(parsedState.markedForReview || {});

                        if (parsedState.currentQuestionIndex < data.data.questions.length) {
                            setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0);
                        } else {
                            setCurrentQuestionIndex(0);
                        }

                        if (parsedState.timeLeft > 0) {
                            setTimeLeft(parsedState.timeLeft);
                        }

                        console.log("Quiz holati LocalStorage'dan tiklandi.");
                    } catch (e) {
                        console.error("Saqlangan progressni yuklashda xatolik:", e);
                        localStorage.removeItem(`quiz_progress_${quizId}`);
                    }
                }

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
            const response = await fetch(`https://quizvds-production.up.railway.app/api/quiz/${quizId}/submit`, {
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
                clearState();
                
                // ✅ Natija rasmlarini ham to'g'rilash
                if (data.data.detailed_results) {
                    data.data.detailed_results = data.data.detailed_results.map(result => ({
                        ...result,
                        question_image: getImageUrl(result.question_image)
                    }));
                }
                
                setQuizResult(data.data);
                setShowResultModal(true);
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

    const ResultModal = () => {
        if (!quizResult) return null;

        const { score, total_questions, percentage, passed, detailed_results } = quizResult;

        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">
                        <div className={`modal-header ${passed ? 'bg-success' : 'bg-danger'} text-white border-0`}>
                            <div className="w-100 text-center">
                                <h3 className="modal-title mb-2 fw-bold text-white">
                                    {passed ? (
                                        <>🎉 Tabriklaymiz!</>
                                    ) : (
                                        <>😔 Test yakunlandi</>
                                    )}
                                </h3>
                                <p className="mb-0 text-white-50">
                                    {passed
                                        ? "Siz testdan muvaffaqiyatli o'tdingiz!"
                                        : 'Keyingi safar omad tilaymiz!'}
                                </p>
                            </div>
                        </div>

                        <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="row g-4 mb-4">
                                <div className="col-md-4">
                                    <div className="card border-0 bg-primary bg-opacity-10 h-100">
                                        <div className="card-body text-center">
                                            <div className="text-primary mb-3" style={{ fontSize: '3rem' }}>✓</div>
                                            <h2 className="fw-bold text-primary mb-1">{score}/{total_questions}</h2>
                                            <p className="text-muted mb-0">To'g'ri javoblar</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 bg-warning bg-opacity-10 h-100">
                                        <div className="card-body text-center">
                                            <div className="text-warning mb-3" style={{ fontSize: '3rem' }}>%</div>
                                            <h2 className="fw-bold text-warning mb-1">{percentage}%</h2>
                                            <p className="text-muted mb-0">Natija</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className={`card border-0 ${passed ? 'bg-success' : 'bg-danger'} bg-opacity-10 h-100`}>
                                        <div className="card-body text-center">
                                            <div className={`${passed ? 'text-success' : 'text-danger'} mb-3`} style={{ fontSize: '3rem' }}>
                                                {passed ? '😊' : '😢'}
                                            </div>
                                            <h2 className={`fw-bold ${passed ? 'text-success' : 'text-danger'} mb-1`}>
                                                {passed ? "O'tdingiz" : 'Topshirilmadi'}
                                            </h2>
                                            <p className="text-muted mb-0">
                                                {passed ? '70% dan yuqori' : '70% kerak edi'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="fw-semibold">To'g'ri javoblar</span>
                                    <span className="fw-semibold">{score} / {total_questions}</span>
                                </div>
                                <div className="progress" style={{ height: '20px' }}>
                                    <div
                                        className={`progress-bar ${passed ? 'bg-success' : 'bg-danger'}`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <strong>{percentage}%</strong>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h5 className="mb-3 fw-bold">
                                📋 Batafsil natijalar
                            </h5>

                            {detailed_results && detailed_results.map((result, index) => {
                                const question = questions.find(q => q.id === result.question_id);
                                const letters = ['A', 'B', 'C', 'D'];

                                return (
                                    <div className={`card mb-3 border-2 ${result.is_correct ? 'border-success' : 'border-danger'}`} key={result.question_id}>
                                        <div className={`card-header ${result.is_correct ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center flex-grow-1">
                                                    <span className={`badge ${result.is_correct ? 'bg-success' : 'bg-danger'} me-3 px-3 py-2`}>
                                                        {index + 1}
                                                    </span>
                                                    <h6 className="mb-0">
                                                        {question?.name?.replace(/<[^>]*>/g, '').substring(0, 80)}...
                                                    </h6>
                                                </div>
                                                <div className={`${result.is_correct ? 'text-success' : 'text-danger'} fs-3`}>
                                                    {result.is_correct ? '✓' : '✗'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="mb-3">
                                                <strong className="d-block mb-2 text-primary">
                                                    ❓ Savol:
                                                </strong>
                                                <div
                                                    className="p-3 bg-light rounded"
                                                    dangerouslySetInnerHTML={{ __html: question?.name }}
                                                />
                                            </div>

                                            {/* ✅ Rasm ko'rsatish */}
                                            {question?.image && (
                                                <div className="mb-3 text-center">
                                                    <img
                                                        src={question.image}
                                                        alt="Savol rasmi"
                                                        className="img-fluid rounded shadow-sm"
                                                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                                                        onError={(e) => {
                                                            console.error('Rasm yuklanmadi:', question.image);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div className="row g-3">
                                                {question?.options?.map((option, optIdx) => {
                                                    const isCorrect = option.id === result.correct_option_id;
                                                    const isSelected = option.id === result.selected_option_id;

                                                    return (
                                                        <div className="col-md-6" key={option.id}>
                                                            <div
                                                                className={`card ${isCorrect ? 'border-success border-2 bg-success bg-opacity-10' :
                                                                        isSelected && !isCorrect ? 'border-danger border-2 bg-danger bg-opacity-10' :
                                                                            'border'
                                                                    }`}
                                                            >
                                                                <div className="card-body p-3">
                                                                    <div className="d-flex align-items-start">
                                                                        <span className={`badge ${isCorrect ? 'bg-success' :
                                                                                isSelected ? 'bg-danger' :
                                                                                    'bg-secondary'
                                                                            } me-2 px-2 py-1`}>
                                                                            {letters[optIdx]}
                                                                        </span>
                                                                        <div className="flex-grow-1">
                                                                            <div dangerouslySetInnerHTML={{ __html: option.name }} />
                                                                            {isCorrect && (
                                                                                <div className="mt-2">
                                                                                    <span className="badge bg-success">
                                                                                        ✓ To'g'ri javob
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {isSelected && !isCorrect && (
                                                                                <div className="mt-2">
                                                                                    <span className="badge bg-danger">
                                                                                        ✗ Sizning javobingiz
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-footer border-0 bg-light">
                            <button
                                className="btn btn-primary btn-lg px-5"
                                onClick={() => {
                                    setShowResultModal(false);
                                    if (onBack) onBack();
                                }}
                            >
                                ← Bosh sahifaga qaytish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                <h4>⚠️ Xatolik</h4>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={onBack}>
                    ← Orqaga
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <>
            {showResultModal && <ResultModal />}

            <div className="row g-4">
                <div className="col-lg-9">
                    <div className="card shadow-sm border-0">
                        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white py-3">
                            <div>
                                <h5 className="mb-1 text-white fw-bold">
                                    📝 Savol {currentQuestionIndex + 1} / {questions.length}
                                </h5>
                                <small className="text-white-50">
                                    📚 {quiz?.name} - {quiz?.subject?.name}
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
                                        🔖 Ko'rib chiqish uchun belgilash
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-4">
                            <div className="mb-4">
                                <div className="d-flex align-items-start mb-3">
                                    <div className="badge bg-primary me-3 px-3 py-2 fs-6">
                                        {currentQuestionIndex + 1}
                                    </div>
                                    <h5 className="mb-0 flex-grow-1" dangerouslySetInnerHTML={{ __html: currentQuestion?.name }} />
                                </div>

                                {/* ✅ Rasm ko'rsatish - Yaxshilangan */}
                                {currentQuestion?.image && (
                                    <div className="text-center mb-4">
                                        <img
                                            src={currentQuestion.image}
                                            alt="Savol rasmi"
                                            className="img-fluid rounded shadow-sm"
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '400px', 
                                                objectFit: 'contain',
                                                border: '2px solid #e0e0e0',
                                                padding: '10px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                            onError={(e) => {
                                                console.error('Rasm yuklanmadi:', currentQuestion.image);
                                                e.target.style.display = 'none';
                                                e.target.insertAdjacentHTML('afterend', 
                                                    '<div class="alert alert-warning">⚠️ Rasm yuklanmadi</div>'
                                                );
                                            }}
                                            onLoad={() => {
                                                console.log('Rasm muvaffaqiyatli yuklandi:', currentQuestion.image);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

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
                                                            <span className={`badge ${isSelected ? 'bg-primary' : 'bg-secondary'} me-2`}>
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

                        <div className="card-footer d-flex justify-content-between align-items-center bg-light py-3">
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                ← Oldingi
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
                                        <>✉️ Yakunlash</>
                                    )}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                >
                                    Keyingi →
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="card sticky-top shadow-sm border-0" style={{ top: '20px' }}>
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0 text-white fw-bold">
                                📊 Test Navigatsiyasi
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className={`alert ${timeLeft < 300 ? 'alert-danger' : 'alert-warning'} text-center mb-3 border-0`}>
                                ⏱️ <strong>Qolgan vaqt:</strong>
                                <h4 className="mb-0 mt-2 fw-bold" style={{ color: timeLeft < 300 ? '#dc3545' : 'inherit' }}>
                                    {formatTime(timeLeft)}
                                </h4>
                            </div>

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

                            <div className="row g-2 mb-3">
                                {questions.map((_, index) => {
                                    const status = getQuestionStatus(index);
                                    let bgClass;

                                    switch (status) {
                                        case 'answered-marked':
                                            bgClass = 'bg-warning';
                                            break;
                                        case 'answered':
                                            bgClass = 'bg-success';
                                            break;
                                        case 'marked':
                                            bgClass = 'bg-info';
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
                                    <>🏁 Testni Tugatish</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default QuizPage;