import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Swords, Trophy, Zap, Loader2, Search, Play, ArrowLeft, Users, User
} from 'lucide-react';
import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import MathText from './MathText';
import { API_BASE_URL } from '../../config';

// ---------------------------------------------------------
// 1. ECHO VA PUSHER SOZLAMALARI
// ---------------------------------------------------------
window.Pusher = Pusher;

// Agar .env faylingizda kalitlar bo'lsa, ularni import.meta.env dan oling.
// Aks holda to'g'ridan-to'g'ri yozishingiz mumkin (faqat test uchun).

// Tokenni olish
const token = localStorage.getItem('token');
const echo = new Echo({
    broadcaster: 'pusher',
    key: 'bd72b3eabbe0fb9d1258', // ⚠️ PUSHER APP KEYNI SHU YERGA YOZING
    cluster: 'ap1',                // ⚠️ PUSHER CLUSTERNI SHU YERGA YOZING
    forceTLS: true,

    // ⚠️ MUHIM O'ZGARISH: Backendga to'g'ri yo'l ko'rsatamiz
    authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,

    // ⚠️ MUHIM: Tokenni headerda yuboramiz
    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    },
});

const DuelGame = ({ onExit }) => {
    // --- STATE ---
    const [view, setView] = useState('list'); // 'list' | 'opponent' | 'game'
    const [quizzes, setQuizzes] = useState([]);
    const [classmates, setClassmates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // O'yin ma'lumotlari
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [opponent, setOpponent] = useState(null); // Tanlangan raqib
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) { return null; }
    });

    // ---------------------------------------------------------
    // 2. REAL-TIME TINGLASH (LISTENER)
    // ---------------------------------------------------------
    useEffect(() => {
        if (!currentUser) return;

        console.log(`📡 Tinglanmoqda: user.${currentUser.id}`);
        const channel = echo.private(`user.${currentUser.id}`);

        // A) Meni kimdir duelga chaqirdi
        channel.listen('DuelChallenge', (e) => {
            console.log("📨 Chaqiruv keldi:", e);

            // Ovozli signal (ixtiyoriy)
            new Audio('/assets/audio/notification.mp3').play().catch(() => { });

            Swal.fire({
                title: '⚔️ Duelga chaqiruv!',
                text: `${e.challenger.first_name} sizni "${e.quizId}-quiz" bo'yicha jangga chorlamoqda!`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Qabul qilish',
                cancelButtonText: 'Rad etish',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    acceptChallenge(e.challenger, e.quizId, e.subjectId);
                }
            });
        });

        // B) Men chaqirgan raqib rozi bo'ldi
        channel.listen('DuelAccepted', (e) => {
            console.log("✅ Raqib qabul qildi:", e);
            Swal.close(); // Loadingni yopish

            Swal.fire({
                title: 'Jang boshlandi!',
                text: `${e.accepter.first_name} chaqiruvni qabul qildi. Tayyorlaning!`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // O'yinni boshlaymiz (Raqib ma'lumotlarini o'rnatamiz)
                setOpponent(e.accepter);
                setView('game');
            });
        });

        return () => {
            echo.leave(`user.${currentUser.id}`);
        };
    }, [currentUser]);


    // ---------------------------------------------------------
    // 3. API FUNKSIYALARI (Chaqiruv yuborish/qabul qilish)
    // ---------------------------------------------------------

    // Chaqiruv yuborish
    const sendChallenge = async (targetStudent) => {
        if (!selectedQuiz) return;

        try {
            // Loading ko'rsatib turamiz
            Swal.fire({
                title: 'So\'rov yuborilmoqda...',
                html: `<b>${targetStudent.name}</b> javob berishi kutilmoqda...<br>Iltimos kutib turing.`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/quiz/duel/challenge`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    target_user_id: targetStudent.id,
                    quiz_id: selectedQuiz.id,
                    subject_id: selectedQuiz.subject.id
                })
            });

            if (!res.ok) throw new Error("Tarmoq xatosi");

        } catch (error) {
            console.error(error);
            Swal.fire('Xatolik', 'So\'rov yuborishda xatolik bo\'ldi', 'error');
        }
    };

    // Chaqiruvni qabul qilish
    const acceptChallenge = async (challenger, quizId, subjectId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/quiz/duel/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ challenger_id: challenger.id })
            });

            // Bizda ham o'yin boshlanadi
            // Quiz ma'lumotlarini to'g'irlab olamiz (API dan to'liq quiz info kelmagani uchun vaqtincha ID larni ishlatamiz)
            setSelectedQuiz({ id: quizId, subject: { id: subjectId }, name: "Duel Quiz" });
            setOpponent(challenger);
            setView('game');

        } catch (error) {
            console.error(error);
            Swal.fire('Xatolik', 'O\'yinni boshlashda xatolik', 'error');
        }
    };


    // ---------------------------------------------------------
    // 4. DATA YUKLASH (Quizlar va Sinfdoshlar)
    // ---------------------------------------------------------
    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/quiz/duel/list`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await response.json();
            if (data.success) setQuizzes(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchClassmates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/quiz/duel/classmates`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await response.json();
            if (data.success) setClassmates(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // --- NAVIGATION ---
    const selectQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        fetchClassmates();
        setView('opponent');
    };

    const handleSelectOpponent = (student) => {
        // To'g'ridan-to'g'ri o'yin boshlanmaydi, chaqiruv ketadi
        sendChallenge(student);
    };

    const goBack = () => {
        if (view === 'game') {
            if (confirm("O'yinni tark etasizmi?")) {
                setView('opponent');
                setOpponent(null);
            }
        }
        else if (view === 'opponent') {
            setView('list');
            setSelectedQuiz(null);
        }
    };


    // =========================================================
    //  RENDER: 1. QUIZ LIST
    // =========================================================
    if (view === 'list') {
        const filteredQuizzes = quizzes.filter(q => q.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                                <Swords className="w-10 h-10 text-indigo-600" />
                                Duel Arenasi
                            </h1>
                            <p className="text-gray-500">Jang qilish uchun mavzuni tanlang</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? <Loader /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map(quiz => (
                                <div key={quiz.id} onClick={() => selectQuiz(quiz)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-indigo-200 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase">{quiz.subject.name}</span>
                                        <span className="text-xs text-gray-400 font-medium">{quiz.questions_count || 0} savol</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600">{quiz.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <Users className="w-4 h-4" />
                                        <span>Sinf: {quiz.class}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================
    //  RENDER: 2. OPPONENT SELECT
    // =========================================================
    if (view === 'opponent') {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
                <div className="w-full max-w-5xl">
                    <button onClick={goBack} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold">
                        <ArrowLeft className="w-5 h-5" /> Ortga qaytish
                    </button>

                    <h2 className="text-3xl font-black text-center text-gray-800 mb-2">Raqibni Tanlang</h2>
                    <p className="text-center text-gray-500 mb-10">Kuningizni kim bilan sinamoqchisiz?</p>

                    {loading ? <Loader /> : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {classmates.length > 0 ? classmates.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => handleSelectOpponent(student)}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:scale-105 hover:shadow-xl hover:border-indigo-300 transition-all text-center group"
                                >
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-100 group-hover:border-indigo-500 relative">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-gray-400 m-auto mt-4" />
                                        )}
                                        {/* Online status indicator (mock) */}
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 truncate">{student.name}</h4>
                                    <span className="text-xs text-green-500 font-bold">Online</span>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    Sinfdoshlar topilmadi
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================
    //  RENDER: 3. GAME (ActiveGame)
    // =========================================================
    return (
        <ActiveGame
            quiz={selectedQuiz}
            opponent={opponent}
            currentUser={currentUser}
            onBack={goBack}
        />
    );
};

// ---------------------------------------------------------
// ACTIVE GAME COMPONENT
// (Hozircha lokal, lekin raqib ma'lumotlari bilan)
// ---------------------------------------------------------
const ActiveGame = ({ quiz, opponent, currentUser, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished

    // Scores
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0); // Real-time bo'lmasa 0 turadi
    const [answerStatus, setAnswerStatus] = useState(null); // 'correct', 'wrong'

    const correctSound = useRef(new Audio('/assets/audio/Water_Lily.mp3'));

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/quiz/${quiz.subject.id}/${quiz.id}/duel`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await response.json();

                if (data.success && data.data.questions?.length > 0) {
                    const formatted = data.data.questions.map(q => ({
                        id: q.id,
                        question: q.question_text,
                        options: q.options.map(opt => ({
                            id: opt.id, text: opt.option_text, isCorrect: opt.is_correct
                        }))
                    }));
                    setQuestions(formatted);
                    setLoading(false);
                }
            } catch (e) { console.error(e); }
        };
        fetchGameData();
    }, [quiz]);

    // O'yin mantiqi (Faqat men o'ynayman hozircha)
    const handleAnswer = (option) => {
        if (answerStatus) return;

        if (option.isCorrect) {
            correctSound.current.currentTime = 0;
            correctSound.current.play().catch(() => { });
            setMyScore(s => s + 10);
            setAnswerStatus('correct');
        } else {
            setAnswerStatus('wrong');
        }

        // Keyingi savolga o'tish
        setTimeout(() => {
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
                setAnswerStatus(null);
            } else {
                setGameState('finished');
            }
        }, 1000);
    };

    if (loading) return <Loader />;

    // INTRO SCREEN
    if (gameState === 'intro') {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-center animate-in zoom-in duration-500">
                    {/* ME */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-blue-600 rounded-full mb-4 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                            {currentUser?.img ?
                                <img src={currentUser.img} className="w-full h-full rounded-full object-cover" /> :
                                <span className="text-4xl font-black">MEN</span>
                            }
                        </div>
                        <h3 className="text-xl font-bold">{currentUser?.first_name || 'Siz'}</h3>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                        <Swords className="w-24 h-24 text-red-500 mx-auto animate-pulse" />
                        <h1 className="text-6xl font-black italic mt-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">VS</h1>
                        <button onClick={() => setGameState('playing')} className="mt-8 px-10 py-3 bg-white text-gray-900 rounded-full font-black text-xl hover:scale-110 transition-transform shadow-lg shadow-white/20">
                            BOSHLASH
                        </button>
                    </div>

                    {/* OPPONENT */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-red-600 rounded-full mb-4 overflow-hidden border-4 border-white/20 shadow-2xl">
                            {opponent?.avatar ? (
                                <img src={opponent.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="flex items-center justify-center h-full text-4xl font-black">{opponent?.short_name?.[0]}</span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold">{opponent?.name || opponent?.short_name}</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900 text-white text-center">
                <div className="bg-gray-800 p-12 rounded-3xl border border-gray-700 shadow-2xl animate-in fade-in-up">
                    <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-4xl font-black mb-4">O'yin Yakunlandi!</h2>
                    <div className="text-2xl text-gray-400 mb-8">
                        Sizning natijangiz: <span className="text-white font-bold">{myScore}</span> ball
                    </div>
                    <button onClick={onBack} className="bg-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors">
                        Chiqish
                    </button>
                </div>
            </div>
        );
    }

    // GAMEPLAY
    const currentQ = questions[currentQIndex];
    return (
        <div className="h-screen flex flex-col bg-gray-900 overflow-hidden relative select-none">
            {/* Header Info */}
            <div className="bg-gray-800 p-4 flex justify-between items-center px-8 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">S</div>
                    <div>
                        <div className="text-xs text-gray-400">Siz</div>
                        <div className="font-bold text-white text-xl">{myScore}</div>
                    </div>
                </div>
                <div className="text-gray-500 font-mono font-bold">
                    {currentQIndex + 1} / {questions.length}
                </div>
                <div className="flex items-center gap-3 text-right">
                    <div>
                        <div className="text-xs text-gray-400">{opponent?.short_name || 'Raqib'}</div>
                        <div className="font-bold text-white text-xl">{opponentScore}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500 overflow-hidden">
                        {opponent?.avatar && <img src={opponent.avatar} className="w-full h-full object-cover" />}
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-4xl mx-auto w-full">
                <div className="w-full text-center mb-10">
                    <MathText className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        {currentQ.question}
                    </MathText>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {currentQ.options.map((opt, idx) => {
                        let btnClass = "bg-gray-800 border-2 border-gray-700 hover:border-gray-500 hover:bg-gray-750";
                        if (answerStatus) {
                            if (opt.isCorrect) btnClass = "bg-green-600 border-green-500";
                            else btnClass = "bg-gray-800 border-gray-700 opacity-50";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(opt)}
                                disabled={!!answerStatus}
                                className={`p-6 rounded-xl text-left transition-all text-white font-medium text-lg flex items-center gap-4 ${btnClass}`}
                            >
                                <span className="w-8 h-8 rounded bg-gray-700/50 flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                                <MathText>{opt.text}</MathText>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Helper Loader
const Loader = () => (
    <div className="flex justify-center items-center h-64 text-indigo-500">
        <Loader2 className="w-10 h-10 animate-spin" />
    </div>
);

export default DuelGame;