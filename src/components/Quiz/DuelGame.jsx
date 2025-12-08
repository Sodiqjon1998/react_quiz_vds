import React, { useState, useEffect, useRef } from 'react';
import {
    Swords, Trophy, Zap, Loader2, Search, ArrowLeft, User, Clock, CheckCircle, XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import MathText from './MathText';
import { API_BASE_URL } from '../../config';

// ---------------------------------------------------------
// CONFIGURATION & ECHO INIT
// ---------------------------------------------------------
window.Pusher = Pusher;
const initEcho = () => {
    if (window.Echo) return window.Echo;
    const token = localStorage.getItem('token');
    if (token) {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: 'bd72b3eabbe0fb9d1258',
            cluster: 'ap1',
            forceTLS: true,
            authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
            auth: { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
        });
    }
    return window.Echo;
};
initEcho();


// ---------------------------------------------------------
// MAIN COMPONENT: DuelGame (Router & Data Loaders)
// ---------------------------------------------------------
const DuelGame = ({ onExit }) => {
    const [view, setView] = useState('list');
    const [quizzes, setQuizzes] = useState([]);
    const [classmates, setClassmates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [currentUser, setCurrentUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
    });

    const [onlineUsers, setOnlineUsers] = useState({});


    // PUSHER KANALLARINI TINGLASH
    useEffect(() => {
        initEcho();
        if (!currentUser || !window.Echo) return;

        const privateChannel = window.Echo.private(`user.${currentUser.id}`);

        // 1. Presence Channel (Onlayn status)
        const presenceChannel = window.Echo.join('presence-online')
            .here((members) => {
                const initialOnline = members.reduce((acc, member) => {
                    acc[member.id] = member.info;
                    return acc;
                }, {});
                setOnlineUsers(initialOnline);
            })
            .joining((member) => {
                setOnlineUsers(prev => ({ ...prev, [member.id]: member.info }));
            })
            .leaving((member) => {
                setOnlineUsers(prev => {
                    const newState = { ...prev };
                    delete newState[member.id];
                    return newState;
                });
            });

        // 2. Duelga Chaqiruv
        privateChannel.listen('.DuelChallenge', (e) => {
            new Audio('/assets/audio/notification.mp3').play().catch(() => { });
            Swal.fire({
                title: '⚔️ Duelga chaqiruv!',
                html: `<span class="text-lg font-bold text-indigo-600">${e.challenger.first_name}</span> sizni jangga chorlamoqda!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Qabul qilish',
                cancelButtonText: 'Rad etish',
                confirmButtonColor: '#4F46E5',
                cancelButtonColor: '#EF4444',
                background: '#1F2937', color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) acceptChallenge(e.challenger, e.quizId, e.subjectId);
            });
        });

        // 3. Duel Qabul qilindi
        privateChannel.listen('.DuelAccepted', (e) => {
            Swal.close();
            Swal.fire({
                title: 'Jang Boshlandi!',
                text: `${e.accepter.first_name} qabul qildi.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1F2937', color: '#fff'
            }).then(() => {
                setOpponent(e.accepter);
                setView('game');
            });
        });

        // Tozalash
        return () => {
            window.Echo.leave('presence-online');
            window.Echo.leave(`user.${currentUser.id}`);
        };

    }, [currentUser]);

    // API Calls
    const sendChallenge = async (target) => {
        if (!selectedQuiz) return;
        try {
            Swal.fire({
                title: 'Kutilmoqda...',
                html: `<b>${target.name}</b> javobini kuting...`,
                allowOutsideClick: false,
                background: '#1F2937', color: '#fff',
                didOpen: () => Swal.showLoading()
            });
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/quiz/duel/challenge`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_user_id: target.id, quiz_id: selectedQuiz.id, subject_id: selectedQuiz.subject.id })
            });
        } catch (e) { Swal.fire('Xatolik', 'Tarmoq xatosi', 'error'); }
    };

    const acceptChallenge = async (challenger, quizId, subjectId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/quiz/duel/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenger_id: challenger.id })
            });
            setSelectedQuiz({ id: quizId, subject: { id: subjectId }, name: "Duel Quiz" });
            setOpponent(challenger);
            setView('game');
        } catch (e) { console.error(e); }
    };

    // Data Loaders
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [qRes, cRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/quiz/duel/list`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/api/quiz/duel/classmates`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
                ]);
                const qData = await qRes.json();
                const cData = await cRes.json();
                if (qData.success) setQuizzes(qData.data);
                if (cData.success) setClassmates(cData.data);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        load();
    }, []);


    if (view === 'list') return (
        <div className="min-h-screen bg-gray-900 p-6 font-sans text-gray-100">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
                            <Swords className="w-10 h-10 text-indigo-400" /> DUEL ARENASI
                        </h1>
                        <p className="text-gray-400 mt-2">Bilimingizni sinash uchun maydon tanlang</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                        <input type="text" placeholder="Qidirish..." className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                {loading ? <Loader /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.filter(q => q.name.toLowerCase().includes(searchQuery.toLowerCase())).map(quiz => (
                            <div key={quiz.id} onClick={() => { setSelectedQuiz(quiz); setView('opponent'); }} className="group bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] cursor-pointer transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-24 h-24" /></div>
                                <div className="flex justify-between mb-4"><span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold uppercase">{quiz.subject.name}</span></div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{quiz.name}</h3>
                                <p className="text-gray-500 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> {quiz.questions_count} ta savol</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (view === 'opponent') return (
        <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center text-white">
            <button onClick={() => { setView('list'); setSelectedQuiz(null); }} className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /> Orqaga</button>
            <h2 className="text-3xl font-bold mb-2">Raqibni Tanlang</h2>
            <p className="text-gray-400 mb-10">Kim bilan kuch sinashmoqchisiz?</p>
            {loading ? <Loader /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-5xl">
                    {classmates.map(student => {
                        const isOnline = onlineUsers[student.id];

                        if (student.id === currentUser.id) return null;

                        return (
                            <div
                                key={student.id}
                                onClick={() => isOnline && sendChallenge(student)}
                                className={`bg-gray-800 p-4 rounded-2xl border border-gray-700 transition-all text-center group shadow-lg 
                                    ${isOnline ? 'hover:border-indigo-500 hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                            >

                                {/* ✅ AVATAR CONTAINER (w-20 aspect-square bilan tuzatilgan) */}
                                <div className="w-20 aspect-square mx-auto mb-4 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                                    {student.avatar ? (
                                        <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
                                    ) : (
                                        <User className="w-16 h-16 text-gray-500" />
                                    )}
                                </div>

                                <h4 className="font-bold text-gray-200 group-hover:text-indigo-400 truncate">{student.name}</h4>
                                {/* ONLINE STATUS */}
                                <span className={`text-xs font-medium flex items-center justify-center gap-1 mt-1 
                                    ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // DuelGame render calls ActiveGame
    return <ActiveGame quiz={selectedQuiz} opponent={opponent} currentUser={currentUser} echo={window.Echo} onBack={() => { if (confirm("Chiqish?")) { setView('list'); setOpponent(null); } }} />;
};


// ---------------------------------------------------------
// ACTIVE GAME (HAMMASI BOG'LANGAN)
// ---------------------------------------------------------
const ActiveGame = ({ quiz, opponent, currentUser, echo, onBack }) => {
    // STATE
    const [questions, setQuestions] = useState([]);
    const [currIdx, setCurrIdx] = useState(0);
    const [gameState, setGameState] = useState('intro');

    // Ballar
    const [myScore, setMyScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);

    // UI Statuslar
    const [locked, setLocked] = useState(false);
    const [myAnswer, setMyAnswer] = useState(null);
    const [oppAnswer, setOppAnswer] = useState(null);

    // MANTIQ UCHUN JONLI XOTIRA (REFS)
    const questionsRef = useRef([]);
    const currIdxRef = useRef(0);
    const isRoundOver = useRef(false);

    const correctSfx = useRef(new Audio('/assets/audio/Water_Lily.mp3'));
    const oppName = opponent?.short_name || opponent?.name || "Raqib";

    // Reflarni State bilan sinxronlash
    useEffect(() => { questionsRef.current = questions; }, [questions]);
    useEffect(() => { currIdxRef.current = currIdx; }, [currIdx]);

    // 1. SIGNAL TINGLASH (PUSHER)
    useEffect(() => {
        if (!echo || !currentUser) return;
        const channel = echo.private(`user.${currentUser.id}`);

        channel.listen('.DuelGameState', (e) => {
            if (e.type === 'answer') {
                setLocked(true);
                isRoundOver.current = true;

                // Ballarni yangilash
                const isMe = e.data.actor_id === currentUser.id;
                const isCorrect = e.data.isCorrect;

                if (isCorrect) {
                    if (isMe) {
                        setMyScore(s => s + 10);
                        setMyAnswer('correct');
                        correctSfx.current.play().catch(() => { });
                    } else {
                        setOppScore(s => s + 10);
                        setOppAnswer('correct');
                    }
                } else {
                    if (isMe) setMyAnswer('wrong');
                    else setOppAnswer('wrong');
                }

                // Xabar chiqarish
                const actorName = isMe ? "Siz" : oppName;
                Swal.fire({
                    title: `${actorName} birinchi bo'ldi!`,
                    text: isCorrect ? "To'g'ri topdi ✅" : "Xato qildi ❌",
                    icon: isCorrect ? 'success' : 'error',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    background: '#1F2937', color: '#fff'
                });

                // Keyingi savolga o'tish
                setTimeout(() => {
                    const totalQuestions = questionsRef.current.length;
                    const current = currIdxRef.current;

                    if (totalQuestions > 0 && current < totalQuestions - 1) {
                        handleNextQuestion();
                    } else {
                        setGameState('finished');
                    }
                }, 2000);
            }
        });

        return () => { channel.stopListening('.DuelGameState'); };
    }, [echo, currentUser, oppName]);

    // 2. SAVOLLARNI YUKLASH
    useEffect(() => {
        const loadQ = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/quiz/${quiz.subject.id}/${quiz.id}/duel`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' }
                });
                const d = await res.json();

                if (d.success && d.data.questions) {
                    const formatted = d.data.questions.map(q => ({
                        id: q.id,
                        question: q.name || q.question_text,
                        options: q.options.map(o => ({
                            id: o.id,
                            text: o.name || o.option_text,
                            isCorrect: Boolean(o.is_correct)
                        }))
                    }));
                    setQuestions(formatted);
                    questionsRef.current = formatted;
                }
            } catch (e) { console.error(e); }
        };
        loadQ();
    }, []);

    // 3. TIMER (INTRO)
    useEffect(() => {
        if (questions.length > 0 && gameState === 'intro') {
            setTimeout(() => setGameState('playing'), 3000);
        }
    }, [questions, gameState]);

    // SERVERGA YUBORISH
    const broadcastState = async (type, data) => {
        try {
            await fetch(`${API_BASE_URL}/api/quiz/duel/state`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opponent_id: opponent.id,
                    type,
                    data: { ...data, question_index: currIdxRef.current }
                })
            });
        } catch (e) { console.error(e); }
    };

    // TUGMA BOSILGANDA
    const handleAnswer = (opt) => {
        if (locked || isRoundOver.current) return;

        setLocked(true);
        isRoundOver.current = true;

        broadcastState('answer', { isCorrect: opt.isCorrect });
    };

    // KEYINGI SAVOLGA O'TISH FUNKSIYASI
    const handleNextQuestion = () => {
        setMyAnswer(null);
        setOppAnswer(null);
        setLocked(false);
        isRoundOver.current = false;

        setCurrIdx(prev => prev + 1);
    };

    // --- RENDER ---
    if (questions.length === 0) return <div className="h-screen bg-gray-900 flex items-center justify-center text-indigo-500"><Loader2 className="w-12 h-12 animate-spin" /></div>;

    if (gameState === 'intro') return (
        <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
            <h1 className="text-6xl font-black text-yellow-500 animate-pulse">TAYYORLANING...</h1>
        </div>
    );

    if (gameState === 'finished') {
        const iWon = myScore > oppScore;
        const isDraw = myScore === oppScore;
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center text-white relative">
                <div className="absolute inset-0 bg-[url('/assets/img/grid.svg')] opacity-10"></div>
                <div className="bg-gray-800 p-12 rounded-3xl text-center border border-gray-700 shadow-2xl relative z-10 w-full max-w-lg">
                    {iWon ? <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400 animate-bounce" /> : isDraw ? <Swords className="w-24 h-24 mx-auto mb-6 text-blue-400" /> : <Trophy className="w-24 h-24 mx-auto mb-6 text-gray-600 grayscale" />}
                    <h2 className={`text-5xl font-black mb-2 ${iWon ? 'text-yellow-400' : isDraw ? 'text-blue-400' : 'text-gray-400'}`}>
                        {iWon ? "G'ALABA!" : isDraw ? "DURANG" : "MAG'LUBIYAT"}
                    </h2>
                    <div className="flex justify-center gap-6 my-6 text-4xl font-bold">
                        <span className="text-blue-400">{myScore}</span> : <span className="text-red-400">{oppScore}</span>
                    </div>
                    <button onClick={onBack} className="w-full py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700">Chiqish</button>
                </div>
            </div>
        );
    }

    const q = questions[currIdx];
    return (
        <div className="h-screen flex flex-col bg-gray-900 overflow-hidden select-none font-sans text-white">
            <div className="h-20 bg-gray-800 border-b border-gray-700 flex justify-between items-center px-8">
                <div><div className="text-gray-400 text-xs font-bold">SIZ</div><div className="text-2xl font-black">{myScore}</div></div>
                <div className="bg-gray-700 px-4 py-1 rounded-full font-bold">{currIdx + 1} / {questions.length}</div>
                <div className="text-right"><div className="text-gray-400 text-xs font-bold">{oppName}</div><div className="text-2xl font-black">{oppScore}</div></div>
            </div>

            <div className="w-full h-1 bg-gray-800"><div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currIdx + 1) / questions.length) * 100}%` }}></div></div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-5xl mx-auto w-full">
                <div className="mb-10 text-center"><MathText className="text-3xl font-black">{q.question}</MathText></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {q.options.map((opt, idx) => {
                        let statusClass = "bg-gray-800 border-gray-700 hover:bg-gray-700";
                        if (locked) {
                            if (myAnswer === 'correct' && opt.isCorrect) statusClass = "bg-green-600 border-green-500";
                            else if (myAnswer === 'wrong' && !opt.isCorrect) statusClass = "bg-red-600 border-red-500";
                            else if (oppAnswer === 'correct' && opt.isCorrect) statusClass = "bg-yellow-600 border-yellow-500 animate-pulse";
                            else statusClass = "bg-gray-800 opacity-30 grayscale";
                        }

                        return (
                            <button key={idx} onClick={() => handleAnswer(opt)} disabled={locked || isRoundOver.current} className={`p-6 rounded-2xl border-2 text-left transition-all ${statusClass} ${(!locked && !isRoundOver.current) && 'hover:scale-[1.02] hover:border-gray-500'}`}>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-400">{['A', 'B', 'C', 'D'][idx]}</span>
                                    <span className="font-bold text-lg"><MathText>{opt.text}</MathText></span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {(locked || isRoundOver.current) && <div className="mt-8 text-indigo-400 animate-pulse font-bold">Javob tekshirilmoqda...</div>}
            </div>
        </div>
    );
};

const Loader = () => <div className="flex justify-center items-center h-64 text-indigo-500"><Loader2 className="w-10 h-10 animate-spin" /></div>;

export default DuelGame;