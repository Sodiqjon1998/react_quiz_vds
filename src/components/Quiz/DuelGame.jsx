import React, { useState, useEffect, useCallback } from 'react';
import { Swords, Trophy, Zap, User } from 'lucide-react';
import Swal from 'sweetalert2';
import MathText from './MathText';

const DuelGame = ({ onExit }) => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [currentQIndex, setCurrentQIndex] = useState(0);

    // O'yinchilar holati
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);
    const [p1Status, setP1Status] = useState(null); // 'correct', 'wrong', 'waiting'
    const [p2Status, setP2Status] = useState(null);
    const [winner, setWinner] = useState(null);

    // NAMUNA SAVOLLAR (Bu yerni bazadan keladigan qilasiz)
    const questions = [
        {
            id: 1,
            question: "Eng tez yuguradigan hayvon?",
            options: ["Sher", "Gepard", "Ot", "Quyon"],
            correct: 1 // Index (0 dan boshlanadi, demak B javob)
        },
        {
            id: 2,
            question: "O'zbekiston poytaxti?",
            options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"],
            correct: 2
        },
        {
            id: 3,
            question: "React bu ...?",
            options: ["Kutubxona", "Framework", "Til", "Brauzer"],
            correct: 0
        },
        {
            id: 4,
            question: "2 + 2 * 2 = ?",
            options: ["8", "6", "4", "10"],
            correct: 1
        },
        {
            id: 5,
            question: "Qaysi sayyora Qizil sayyora deb ataladi?",
            options: ["Venera", "Mars", "Yupiter", "Saturn"],
            correct: 1
        }
    ];

    // Klaviatura boshqaruvi
    const handleKeyDown = useCallback((event) => {
        if (gameState !== 'playing' || p1Status || p2Status) return;

        const key = event.key;
        const currentQ = questions[currentQIndex];

        // PLAYER 1 Controls (1, 2, 3, 4)
        if (['1', '2', '3', '4'].includes(key)) {
            const selectedIdx = parseInt(key) - 1;
            checkAnswer(1, selectedIdx, currentQ.correct);
        }

        // PLAYER 2 Controls (7, 8, 9, 0)
        if (['7', '8', '9', '0'].includes(key)) {
            const selectedIdx = key === '0' ? 3 : parseInt(key) - 7;
            checkAnswer(2, selectedIdx, currentQ.correct);
        }
    }, [gameState, currentQIndex, p1Status, p2Status]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const checkAnswer = (player, selectedIdx, correctIdx) => {
        if (selectedIdx === correctIdx) {
            // TO'G'RI JAVOB
            if (player === 1) {
                setP1Status('correct');
                setP1Score(prev => prev + 1);
            } else {
                setP2Status('correct');
                setP2Score(prev => prev + 1);
            }

            // 1 soniyadan keyin keyingi savol
            setTimeout(nextQuestion, 1500);
        } else {
            // XATO JAVOB
            if (player === 1) {
                setP1Status('wrong');
                // Jarima (ixtiyoriy)
                // setP1Score(prev => Math.max(0, prev - 1)); 
            } else {
                setP2Status('wrong');
            }
            // Xato qilganda o'yin to'xtamaydi, narigi o'yinchi javob berishi mumkin
            // Yoki darhol keyingi savolga o'tish mumkin:
            setTimeout(nextQuestion, 1000);
        }
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setP1Status(null);
            setP2Status(null);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        setGameState('finished');
        if (p1Score > p2Score) setWinner(1);
        else if (p2Score > p1Score) setWinner(2);
        else setWinner('draw');
    };

    // --- RENDER QISMI ---

    if (gameState === 'intro') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-900 p-4">
                <div className="max-w-4xl w-full bg-gray-800 rounded-3xl p-10 text-center shadow-2xl border border-gray-700 animate__animated animate__zoomIn">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Swords className="w-24 h-24 text-red-500 animate-pulse" />
                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-30"></div>
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">DUEL REJIMI</h1>
                    <p className="text-gray-400 text-xl mb-10">Kim kuchliroq? Bilimlar jangida aniqlang!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/30">
                            <h3 className="text-blue-400 font-bold text-lg mb-2">🔵 1-O'yinchi (Chap)</h3>
                            <div className="flex justify-center gap-2">
                                {['1', '2', '3', '4'].map(k => (
                                    <span key={k} className="w-10 h-10 rounded-lg bg-gray-700 text-white flex items-center justify-center font-mono font-bold border-b-4 border-gray-900">{k}</span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-red-900/30 p-6 rounded-2xl border border-red-500/30">
                            <h3 className="text-red-400 font-bold text-lg mb-2">🔴 2-O'yinchi (O'ng)</h3>
                            <div className="flex justify-center gap-2">
                                {['7', '8', '9', '0'].map(k => (
                                    <span key={k} className="w-10 h-10 rounded-lg bg-gray-700 text-white flex items-center justify-center font-mono font-bold border-b-4 border-gray-900">{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setGameState('playing')}
                        className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-red-900/50"
                    >
                        JANGNI BOSHLASH ⚔️
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-900 p-4">
                <div className="bg-gray-800 rounded-3xl p-10 text-center max-w-2xl w-full border border-gray-700">
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce" />

                    <h2 className="text-4xl font-bold text-white mb-2">O'yin Yakunlandi!</h2>

                    <div className="text-2xl font-bold mb-8 text-gray-300">
                        {winner === 'draw' ?
                            "Do'stlik g'alaba qozondi! 🤝" :
                            <span className={winner === 1 ? "text-blue-400" : "text-red-400"}>
                                {winner === 1 ? "1-O'yinchi" : "2-O'yinchi"} G'olib! 🏆
                            </span>
                        }
                    </div>

                    <div className="flex justify-center gap-10 mb-10">
                        <div className="text-center">
                            <div className="text-blue-400 font-bold mb-1">Player 1</div>
                            <div className="text-5xl font-black text-white">{p1Score}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-600 font-bold text-4xl pt-2">:</div>
                        </div>
                        <div className="text-center">
                            <div className="text-red-400 font-bold mb-1">Player 2</div>
                            <div className="text-5xl font-black text-white">{p2Score}</div>
                        </div>
                    </div>

                    <button
                        onClick={onExit}
                        className="px-8 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600"
                    >
                        Chiqish
                    </button>
                </div>
            </div>
        );
    }

    // O'YIN JARAYONI EKRANI
    const currentQ = questions[currentQIndex];

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col bg-gray-900 overflow-hidden rounded-3xl border border-gray-800 shadow-2xl relative">

            {/* Savol Qismi (O'rtada) */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 flex flex-col items-center">
                <div className="bg-gray-800/90 backdrop-blur px-8 py-4 rounded-2xl border border-gray-700 shadow-xl max-w-3xl w-full text-center">
                    <span className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1 block">Savol {currentQIndex + 1}</span>
                    <MathText className="text-2xl md:text-3xl font-bold text-white">
                        {currentQ.question}
                    </MathText>
                </div>
            </div>

            {/* SPLIT SCREEN */}
            <div className="flex-1 flex w-full relative">

                {/* --- PLAYER 1 (CHAP) --- */}
                <div className={`flex-1 relative flex flex-col justify-end p-6 border-r border-gray-800 transition-colors duration-300 ${p1Status === 'correct' ? 'bg-green-900/40' : p1Status === 'wrong' ? 'bg-red-900/40' : 'bg-blue-900/10'}`}>

                    {/* Score */}
                    <div className="absolute top-24 left-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-blue-400">P1</div>
                            <span className="text-5xl font-black text-white/20">{p1Score}</span>
                        </div>
                    </div>

                    {/* Options P1 */}
                    <div className="space-y-3 mb-10 max-w-md mx-auto w-full">
                        {currentQ.options.map((opt, idx) => (
                            <div key={idx} className={`
                                p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                                ${p1Status === 'correct' && idx === currentQ.correct ? 'bg-green-600 border-green-500 text-white scale-105' :
                                    'bg-gray-800 border-gray-700 text-gray-300'}
                            `}>
                                <span className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center font-bold text-sm text-gray-400 border border-gray-600">
                                    {idx + 1}
                                </span>
                                <span className="font-bold">{opt}</span>
                            </div>
                        ))}
                    </div>

                    {/* Feedback */}
                    {p1Status && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm">
                            {p1Status === 'correct' ?
                                <Zap className="w-24 h-24 text-green-400 animate-bounce" /> :
                                <span className="text-6xl">❌</span>
                            }
                        </div>
                    )}
                </div>

                {/* --- PLAYER 2 (O'NG) --- */}
                <div className={`flex-1 relative flex flex-col justify-end p-6 transition-colors duration-300 ${p2Status === 'correct' ? 'bg-green-900/40' : p2Status === 'wrong' ? 'bg-red-900/40' : 'bg-red-900/10'}`}>

                    {/* Score */}
                    <div className="absolute top-24 right-6">
                        <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-red-400">P2</div>
                            <span className="text-5xl font-black text-white/20">{p2Score}</span>
                        </div>
                    </div>

                    {/* Options P2 */}
                    <div className="space-y-3 mb-10 max-w-md mx-auto w-full">
                        {currentQ.options.map((opt, idx) => (
                            <div key={idx} className={`
                                p-4 rounded-xl border-2 flex items-center justify-end gap-4 transition-all text-right
                                ${p2Status === 'correct' && idx === currentQ.correct ? 'bg-green-600 border-green-500 text-white scale-105' :
                                    'bg-gray-800 border-gray-700 text-gray-300'}
                            `}>
                                <span className="font-bold">{opt}</span>
                                <span className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center font-bold text-sm text-gray-400 border border-gray-600">
                                    {idx === 3 ? '0' : idx + 7}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Feedback */}
                    {p2Status && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm">
                            {p2Status === 'correct' ?
                                <Zap className="w-24 h-24 text-green-400 animate-bounce" /> :
                                <span className="text-6xl">❌</span>
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuelGame;