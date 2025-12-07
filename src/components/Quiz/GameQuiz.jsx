import React, { useState, useEffect, useRef } from 'react';
import {
    Clock, Trophy, Flame, Shield, Zap,
    CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2'; // Loyihangizda bor
import MathText from './MathText';

const GameQuiz = ({ onExit }) => {
    // O'yin holatlari
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timer, setTimer] = useState(15);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerStatus, setAnswerStatus] = useState(null); // correct, wrong

    // Ovoz effekti uchun (Loyihangizdagi mavjud fayl)
    const audioRef = useRef(new Audio('/assets/audio/Water_Lily.mp3'));

    // NAMUNA SAVOLLAR (Sinfingizga moslab o'zgartirasiz)
    const questions = [
        {
            id: 1,
            question: "Kompyuterning 'miyasi' deb qaysi qurilma aytiladi?",
            options: [
                { id: 'a', text: "Qattiq disk (HDD)" },
                { id: 'b', text: "Protsessor (CPU)", isCorrect: true },
                { id: 'c', text: "Operativ xotira (RAM)" },
                { id: 'd', text: "Videokarta (GPU)" }
            ]
        },
        {
            id: 2,
            question: "1 Bayt necha bitga teng?",
            options: [
                { id: 'a', text: "10" },
                { id: 'b', text: "100" },
                { id: 'c', text: "8", isCorrect: true },
                { id: 'd', text: "1024" }
            ]
        },
        {
            id: 3,
            question: "Web sahifalar qaysi tilda yoziladi?",
            options: [
                { id: 'a', text: "HTML", isCorrect: true },
                { id: 'b', text: "Python" },
                { id: 'c', text: "C++" },
                { id: 'd', text: "Java" }
            ]
        },
        {
            id: 4,
            question: "Ctrl + C tugmalar birikmasi nima qiladi?",
            options: [
                { id: 'a', text: "Kesib olish" },
                { id: 'b', text: "Nusxa olish", isCorrect: true },
                { id: 'c', text: "Joylashtirish" },
                { id: 'd', text: "O'chirish" }
            ]
        }
    ];

    // Taymer logikasi (Psixologiya: Vaqt bosimi)
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && timer > 0 && !answerStatus) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && !answerStatus) {
            handleTimeUp();
        }
        return () => clearInterval(interval);
    }, [timer, gameState, answerStatus]);

    const handleTimeUp = () => {
        setAnswerStatus('wrong');
        setStreak(0);
        setTimeout(nextQuestion, 2000);
    };

    const playSound = () => {
        try {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play error:", e));
        } catch (e) {
            console.error("Sound error");
        }
    };

    const handleAnswer = (option) => {
        if (answerStatus) return;

        setSelectedOption(option);

        if (option.isCorrect) {
            setAnswerStatus('correct');
            playSound(); // Ovozli mukofot

            // Ball hisoblash: Tezlik va Combo muhim
            const timeBonus = timer * 10;
            const streakBonus = streak * 50;
            const points = 100 + timeBonus + streakBonus;

            setScore(prev => prev + points);
            setStreak(prev => prev + 1);

            // Kichik "SweetAlert" xabarnomasi (Dizayn)
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });

            Toast.fire({
                icon: 'success',
                title: `+${points} ball! Ajoyib!`
            });

        } else {
            setAnswerStatus('wrong');
            setStreak(0);

            Swal.fire({
                icon: 'error',
                title: 'Xato!',
                text: 'Afsuski noto\'g\'ri javob.',
                timer: 1000,
                showConfirmButton: false
            });
        }

        setTimeout(nextQuestion, 2000);
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setTimer(15);
            setAnswerStatus(null);
            setSelectedOption(null);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        setGameState('finished');
        // Katta bayramona oyna (Dizayn)
        Swal.fire({
            title: 'O\'yin Tugadi!',
            text: `Sizning natijangiz: ${score} ball`,
            icon: 'success',
            background: '#fff url(/assets/img/illustrations/pricing-basic.png) no-repeat right top',
            backdrop: `
                rgba(0,0,123,0.4)
                url("/assets/img/elements/activity-timeline.png")
                left top
                no-repeat
            `,
            confirmButtonText: 'Qoyil!',
            confirmButtonColor: '#696cff'
        });
    };

    // 1. KIRISH QISMI (INTRO)
    if (gameState === 'intro') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
                <div className="text-center max-w-lg w-full bg-white p-8 rounded-3xl shadow-2xl border border-indigo-100 animate__animated animate__zoomIn">
                    <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 animate__animated animate__pulse animate__infinite">
                        <Trophy className="w-16 h-16 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-800 mb-4 font-sans">Bilimlar Janggi</h1>
                    <p className="text-gray-500 mb-8 text-lg">
                        Sinfdoshlaringiz bilan bellashing! <br />
                        <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded mt-2 inline-block">
                            ⚡️ Tezlik muhim
                        </span>
                    </p>

                    <button
                        onClick={() => setGameState('playing')}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg shadow-indigo-300 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                        <Zap className="w-6 h-6 fill-current" />
                        O'yinni Boshlash
                    </button>
                </div>
            </div>
        );
    }

    // 3. NATIJA QISMI
    if (gameState === 'finished') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border-t-8 border-green-500 animate__animated animate__fadeInUp">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Tabriklaymiz!</h2>
                    <p className="text-gray-500 mb-8">Siz barcha savollarga javob berdingiz.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                        <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Yakuniy Ball</div>
                        <div className="text-5xl font-black text-indigo-600 tracking-tight">{score}</div>
                    </div>

                    <button
                        onClick={onExit}
                        className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                    >
                        Bosh sahifaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQIndex];

    // 2. O'YIN JARAYONI
    return (
        <div className="max-w-4xl mx-auto my-4 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 min-h-[600px] flex flex-col">
            {/* Header: Statistika */}
            <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border-2 ${streak > 1 ? 'bg-orange-50 text-orange-600 border-orange-200 animate__animated animate__pulse' : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                        <Flame className={`w-5 h-5 ${streak > 1 ? 'fill-orange-500' : ''}`} />
                        <span>{streak}x Combo</span>
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold border-2 border-indigo-100 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {score}
                    </div>
                </div>

                {/* Katta Taymer */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                        <circle
                            cx="32" cy="32" r="28"
                            stroke={timer < 5 ? "#ef4444" : "#3b82f6"}
                            strokeWidth="6" fill="none"
                            strokeDasharray="175"
                            strokeDashoffset={175 - (175 * timer) / 15}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <span className={`text-xl font-bold ${timer < 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{timer}</span>
                </div>
            </div>

            {/* Savol qismi */}
            <div className="flex-1 p-8 flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50">
                <div className="w-full max-w-3xl text-center mb-10 animate__animated animate__fadeIn">
                    <span className="text-indigo-500 font-bold tracking-wider text-sm uppercase mb-3 block">Savol {currentQIndex + 1} / {questions.length}</span>
                    <MathText className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                        {currentQ.question}
                    </MathText>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                    {currentQ.options.map((option, idx) => {
                        let btnClass = "bg-white border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:shadow-md";
                        let icon = <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{['A', 'B', 'C', 'D'][idx]}</div>;

                        if (answerStatus) {
                            if (option.isCorrect) {
                                btnClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 scale-105 z-10";
                                icon = <CheckCircle className="w-8 h-8 text-white" />;
                            } else if (selectedOption?.id === option.id) {
                                btnClass = "bg-red-500 border-red-500 text-white opacity-50";
                                icon = <XCircle className="w-8 h-8 text-white" />;
                            } else {
                                btnClass = "bg-gray-50 border-gray-100 text-gray-300 scale-95 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(option)}
                                disabled={!!answerStatus}
                                className={`
                                    group relative p-6 rounded-2xl font-bold text-lg text-left transition-all duration-200 flex items-center gap-4
                                    ${btnClass}
                                `}
                            >
                                {icon}
                                <span className="flex-1">{option.text}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GameQuiz;