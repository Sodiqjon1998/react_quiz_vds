import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Upload, Mic, Play, Square, RefreshCw, File as FileIcon, TrendingUp, CheckCircle, XCircle, AlertCircle, HardDrive } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Trash2 } from 'lucide-react'; // Icon import qiling

const TELEGRAM_BOT_TOKEN = '7592801638:AAEClfSkBNUweKdfJkB7_C2zfrOmOKc20r4';

function Kitobxonlik() {
    const [recordings, setRecordings] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [showMicTab, setShowMicTab] = useState(false);
    const [bookName, setBookName] = useState('');
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUserProfile(JSON.parse(userData));
            } catch (err) {
                console.error('User data parsing error:', err);
            }
        }
        fetchReadings();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    const sendToTelegram = async (studentName, bookTitle, audioFile = null, durationSeconds = 0) => {
        const classInfo = userProfile?.class;

        if (!classInfo) {
            console.error('Class info not found');
            return false;
        }

        const CHAT_ID = classInfo.telegram_chat_id;
        const TOPIC_ID = classInfo.reading_topic_id; // ✅ Kitobxonlik uchun reading_topic_id

        if (!CHAT_ID) {
            console.error('Telegram chat ID not found');
            return false;
        }

        const date = new Date().toLocaleDateString('uz-UZ', {
            day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
        });

        const formatDuration = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        try {
            // Agar audio fayl bo'lsa, uni Telegram ga yuborish
            if (audioFile) {
                const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
                const formData = new FormData();

                formData.append('chat_id', CHAT_ID);
                formData.append('document', audioFile);
                formData.append('caption', `📚 <b>Kitob O'qildi!</b>\n\n👤 <b>O'quvchi:</b> ${studentName}\n🏫 <b>Sinf:</b> ${classInfo.name}\n📖 <b>Kitob:</b> ${bookTitle}\n⏱ <b>Davomiyligi:</b> ${formatDuration(durationSeconds)}\n📅 <b>Sana:</b> ${date}`);
                formData.append('parse_mode', 'HTML');

                if (TOPIC_ID && TOPIC_ID !== '0' && TOPIC_ID !== 0) {
                    formData.append('message_thread_id', parseInt(TOPIC_ID));
                }

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                return data.ok;
            } else {
                // Audio yo'q bo'lsa, oddiy xabar
                const message = `
📚 <b>Kitob O'qildi!</b>

👤 <b>O'quvchi:</b> ${studentName}
🏫 <b>Sinf:</b> ${classInfo.name}
📖 <b>Kitob:</b> ${bookTitle}
📅 <b>Sana:</b> ${date}

✅ Kitob muvaffaqiyatli o'qildi!
                `.trim();

                const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
                const payload = { chat_id: CHAT_ID, text: message, parse_mode: 'HTML' };
                if (TOPIC_ID && TOPIC_ID !== '0' && TOPIC_ID !== 0) payload.message_thread_id = parseInt(TOPIC_ID);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                return data.ok;
            }
        } catch (error) {
            console.error('Telegram error:', error);
            return false;
        }
    };

    const fetchReadings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/readings?month=${selectedMonth + 1}&year=${selectedYear}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setRecordings(data.data.recordings);
                setStatistics(data.data.statistics);
            } else {
                console.error('API Error:', data.message);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('audio/')) {
            alert('Faqat audio fayllarni yuklash mumkin!');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            alert('Fayl hajmi 50MB dan oshmasligi kerak!');
            return;
        }
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!bookName.trim()) {
            alert('Iltimos, kitob nomini kiriting!');
            return;
        }

        if (!selectedFile) {
            alert('Iltimos, audio faylni tanlang!');
            return;
        }

        setUploading(true);

        try {
            const token = localStorage.getItem('token');

            // FormData yaratish
            const formData = new FormData();
            formData.append('audio', selectedFile);
            formData.append('book_name', bookName);

            // Server ga yuborish (server convert qiladi va Telegram ga yuboradi)
            const response = await fetch(`${API_BASE_URL}/api/readings/convert-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Audio muvaffaqiyatli MP3 ga convert qilindi va Telegram ga yuborildi!');
                setBookName('');
                setSelectedFile(null);
                fetchReadings();
            } else {
                alert('❌ Xatolik: ' + data.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('❌ Xatolik yuz berdi!');
        } finally {
            setUploading(false);
        }
    };

    const startRecording = async () => {
        if (!bookName.trim()) {
            alert('❌ Iltimos, avval kitob nomini kiriting!');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            };

            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/webm';
            }

            const recorder = new MediaRecorder(stream, options);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                    console.log('Audio chunk:', e.data.size, 'bytes');
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: options.mimeType });
                console.log('Recording finished. Total size:', blob.size, 'bytes');

                // Audio bo'sh emasligini tekshirish
                if (blob.size < 1000) {
                    alert('❌ Audio yozuv xato! Qayta urinib ko\'ring.');
                    setRecordedBlob(null);
                    return;
                }

                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());

                // Test: audio ni mahalliy ijro etish
                const audioURL = URL.createObjectURL(blob);
                const audio = new Audio(audioURL);
                console.log('Test audio playback...');
                audio.play().catch(err => console.error('Audio play error:', err));
            };

            recorder.start(100); // Har 100ms da chunk (to'liq audio uchun)
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

        } catch (err) {
            console.error('Mikrofon xatosi:', err);
            alert('❌ Mikrofonni yoqishda xatolik! Ruxsatlarni tekshiring.');
        }
    };


    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleUploadRecording = async () => {
        if (!recordedBlob) return;

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const safeBookName = bookName.trim().replace(/[^a-zA-Z0-9а-яА-ЯёЁўҚқҒғҲҳ\\s]/g, '').replace(/\\s+/g, '_');
            const fileName = `${safeBookName}_${Date.now()}.webm`;

            const file = new File([recordedBlob], fileName, { type: recordedBlob.type });

            // FormData yaratish
            const formData = new FormData();
            formData.append('audio', file);
            formData.append('book_name', bookName);

            // Server ga yuborish
            const response = await fetch(`${API_BASE_URL}/api/readings/convert-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Audio muvaffaqiyatli MP3 ga convert qilindi va Telegram ga yuborildi!');
                setBookName('');
                setRecordedBlob(null);
                setRecordingTime(0);
                fetchReadings();
            } else {
                alert('❌ Xatolik: ' + data.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('❌ Xatolik yuz berdi!');
        } finally {
            setUploading(false);
        }
    };

    // Delete funksiyasini qo'shing
    const handleDelete = async (id) => {
        if (!confirm('Ushbu audioni o\'chirmoqchimisiz?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/readings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Audio o\'chirildi!');
                fetchReadings(); // Ro'yxatni yangilash
            } else {
                alert('❌ Xatolik: ' + data.message);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Xatolik yuz berdi!');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
        return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

    const getCalendarData = () => {
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        const today = new Date();
        const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const hasRecording = recordings.some(r => {
                const recordDate = new Date(r.created_at);
                return recordDate.getDate() === day &&
                    recordDate.getMonth() === selectedMonth &&
                    recordDate.getFullYear() === selectedYear;
            });

            const isPast = isCurrentMonth ? day <= today.getDate() : true;
            const isFuture = isCurrentMonth ? day > today.getDate() : false;
            days.push({ day, hasRecording, isPast, isFuture });
        }
        return days;
    };

    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
                <div className="text-center">
                    <RefreshCw className="w-16 h-16 text-orange-500 mx-auto animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border-t-4 border-orange-500">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kitobxonlik</h1>
                            <p className="text-gray-600 text-sm mt-1">Har kuni kitob o'qib audio yuklang va taraqqiyotingizni kuzating</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-green-500 mb-1">{statistics?.completed_days || 0}</h2>
                        <p className="text-gray-600 text-sm font-medium">Yuklangan kunlar</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-red-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-red-500 mb-1">{statistics?.missed_days || 0}</h2>
                        <p className="text-gray-600 text-sm font-medium">O'tkazilgan kunlar</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-blue-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-blue-500 mb-1">{statistics?.total_duration || '00:00'}</h2>
                        <p className="text-gray-600 text-sm font-medium">Jami vaqt</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-yellow-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-yellow-500 mb-1">{statistics?.completion_rate || 0}%</h2>
                        <p className="text-gray-600 text-sm font-medium">To'liqlik darajasi</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-purple-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <HardDrive className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-purple-500 mb-1">{statistics?.total_storage_used || '0 MB'}</h2>
                        <p className="text-gray-600 text-sm font-medium">Jami hajm</p>
                    </div>
                </div>

                {/* Upload Section - Unchanged */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                        Bugungi kitob o'qishni yuklash
                    </h2>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setShowMicTab(false)}
                            className={`px-5 py-3 font-semibold text-sm transition-all flex items-center gap-2 ${!showMicTab
                                ? 'border-b-2 border-orange-500 text-orange-500'
                                : 'text-gray-600'
                                }`}
                        >
                            <FileIcon className="w-4 h-4" />
                            Fayl yuklash
                        </button>
                        <button
                            onClick={() => setShowMicTab(true)}
                            className={`px-5 py-3 font-semibold text-sm transition-all flex items-center gap-2 ${showMicTab
                                ? 'border-b-2 border-orange-500 text-orange-500'
                                : 'text-gray-600'
                                }`}
                        >
                            <Mic className="w-4 h-4" />
                            Mikrofon
                        </button>
                    </div>

                    {/* File Upload Tab */}
                    {!showMicTab && (
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Kitob nomi
                            </label>
                            <input
                                type="text"
                                placeholder="Masalan: O'tgan kunlar"
                                value={bookName}
                                onChange={(e) => setBookName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm mb-4 focus:border-orange-500 focus:outline-none transition-colors"
                            />

                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Audio fayl tanlash
                            </label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm mb-3 focus:border-orange-500 focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-gray-500 mb-4">
                                MP3, WAV, OGG formatlarida, maksimal 50MB
                            </p>

                            {selectedFile && (
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4 flex items-center gap-3">
                                    <FileIcon className="w-8 h-8 text-orange-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 truncate">{selectedFile.name}</div>
                                        <div className="text-xs text-gray-600">
                                            Hajm: {formatFileSize(selectedFile.size)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${selectedFile && !uploading
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
                            </button>
                        </div>
                    )}

                    {/* Microphone Tab - Unchanged */}
                    {showMicTab && (
                        <div className="text-center py-8">
                            {!isRecording && !recordedBlob && (
                                <>
                                    <div className="max-w-md mx-auto mb-6">
                                        <label className="block mb-2 text-sm font-medium text-gray-700 text-left">
                                            Kitob nomi
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Masalan: Sariq devning minorasi"
                                            value={bookName}
                                            onChange={(e) => setBookName(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={startRecording}
                                        className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center mx-auto mb-4"
                                    >
                                        <Mic className="w-10 h-10 text-white" />
                                    </button>
                                    <p className="text-gray-600 text-sm">
                                        Mikrofonni bosing va kitob o'qishni boshlang
                                    </p>
                                </>
                            )}

                            {isRecording && (
                                <>
                                    <div className="mb-6">
                                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <Square className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-lg text-red-500 font-semibold mb-2">
                                            Yozilmoqda...
                                        </div>
                                        <div className="text-3xl font-bold text-orange-500">
                                            {formatTime(recordingTime)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={stopRecording}
                                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
                                    >
                                        <Square className="w-4 h-4" />
                                        To'xtatish
                                    </button>
                                </>
                            )}

                            {recordedBlob && (
                                <>
                                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-6 max-w-lg mx-auto">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                        <div className="text-lg font-semibold text-green-700 mb-2">
                                            Audio yozildi!
                                        </div>
                                        <div className="text-base text-gray-900 font-medium mb-1">
                                            {bookName}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Davomiyligi: {formatTime(recordingTime)}
                                        </div>
                                    </div>

                                    <audio
                                        controls
                                        src={URL.createObjectURL(recordedBlob)}
                                        className="w-full max-w-lg mx-auto mb-6"
                                    />

                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                setRecordedBlob(null);
                                                setRecordingTime(0);
                                                startRecording();
                                            }}
                                            className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Qayta yozish
                                        </button>
                                        <button
                                            onClick={handleUploadRecording}
                                            disabled={uploading}
                                            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:bg-gray-300"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Calendar - Unchanged */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            Oylik kalendar
                        </h2>
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-orange-500 focus:outline-none"
                            >
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-orange-500 focus:outline-none"
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 mb-5 text-xs flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-gray-600 font-medium">Yuklangan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-gray-600 font-medium">O'tkazilgan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <span className="text-gray-600 font-medium">Kelgusi kunlar</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
                        {getCalendarData().map(({ day, hasRecording, isPast, isFuture }) => {
                            let bgColor = 'bg-gray-200';
                            let textColor = 'text-gray-600';

                            if (isPast && !isFuture) {
                                if (hasRecording) {
                                    bgColor = 'bg-green-500';
                                    textColor = 'text-white';
                                } else {
                                    bgColor = 'bg-red-500';
                                    textColor = 'text-white';
                                }
                            }

                            return (
                                <div
                                    key={day}
                                    className={`
                                        aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 relative group cursor-default
                                        ${bgColor} ${textColor}
                                        ${isFuture ? 'opacity-40' : ''}
                                    `}
                                >
                                    {day}

                                    {hasRecording && (
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max">
                                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                                                Vazifa bajarilgan
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recordings History List - YANGILANDI */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                        </div>
                        Yuklangan audiolaringiz
                    </h2>

                    <div className="space-y-4">
                        {recordings && recordings.length > 0 ? (
                            recordings.map((rec) => (
                                <div key={rec.id} className="border border-gray-100 rounded-xl p-4 hover:bg-orange-50 transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold shrink-0">
                                                {new Date(rec.created_at).getDate()}
                                            </div><div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate mb-1">
                                                    {rec.book_name || rec.filename}
                                                </h3>
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(rec.duration)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileIcon className="w-3 h-3" />
                                                        {rec.file_size}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(rec.created_at).toLocaleDateString('uz-UZ')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Audio Player */}
                                            <audio
                                                controls
                                                src={rec.file_url}
                                                className="w-full sm:w-64 h-10"
                                                preload="metadata"
                                            />

                                            {/* 🗑️ O'chirish tugmasi */}
                                            <button
                                                onClick={() => handleDelete(rec.id)}
                                                className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                title="O'chirish"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    Hozircha audio yuklanmagan
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Yuqoridagi formadan birinchi audioni yuklang
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Kitobxonlik;