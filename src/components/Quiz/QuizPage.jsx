import { useState, useEffect, useCallback } from 'react';
import { 
    BookOpen, Clock, CheckCircle, XCircle, AlertCircle, 
    HelpCircle, Flag, ArrowLeft, ArrowRight, Send, 
    CheckSquare, RotateCcw, LayoutGrid, Award, Timer, 
    ChevronRight, ChevronLeft, Check, AlertTriangle 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';


// ==========================================
// ⚙️ SOZLAMALAR (CONFIG)
// ==========================================

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
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('storage/')) {
            return `${API_BASE_URL}/${imagePath}`;
        }
        return `${API_BASE_URL}/storage/${imagePath}`;
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
            const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}/start`, {
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
            const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}/submit`, {
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className={`p-6 text-center ${passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        <div className="flex justify-center mb-3">
                            {passed ? 
                                <Award className="w-16 h-16 text-white animate-bounce" /> : 
                                <AlertTriangle className="w-16 h-16 text-white" />
                            }
                        </div>
                        <h2 className="text-2xl font-bold mb-1">
                            {passed ? "Tabriklaymiz! Muvaffaqiyatli o'tdingiz!" : "Afsuski, testdan o'ta olmadingiz"}
                        </h2>
                        <p className="text-white/90 text-sm">
                            {passed ? "Siz ajoyib natija ko'rsatdingiz!" : "Keyingi safar albatta uddalaysiz!"}
                        </p>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-blue-500 mb-2" />
                                <div className="text-3xl font-bold text-blue-600">{score} / {total_questions}</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">To'g'ri Javoblar</div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col items-center justify-center">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 font-bold mb-2">%</div>
                                <div className="text-3xl font-bold text-orange-600">{percentage}%</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Umumiy Natija</div>
                            </div>

                            <div className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center ${passed ? 'border-green-100' : 'border-red-100'}`}>
                                {passed ? 
                                    <CheckSquare className="w-8 h-8 text-green-500 mb-2" /> : 
                                    <XCircle className="w-8 h-8 text-red-500 mb-2" />
                                }
                                <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {passed ? "O'tdingiz" : "Yiqildingiz"}
                                </div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {passed ? '70% dan yuqori' : '70% dan past'}
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-gray-500" />
                            Batafsil tahlil
                        </h3>

                        <div className="space-y-4">
                            {detailed_results && detailed_results.map((result, index) => {
                                const question = questions.find(q => q.id === result.question_id);
                                const letters = ['A', 'B', 'C', 'D'];

                                return (
                                    <div key={result.question_id} className={`bg-white border-l-4 rounded-r-xl shadow-sm overflow-hidden ${result.is_correct ? 'border-green-500' : 'border-red-500'}`}>
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                            <div className="flex gap-3">
                                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${result.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <div className="font-medium text-gray-800 mb-1" dangerouslySetInnerHTML={{ __html: question?.name }} />
                                                </div>
                                            </div>
                                            {result.is_correct ? 
                                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" /> : 
                                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                            }
                                        </div>

                                        {question?.image && (
                                            <div className="px-4 pt-4">
                                                <img 
                                                    src={question.image} 
                                                    alt="Question" 
                                                    className="max-h-48 object-contain rounded-lg border border-gray-200"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                        )}

                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {question?.options?.map((option, optIdx) => {
                                                const isCorrect = option.id === result.correct_option_id;
                                                const isSelected = option.id === result.selected_option_id;
                                                
                                                let optionClass = "border border-gray-200 bg-white";
                                                if (isCorrect) optionClass = "border-green-500 bg-green-50 text-green-900";
                                                else if (isSelected && !isCorrect) optionClass = "border-red-500 bg-red-50 text-red-900";

                                                return (
                                                    <div key={option.id} className={`p-3 rounded-lg flex items-center gap-3 text-sm ${optionClass}`}>
                                                        <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${isCorrect ? 'bg-green-200 text-green-800' : (isSelected ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600')}`}>
                                                            {letters[optIdx]}
                                                        </span>
                                                        <div dangerouslySetInnerHTML={{ __html: option.name }} />
                                                        {isCorrect && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                                                        {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 ml-auto" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 border-t border-gray-200 bg-white flex justify-center">
                        <button
                            onClick={() => {
                                setShowResultModal(false);
                                if (onBack) onBack();
                            }}
                            className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Bosh sahifaga qaytish
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <h5 className="text-gray-600 font-medium">Quiz yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Xatolik yuz berdi</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={onBack}
                        className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors w-full"
                    >
                        Orqaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            {showResultModal && <ResultModal />}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left/Top: Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Question Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <HelpCircle className="w-5 h-5 text-blue-200" />
                                    <span className="font-medium text-blue-100">Savol {currentQuestionIndex + 1} / {questions.length}</span>
                                </div>
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    {quiz?.name}
                                </h2>
                            </div>
                            
                            <button 
                                onClick={() => toggleMarkForReview(currentQuestion?.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    markedForReview[currentQuestion?.id] 
                                    ? 'bg-yellow-400 text-yellow-900 font-bold' 
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                <Flag className="w-4 h-4" />
                                <span className="text-sm">Belgilash</span>
                            </button>
                        </div>

                        {/* Question Content */}
                        <div className="p-6">
                            <div className="text-lg text-gray-800 font-medium mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion?.name }} />

                            {currentQuestion?.image && (
                                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                    <img
                                        src={currentQuestion.image}
                                        alt="Savol rasmi"
                                        className="max-h-[400px] max-w-full object-contain mx-auto rounded-lg shadow-sm"
                                        onError={(e) => {
                                            console.error('Rasm yuklanmadi:', currentQuestion.image);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-3">
                                {currentQuestion?.options?.map((option, idx) => {
                                    const isSelected = answers[currentQuestion.id] === option.id;
                                    const letters = ['A', 'B', 'C', 'D'];

                                    return (
                                        <div 
                                            key={option.id}
                                            onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                            className={`
                                                relative group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4
                                                ${isSelected 
                                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold transition-colors
                                                ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
                                            `}>
                                                {letters[idx]}
                                            </div>
                                            <div className={`flex-1 text-base ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: option.name }} />
                                            
                                            {/* Radio circle visual */}
                                            <div className={`
                                                w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1
                                                ${isSelected ? 'border-blue-500' : 'border-gray-300'}
                                            `}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Navigation */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors ${
                                    currentQuestionIndex === 0 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 shadow-sm'
                                }`}
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Oldingi
                            </button>

                            <div className="hidden sm:block text-gray-500 text-sm font-medium">
                                {Object.keys(answers).length} / {questions.length} javob berildi
                            </div>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 shadow-lg shadow-green-200 transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    Yakunlash
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
                                >
                                    Keyingi
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right/Bottom: Sidebar Info */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        {/* Timer Card */}
                        <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${timeLeft < 300 ? 'border-red-500' : 'border-blue-500'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-500 font-medium text-sm flex items-center gap-2">
                                    <Timer className="w-4 h-4" /> Qolgan vaqt
                                </span>
                                {timeLeft < 300 && <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>}
                            </div>
                            <div className={`text-3xl font-bold font-mono tracking-wider ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-gray-400" />
                                Savollar xaritasi
                            </h4>
                            
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((_, index) => {
                                    const status = getQuestionStatus(index);
                                    let btnClass = "bg-gray-100 text-gray-500 hover:bg-gray-200"; // Default
                                    
                                    if (status === 'answered') btnClass = "bg-blue-500 text-white shadow-sm shadow-blue-200";
                                    else if (status === 'marked') btnClass = "bg-yellow-400 text-yellow-900 border border-yellow-500";
                                    else if (status === 'answered-marked') btnClass = "bg-gradient-to-br from-blue-500 to-yellow-400 text-white";
                                    
                                    if (currentQuestionIndex === index) {
                                        btnClass += " ring-2 ring-offset-2 ring-blue-500";
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={`h-10 w-full rounded-lg font-bold text-sm transition-all ${btnClass}`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 space-y-2 text-xs text-gray-500 border-t pt-4 border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
                                    Javob berilmagan
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                                    Javob berilgan
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-yellow-400"></div>
                                    Belgilangan
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Flag className="w-5 h-5" />
                            Testni tugatish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizPage;