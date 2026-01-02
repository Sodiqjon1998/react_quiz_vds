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
// PUSHER KONFIGURATSIYA
// ---------------------------------------------------------
window.Pusher = Pusher;

const initEcho = () => {
    if (window.Echo) {
        const state = window.Echo.connector?.pusher?.connection?.state;
        if (state === 'connected' || state === 'connecting') {
            console.log('✅ Echo allaqachon mavjud:', state);
            return window.Echo;
        }
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ Token topilmadi!');
        return null;
    }

    console.log('🔧 Yangi Echo instance yaratilmoqda...');

    // ✅ PUSHER CLOUD (Ishonchli va oson)
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: '5a6dd1db7c4788e06a7b', // ✅ Yangi Pusher key
        cluster: 'ap2', // ✅ Asia Pacific (Singapore)

        // ✅ Pusher cloud WebSocket
        forceTLS: true,
        encrypted: true,
        enabledTransports: ['ws', 'wss'],
        disableStats: true, // ✅ AdBlock xatosini oldini olish

        // ✅ Auth endpoint (Railway URL bilan)
        authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,

        auth: {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        },

        // ✅ Custom authorizer
        authorizer: (channel, options) => {
            return {
                authorize: (socketId, callback) => {
                    console.log('🔐 Authorizing channel:', channel.name, 'socket:', socketId);

                    fetch(`${API_BASE_URL}/api/broadcasting/auth`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify({
                            socket_id: socketId,
                            channel_name: channel.name
                        })
                    })
                        .then(response => {
                            console.log('📥 Auth response status:', response.status);
                            if (!response.ok) {
                                throw new Error(`HTTP ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('✅ Auth muvaffaqiyatli:', data);
                            callback(null, data);
                        })
                        .catch(error => {
                            console.error('❌ Broadcasting auth xatosi:', error);
                            callback(error, null);
                        });
                }
            };
        },
    });

    // ✅ Connection event listeners
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log("✅ PUSHER: Connected");
        console.log("🔌 Socket ID:", window.Echo.socketId());
    });

    window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.log("🔴 PUSHER: Disconnected");
    });

    window.Echo.connector.pusher.connection.bind('error', (err) => {
        console.error("❌ PUSHER Error:", err);
    });


    window.Echo.connector.pusher.connection.bind('state_change', (states) => {
        console.log("🔄 Pusher state:", states.previous, '→', states.current);
    });

    return window.Echo;
};

// ---------------------------------------------------------
// YORDAMCHI FUNKSIYALAR
// ---------------------------------------------------------
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-cyan-500',
        'bg-teal-500', 'bg-orange-500',
    ];

    const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
};

// ---------------------------------------------------------
// ASOSIY KOMPONENT
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
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    });

    const [onlineUsers, setOnlineUsers] = useState({});
    const quizzesRef = useRef([]);

    useEffect(() => {
        quizzesRef.current = quizzes;
    }, [quizzes]);

    // ✅ PUSHER KANALLARINI TINGLASH
    useEffect(() => {
        if (!currentUser) {
            console.warn('⚠️ CurrentUser mavjud emas');
            return;
        }

        // ✅ Echo faqat SHU YERDA yaratiladi
        const echoInstance = initEcho();

        if (!echoInstance) {
            console.error('❌ Echo yaratilmadi!');
            return;
        }

        console.log('🎧 Kanallarni tinglash boshlandi...');

        const privateChannel = echoInstance.private(`user.${currentUser.id}`);
        const presenceChannel = echoInstance.join('presence-online')
            .here((members) => {
                console.log('📋 Online foydalanuvchilar:', members);
                const initialOnline = members.reduce((acc, member) => {
                    const cleanId = String(member.id).trim();
                    acc[cleanId] = member.info || member;
                    return acc;
                }, {});
                setOnlineUsers(initialOnline);
            })
            .joining((member) => {
                const cleanId = String(member.id).trim();
                console.log(`🟢 Qo'shildi: ${cleanId}`);
                setOnlineUsers(prev => ({ ...prev, [cleanId]: member.info || member }));
            })
            .leaving((member) => {
                const cleanId = String(member.id).trim();
                console.log(`🔴 Chiqdi: ${cleanId}`);
                setOnlineUsers(prev => {
                    const newState = { ...prev };
                    delete newState[cleanId];
                    return newState;
                });
            });

        privateChannel.listen('.DuelChallenge', (e) => {
            console.log('📨 Duel Challenge keldi:', e);
            console.log('📦 Event ma\'lumotlari:', {
                challenger: e.challenger,
                quizId: e.quizId,
                subjectId: e.subjectId
            });

            // ✅ Agar ma'lumotlar to'liq kelmasa
            if (!e.challenger || !e.quizId || !e.subjectId) {
                console.error('❌ Event ma\'lumotlari to\'liq emas!');
                return;
            }

            const subjectName = quizzesRef.current
                .find(q => String(q.subject.id) === String(e.subjectId))
                ?.subject.name || 'Noma\'lum';

            Swal.fire({
                title: 'Duelga chaqiruv!',
                html: `<span class="text-lg font-bold" style="color: #D97642;">${e.challenger.first_name}</span> sizni jangga chorlamoqda!<br>Fan: <b>${subjectName}</b>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Qabul qilish',
                cancelButtonText: 'Rad etish',
                confirmButtonColor: '#D97642',
                cancelButtonColor: '#6B7280',
            }).then((result) => {
                if (result.isConfirmed) {
                    acceptChallenge(e.challenger, e.quizId, e.subjectId);
                }
            });
        });

        privateChannel.listen('.DuelAccepted', (e) => {
            console.log('✅ Duel qabul qilindi:', e);

            if (window.duelChallengeTimeout) {
                clearTimeout(window.duelChallengeTimeout);
                delete window.duelChallengeTimeout;
            }

            Swal.close();

            const acceptedQuiz = quizzesRef.current.find(q => String(q.id) === String(e.quizId));
            setSelectedQuiz(acceptedQuiz || { id: String(e.quizId), subject: { id: String(e.subjectId) }, name: "Duel Quiz" });
            setOpponent(e.accepter);
            setView('game');

            setTimeout(() => {
                Swal.fire({
                    title: 'Jang Boshlandi!',
                    toast: true,
                    position: 'top-end',
                    timer: 2000,
                    showConfirmButton: false
                });
            }, 500);
        });

        return () => {
            console.log('🔌 Kanallardan uzilish...');
            echoInstance.leave('presence-online');
            echoInstance.leave(`user.${currentUser.id}`);
        };

    }, [currentUser]);

    const sendChallenge = async (target) => {
        if (!selectedQuiz) return;

        const currentQuiz = selectedQuiz;

        try {
            console.log('🎯 Challenge yuborilmoqda:', {
                target: target.name,
                quiz: currentQuiz.name,
                token: localStorage.getItem('token') ? 'Mavjud ✅' : 'YO\'Q ❌'
            });

            Swal.fire({
                title: 'Kutilmoqda...',
                html: `<b>${target.name}</b> javobini kuting...`,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const timeoutId = setTimeout(() => {
                Swal.fire({
                    title: 'Vaqt tugadi',
                    text: 'Raqib javob bermadi',
                    icon: 'warning',
                });
            }, 30000);

            window.duelChallengeTimeout = timeoutId;

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/quiz/duel/challenge`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target_user_id: target.id,
                    quiz_id: currentQuiz.id,
                    subject_id: currentQuiz.subject.id
                })
            });

            if (!response.ok) {
                throw new Error('Network error');
            }

            console.log('✅ Challenge yuborildi');
            setSelectedQuiz(currentQuiz);

        } catch (e) {
            console.error('❌ Xatolik:', e);

            if (window.duelChallengeTimeout) {
                clearTimeout(window.duelChallengeTimeout);
                delete window.duelChallengeTimeout;
            }

            Swal.fire('Xatolik', 'Tarmoq xatosi', 'error');
        }
    };


    const acceptChallenge = async (challenger, quizId, subjectId) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/api/quiz/duel/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challenger_id: challenger.id,
                    quiz_id: quizId,
                    subject_id: subjectId
                })
            });

            const data = await response.json();
            console.log('✅ Accept response:', data);

            const acceptedQuiz = quizzes.find(q => q.id === quizId);

            if (acceptedQuiz) {
                setSelectedQuiz(acceptedQuiz);
                setOpponent(challenger);
                setView('game');
            } else {
                setSelectedQuiz({
                    id: quizId,
                    subject: { id: subjectId },
                    name: "Duel Quiz"
                });
                setOpponent(challenger);
                setView('game');
            }

        } catch (e) {
            console.error("❌ Duel qabul qilishda xatolik:", e);
            Swal.fire('Xatolik', 'So\'rov qabul qilinmadi', 'error');
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [qRes, cRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/quiz/duel/list`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }),
                    fetch(`${API_BASE_URL}/api/quiz/duel/classmates`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    })
                ]);

                const qData = await qRes.json();
                const cData = await cRes.json();

                if (qData.success) setQuizzes(qData.data);

                if (cData.success) {
                    const formattedClassmates = cData.data.map(c => ({
                        ...c,
                        id: String(c.id).trim()
                    }));
                    setClassmates(formattedClassmates);
                }
            } catch (e) {
                console.error('❌ Ma\'lumot yuklashda xatolik:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);


    if (view === 'list') return (
        <div className="min-h-screen bg-white p-4 sm:p-6 font-sans text-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
                            <Swords className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#D97642' }} />
                            DUEL ARENASI
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">Bilimingizni sinash uchun maydon tanlang</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {loading ? <Loader /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {quizzes.filter(q => q.name.toLowerCase().includes(searchQuery.toLowerCase())).map(quiz => (
                            <div
                                key={quiz.id}
                                onClick={() => { setSelectedQuiz(quiz); setView('opponent'); }}
                                className="group bg-white p-5 sm:p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg cursor-pointer transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase">
                                        {quiz.subject.name}
                                    </span>
                                    <Zap className="w-6 h-6 text-orange-400 group-hover:text-orange-600 transition-colors" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {quiz.name}
                                </h3>
                                <p className="text-gray-600 text-sm flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> {quiz.questions_count} ta savol
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (view === 'opponent') return (
        <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center text-white">
            <button
                onClick={() => { setView('list'); setSelectedQuiz(null); }}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Orqaga
            </button>

            <h2 className="text-3xl font-bold mb-2">Raqibni Tanlang</h2>
            <p className="text-gray-400 mb-10">Kim bilan kuch sinashmoqchisiz?</p>


            {loading ? <Loader /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-5xl">
                    {classmates.map(student => {
                        const studentIdString = String(student.id).trim();
                        const isOnline = !!onlineUsers[studentIdString];

                        if (student.id === String(currentUser.id).trim()) return null;

                        return (
                            <div
                                key={student.id}
                                onClick={() => isOnline && sendChallenge(student)}
                                className={`bg-gray-800 p-4 rounded-2xl border border-gray-700 transition-all text-center group shadow-lg 
                                    ${isOnline ? 'hover:border-indigo-500 hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <div className={`w-20 h-20 mx-auto mb-4 rounded-full border-2 border-gray-600 group-hover:border-indigo-500 transition-colors flex items-center justify-center text-2xl font-black text-white ${getAvatarColor(student.name)}`}>
                                    {getInitials(student.name)}
                                </div>

                                <h4 className="font-bold text-gray-200 group-hover:text-indigo-400 truncate">
                                    {student.name}
                                </h4>

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

    return <ActiveGame
        quiz={selectedQuiz}
        opponent={opponent}
        currentUser={currentUser}
        echo={window.Echo}
        onBack={() => {
            if (window.confirm("Chiqish?")) {
                setView('list');
                setOpponent(null);
            }
        }}
    />;
};

// ---------------------------------------------------------
// ACTIVE GAME
// ---------------------------------------------------------
const ActiveGame = ({ quiz, opponent, currentUser, echo, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currIdx, setCurrIdx] = useState(0);
    const [gameState, setGameState] = useState('intro');

    const [myScore, setMyScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);

    const [locked, setLocked] = useState(false);
    const [myAnswer, setMyAnswer] = useState(null);
    const [oppAnswer, setOppAnswer] = useState(null);

    const questionsRef = useRef([]);
    const currIdxRef = useRef(0);
    const isRoundOver = useRef(false);

    const correctSfx = useRef(new Audio('/assets/audio/Water_Lily.mp3'));
    const oppName = opponent?.short_name || opponent?.name || "Raqib";

    useEffect(() => { questionsRef.current = questions; }, [questions]);
    useEffect(() => { currIdxRef.current = currIdx; }, [currIdx]);

    useEffect(() => {
        if (!echo || !currentUser) return;
        const channel = echo.private(`user.${currentUser.id}`);

        channel.listen('.DuelGameState', (e) => {
            if (e.type === 'answer') {
                setLocked(true);
                isRoundOver.current = true;

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

                const actorName = isMe ? "Siz" : oppName;
                Swal.fire({
                    title: `${actorName} birinchi bo'ldi!`,
                    text: isCorrect ? "To'g'ri topdi" : "Xato qildi",
                    icon: isCorrect ? 'success' : 'error',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });

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

    useEffect(() => {
        if (!quiz || !quiz.id || !quiz.subject || !quiz.subject.id) {
            return;
        }

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

    }, [quiz]);

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
                body: JSON.stringify({
                    opponent_id: opponent.id,
                    type,
                    data: { ...data, question_index: currIdxRef.current }
                })
            });
        } catch (e) { console.error(e); }
    };

    const handleAnswer = (opt) => {
        if (locked || isRoundOver.current) return;

        setLocked(true);
        isRoundOver.current = true;

        broadcastState('answer', { isCorrect: opt.isCorrect });
    };

    const handleNextQuestion = () => {
        setMyAnswer(null);
        setOppAnswer(null);
        setLocked(false);
        isRoundOver.current = false;

        setCurrIdx(prev => prev + 1);
    };

    if (questions.length === 0) return (
        <div className="h-screen bg-white flex items-center justify-center" style={{ color: '#D97642' }}>
            <Loader2 className="w-12 h-12 animate-spin" />
        </div>
    );


    if (gameState === 'intro') return (
        <div className="h-screen bg-white flex items-center justify-center text-gray-900">
            <h1 className="text-4xl sm:text-6xl font-black animate-pulse" style={{ color: '#D97642' }}>
                TAYYORLANING...
            </h1>
        </div>
    );

    if (gameState === 'finished') {
        const iWon = myScore > oppScore;
        const isDraw = myScore === oppScore;
        return (
            <div className="h-screen bg-white flex items-center justify-center text-gray-900 p-4">
                <div className="bg-white p-8 sm:p-12 rounded-2xl text-center border-2 border-gray-200 shadow-xl w-full max-w-lg">
                    {iWon ? (
                        <Trophy className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 animate-bounce" style={{ color: '#D97642' }} />
                    ) : isDraw ? (
                        <Swords className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6" style={{ color: '#D97642' }} />
                    ) : (
                        <Trophy className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-gray-400" />
                    )}
                    <h2 className={`text-3xl sm:text-5xl font-black mb-2 ${iWon ? 'text-orange-600' : isDraw ? 'text-orange-500' : 'text-gray-500'}`}>
                        {iWon ? "G'ALABA!" : isDraw ? "DURANG" : "MAG'LUBIYAT"}
                    </h2>
                    <div className="flex justify-center gap-6 my-6 text-3xl sm:text-4xl font-bold">
                        <span style={{ color: '#D97642' }}>{myScore}</span>
                        <span className="text-gray-400">:</span>
                        <span className="text-gray-600">{oppScore}</span>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full py-3 sm:py-4 rounded-lg font-bold text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#D97642' }}
                    >
                        Chiqish
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[currIdx];
    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden select-none font-sans text-gray-900">
            <div className="h-16 sm:h-20 bg-white border-b-2 border-gray-200 flex justify-between items-center px-4 sm:px-8">
                <div>
                    <div className="text-gray-600 text-xs font-bold">SIZ</div>
                    <div className="text-xl sm:text-2xl font-black" style={{ color: '#D97642' }}>{myScore}</div>
                </div>
                <div className="bg-gray-100 px-3 sm:px-4 py-1 rounded-full font-bold text-sm sm:text-base">
                    {currIdx + 1} / {questions.length}
                </div>
                <div className="text-right">
                    <div className="text-gray-600 text-xs font-bold">{oppName}</div>
                    <div className="text-xl sm:text-2xl font-black text-gray-700">{oppScore}</div>
                </div>
            </div>

            <div className="w-full h-1 bg-gray-200">
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${((currIdx + 1) / questions.length) * 100}%`, backgroundColor: '#D97642' }}
                ></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 max-w-5xl mx-auto w-full overflow-y-auto">
                <div className="mb-6 sm:mb-10 text-center px-2">
                    <MathText className="text-xl sm:text-3xl font-bold text-gray-900">{q.question}</MathText>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                    {q.options.map((opt, idx) => {
                        let statusClass = "bg-white border-gray-300 hover:bg-gray-50";
                        if (locked) {
                            if (myAnswer === 'correct' && opt.isCorrect) statusClass = "bg-green-50 border-green-500";
                            else if (myAnswer === 'wrong' && !opt.isCorrect) statusClass = "bg-red-50 border-red-500";
                            else if (oppAnswer === 'correct' && opt.isCorrect) statusClass = "bg-orange-50 border-orange-500";
                            else statusClass = "bg-gray-50 opacity-50 border-gray-200";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(opt)}
                                disabled={locked || isRoundOver.current}
                                className={`p-4 sm:p-6 rounded-xl border-2 text-left transition-all ${statusClass} ${(!locked && !isRoundOver.current) && 'hover:border-orange-500'}`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="font-bold text-gray-600 text-sm sm:text-base">{['A', 'B', 'C', 'D'][idx]}</span>
                                    <span className="font-bold text-base sm:text-lg text-gray-900">
                                        <MathText>{opt.text}</MathText>
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {(locked || isRoundOver.current) && (
                    <div className="mt-8 font-bold animate-pulse" style={{ color: '#D97642' }}>
                        Javob tekshirilmoqda...
                    </div>
                )}
            </div>
        </div>
    );
};

const Loader = () => (
    <div className="flex justify-center items-center h-64" style={{ color: '#D97642' }}>
        <Loader2 className="w-10 h-10 animate-spin" />
    </div>
);

export default DuelGame;

