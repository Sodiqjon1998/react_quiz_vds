import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Swords, Trophy, Zap, Loader2, Search, ArrowLeft, User, Clock, CheckCircle, XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import MathText from './MathText';
import { API_BASE_URL } from '../../config';

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------
window.Pusher = Pusher;
const initEcho = () => {
    if (window.Echo) return window.Echo;
    const token = localStorage.getItem('token');
    if (token) {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: 'bd72b3eabbe0fb9d1258', // .env dan olish kerak
            cluster: 'ap1',
            forceTLS: true,
            authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
            auth: { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
        });
    }
    return window.Echo;
};
initEcho();

// Helper: Raqib ma'lumotlarini to'g'irlash
const getOpponentInfo = (opponent) => {
    if (!opponent) return { name: 'Raqib', avatar: null };
    // Agar User modelidan kelsa (first_name, img)
    const name = opponent.short_name || opponent.first_name || opponent.name || 'Raqib';
    let avatar = opponent.avatar || opponent.img;
    if (avatar && !avatar.startsWith('http')) {
        avatar = `${API_BASE_URL.replace('/api', '')}/storage/${avatar}`;
    }
    return { name, avatar };
};

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

    useEffect(() => {
        initEcho();
        if (!currentUser || !window.Echo) return;

        const channel = window.Echo.private(`user.${currentUser.id}`);

        channel.listen('.DuelChallenge', (e) => {
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
                background: '#1F2937',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) acceptChallenge(e.challenger, e.quizId, e.subjectId);
            });
        });

        channel.listen('.DuelAccepted', (e) => {
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

        return () => window.Echo && window.Echo.leave(`user.${currentUser.id}`);
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
                    {classmates.map(student => (
                        <div key={student.id} onClick={() => sendChallenge(student)} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 hover:border-indigo-500 hover:scale-105 cursor-pointer transition-all text-center group shadow-lg">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 group-hover:border-indigo-500 transition-colors">
                                {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover" /> : <User className="w-10 h-10 m-auto mt-4 text-gray-500" />}
                            </div>
                            <h4 className="font-bold text-gray-200 group-hover:text-indigo-400 truncate">{student.name}</h4>
                            <span className="text-xs text-green-400 font-medium flex items-center justify-center gap-1 mt-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return <ActiveGame quiz={selectedQuiz} opponent={opponent} currentUser={currentUser} onBack={() => { if (confirm("Chiqish?")) { setView('list'); setOpponent(null); } }} />;
};

const ActiveGame = ({ quiz, opponent, currentUser, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currIdx, setCurrIdx] = useState(0);
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [myScore, setMyScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);
    const [myAnswer, setMyAnswer] = useState(null); // correct, wrong
    const [locked, setLocked] = useState(false);

    // Raqib ma'lumotlarini to'g'irlash
    const oppInfo = getOpponentInfo(opponent);
    const myInfo = getOpponentInfo(currentUser);

    // Audio
    const correctSfx = useRef(new Audio('/assets/audio/Water_Lily.mp3'));
    const wrongSfx = useRef(new Audio('/assets/audio/wrong.mp3')); // Agar bo'lsa

    useEffect(() => {
        if (!window.Echo || !currentUser) return;
        const channel = window.Echo.private(`user.${currentUser.id}`);

        channel.listen('.DuelGameState', (e) => {
            console.log("⚡ Game Event:", e);

            // 1. Raqib javob berdi (Sinxron o'tish)
            if (e.type === 'answer') {
                if (e.data.isCorrect) setOppScore(s => s + 10);

                // Agar men hali javob bermagan bo'lsam, bloklaymiz va ko'rsatamiz
                if (!locked) {
                    setLocked(true);
                    Swal.fire({
                        title: `${oppInfo.name} javob berdi!`,
                        text: e.data.isCorrect ? "To'g'ri topdi!" : "Xato qildi!",
                        icon: e.data.isCorrect ? 'warning' : 'info',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#1F2937', color: '#fff',
                        toast: true, position: 'top-end'
                    });

                    // 2 soniyadan keyin keyingi savolga o'tamiz
                    setTimeout(() => nextQuestion(), 2000);
                }
            }
        });

        return () => channel.stopListening('.DuelGameState');
    }, [currentUser, locked]);

    // Savollarni yuklash
    // 2. SAVOLLARNI YUKLASH (TUZATILDI)
    useEffect(() => {
        const loadQ = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/quiz/${quiz.subject.id}/${quiz.id}/duel`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' }
                });
                const d = await res.json();

                if (d.success && d.data.questions) {
                    // ⚠️ MUHIM: Backenddagi nomlarni (question_text) Frontendga (question) moslaymiz
                    const formattedQuestions = d.data.questions.map(q => ({
                        id: q.id,
                        question: q.question_text, // <-- "question_text" ni "question" ga o'giramiz
                        options: q.options.map(o => ({
                            id: o.id,
                            text: o.option_text,   // <-- "option_text" ni "text" ga o'giramiz
                            isCorrect: Boolean(o.is_correct)
                        }))
                    }));
                    setQuestions(formattedQuestions);
                }
            } catch (e) { console.error(e); }
        };
        loadQ();
    }, []);

    // O'yinni boshlash (3 sek kutiladi)
    useEffect(() => {
        if (questions.length > 0 && gameState === 'intro') {
            setTimeout(() => setGameState('playing'), 3000);
        }
    }, [questions, gameState]);

    const broadcastState = async (type, data) => {
        try {
            await fetch(`${API_BASE_URL}/api/quiz/duel/state`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ opponent_id: opponent.id, type, data })
            });
        } catch (e) { console.error(e); }
    };

    const handleAnswer = (opt) => {
        if (locked) return;
        setLocked(true);

        const isCorrect = opt.isCorrect;
        if (isCorrect) {
            correctSfx.current.play().catch(() => { });
            setMyScore(s => s + 10);
            setMyAnswer('correct');
        } else {
            // wrongSfx.current.play().catch(()=>{});
            setMyAnswer('wrong');
        }

        // Raqibga xabar beramiz: "Men javob berdim, natijam bu, keyingisiga o't"
        broadcastState('answer', { isCorrect, questionIndex: currIdx });

        // O'zimizda ham o'tamiz
        setTimeout(() => nextQuestion(), 2000);
    };

    const nextQuestion = () => {
        setMyAnswer(null);
        setLocked(false);
        setCurrIdx(prev => {
            if (prev < questions.length - 1) return prev + 1;
            setGameState('finished');
            return prev;
        });
    };

    // --- RENDERLAR ---

    if (questions.length === 0) return <Loader />;

    if (gameState === 'intro') return (
        <div className="h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/assets/img/grid.svg')] opacity-20 animate-pulse"></div>
            <div className="flex gap-20 items-center z-10 scale-150 transition-transform duration-1000">
                <div className="text-center animate-in slide-in-from-left duration-700">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                        {myInfo.avatar ? <img src={myInfo.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-600 flex items-center justify-center text-4xl font-black">M</div>}
                    </div>
                    <h2 className="text-white font-bold mt-4 text-2xl">{myInfo.name}</h2>
                </div>
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-2xl italic">VS</h1>
                <div className="text-center animate-in slide-in-from-right duration-700">
                    <div className="w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                        {oppInfo.avatar ? <img src={oppInfo.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-red-600 flex items-center justify-center text-4xl font-black">{oppInfo.name[0]}</div>}
                    </div>
                    <h2 className="text-white font-bold mt-4 text-2xl">{oppInfo.name}</h2>
                </div>
            </div>
        </div>
    );

    if (gameState === 'finished') {
        const iWon = myScore > oppScore;
        const draw = myScore === oppScore;
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center p-6">
                <div className="bg-gray-800 p-12 rounded-3xl border border-gray-700 shadow-2xl text-center max-w-lg w-full relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 ${iWon ? 'bg-green-500' : draw ? 'bg-gray-500' : 'bg-red-500'}`}></div>
                    <Trophy className={`w-24 h-24 mx-auto mb-6 ${iWon ? 'text-yellow-400 animate-bounce' : draw ? 'text-gray-400' : 'text-red-500'}`} />
                    <h2 className="text-5xl font-black text-white mb-2">{iWon ? "G'ALABA!" : draw ? "DURANG" : "MAG'LUBIYAT"}</h2>
                    <p className="text-gray-400 mb-8 text-lg">{iWon ? "Tabriklaymiz, siz yutdingiz!" : "Keyingi safar omad!"}</p>

                    <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl mb-8">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">Siz</div>
                            <div className="text-3xl font-bold text-blue-400">{myScore}</div>
                        </div>
                        <div className="text-2xl font-black text-gray-600">:</div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">{oppInfo.name}</div>
                            <div className="text-3xl font-bold text-red-400">{oppScore}</div>
                        </div>
                    </div>
                    <button onClick={onBack} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white transition-colors">Chiqish</button>
                </div>
            </div>
        );
    }

    const q = questions[currIdx];
    return (
        <div className="h-screen flex flex-col bg-gray-900 overflow-hidden relative select-none">
            {/* Header */}
            <div className="h-20 bg-gray-800 border-b border-gray-700 flex justify-between items-center px-6 md:px-10 z-20 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500 overflow-hidden">
                        {myInfo.avatar ? <img src={myInfo.avatar} className="w-full h-full object-cover" /> : <div className="bg-blue-600 w-full h-full"></div>}
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Siz</div>
                        <div className="text-2xl font-black text-white">{myScore}</div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 font-bold mb-1">SAVOL</div>
                    <div className="bg-gray-700 px-4 py-1 rounded-full text-indigo-300 font-mono font-bold text-lg border border-gray-600">
                        {currIdx + 1} <span className="text-gray-500 text-sm">/ {questions.length}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase truncate max-w-[100px]">{oppInfo.name}</div>
                        <div className="text-2xl font-black text-white">{oppScore}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden">
                        {oppInfo.avatar ? <img src={oppInfo.avatar} className="w-full h-full object-cover" /> : <div className="bg-red-600 w-full h-full"></div>}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-800">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currIdx + 1) / questions.length) * 100}%` }}></div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-5xl mx-auto w-full relative z-10">
                <div className="mb-10 text-center animate-in zoom-in duration-300">
                    <MathText className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">{q.question}</MathText>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {q.options.map((opt, idx) => {
                        let statusClass = "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-500";
                        if (locked) {
                            if (opt.isCorrect && myAnswer === 'correct') statusClass = "bg-green-600 border-green-500 ring-4 ring-green-500/20";
                            else if (!opt.isCorrect && myAnswer === 'wrong') statusClass = "bg-red-600 border-red-500 ring-4 ring-red-500/20";
                            else statusClass = "bg-gray-800 border-gray-700 opacity-50 grayscale";
                        }

                        return (
                            <button key={idx} onClick={() => handleAnswer(opt)} disabled={locked}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${statusClass} shadow-lg`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${locked ? 'bg-black/20' : 'bg-gray-700 group-hover:bg-gray-600 text-gray-400 group-hover:text-white'}`}>
                                        {['A', 'B', 'C', 'D'][idx]}
                                    </span>
                                    <span className="text-lg font-bold text-white flex-1"><MathText>{opt.text}</MathText></span>
                                    {locked && opt.isCorrect && myAnswer === 'correct' && <CheckCircle className="w-6 h-6 text-white" />}
                                    {locked && !opt.isCorrect && myAnswer === 'wrong' && <XCircle className="w-6 h-6 text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {locked && <div className="mt-8 text-gray-400 animate-pulse flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Keyingi savolga o'tilmoqda...</div>}
            </div>
        </div>
    );
};

const Loader = () => <div className="flex justify-center items-center h-64 text-indigo-500"><Loader2 className="w-10 h-10 animate-spin" /></div>;

export default DuelGame;