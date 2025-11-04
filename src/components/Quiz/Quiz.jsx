import { useState, useEffect } from 'react';

function Quiz({ subjectId, quizId }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, []);

    // Timer
    useEffect(() => {
        if (quizData && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleSubmit(); // Vaqt tugasa avtomatik yuborish
        }
    }, [timeLeft, quizData]);

    const fetchQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:8000/api/subjects/${subjectId}/quizzes/${quizId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setQuizData(data.data);
                setTimeLeft(data.data.quiz.duration * 60); // minut -> sekund
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Quiz yuklanishida xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, optionId) => {
        setAnswers({
            ...answers,
            [questionId]: optionId
        });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');

        const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
            question_id: parseInt(questionId),
            option_id: optionId
        }));

        try {
            const response = await fetch(
                `http://localhost:8000/api/subjects/${subjectId}/quizzes/${quizId}/submit`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ answers: answersArray })
                }
            );

            const data = await response.json();

            if (data.success) {
                alert(`Natija: ${data.result.score} ball\nTo'g'ri javoblar: ${data.result.correct_answers}/${data.result.total_questions}`);
                // Natijalar sahifasiga yo'naltirish
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    if (loading) return <div>Yuklanmoqda...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="card mb-4">
                <div className="card-body">
                    <h3>{quizData.quiz.name}</h3>
                    <p>{quizData.quiz.description}</p>
                    <div className="d-flex justify-content-between">
                        <span>Fan: {quizData.subject.name}</span>
                        <span className="badge bg-primary">
                            Vaqt: {minutes}:{seconds.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Questions */}
            {quizData.questions.map((question, index) => (
                <div key={question.id} className="card mb-3">
                    <div className="card-body">
                        <h5>Savol {index + 1} ({question.mark} ball)</h5>
                        <p>{question.question_text}</p>

                        {question.options.map(option => (
                            <div key={option.id} className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`option-${option.id}`}
                                    onChange={() => handleAnswerChange(question.id, option.id)}
                                    checked={answers[question.id] === option.id}
                                />
                                <label className="form-check-label" htmlFor={`option-${option.id}`}>
                                    {option.option_text}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Submit Button */}
            <button
                className="btn btn-primary btn-lg w-100"
                onClick={handleSubmit}
            >
                Topshirish
            </button>
        </div>
    );
}

export default Quiz;