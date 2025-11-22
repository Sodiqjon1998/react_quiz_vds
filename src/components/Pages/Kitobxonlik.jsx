import { useState, useEffect } from 'react';

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
    const [bookName, setBookName] = useState(''); // Kitob nomi

    useEffect(() => {
        fetchReadings();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        // Recording to'xtaganda timer to'xtatiladi, lekin vaqt saqlanadi
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    const fetchReadings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:8000/api/readings?month=${selectedMonth + 1}&year=${selectedYear}`,
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
        if (!selectedFile) return;
        
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('audio', selectedFile);

            const response = await fetch('http://localhost:8000/api/readings/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Audio muvaffaqiyatli yuklandi!');
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
        // Kitob nomini tekshirish
        if (!bookName.trim()) {
            alert('❌ Iltimos, avval kitob nomini kiriting!');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Audio siqish sozlamalari
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 32000
            };
            
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/webm';
            }
            
            const recorder = new MediaRecorder(stream, options);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: options.mimeType });
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            alert('❌ Mikrofonni yoqishda xatolik!');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            // Recording time ni saqlab qolish
        }
    };

    const handleUploadRecording = async () => {
        if (!recordedBlob) return;

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            // Kitob nomi bilan fayl yaratish
            const safeBookName = bookName.trim().replace(/[^a-zA-Z0-9а-яА-ЯёЁўҚқҒғҲҳ\s]/g, '').replace(/\s+/g, '_');
            const fileName = `${safeBookName}_${Date.now()}.webm`;
            
            const file = new File(
                [recordedBlob], 
                fileName, 
                { type: 'audio/webm' }
            );
            
            formData.append('audio', file);

            const response = await fetch('http://localhost:8000/api/readings/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Audio muvaffaqiyatli yuklandi!');
                setRecordedBlob(null);
                setRecordingTime(0);
                setBookName(''); // Kitob nomini tozalash
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
            // Realda yuklangan kunlarni tekshirish
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
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f8f9fa'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #1a73e8',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#5f6368' }}>Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#f8f9fa',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ 
                                fontSize: '28px', 
                                fontWeight: '400', 
                                color: '#202124',
                                margin: '0 0 8px 0'
                            }}>
                                📚 Kitobxonlik
                            </h1>
                            <p style={{ color: '#5f6368', margin: 0, fontSize: '14px' }}>
                                Har kuni kitob o'qib audio yuklang va taraqqiyotingizni kuzating
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
                        borderLeft: '4px solid #34a853'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '500', color: '#34a853', marginBottom: '8px' }}>
                            {statistics?.completed_days || 0}
                        </div>
                        <div style={{ fontSize: '14px', color: '#5f6368' }}>Yuklangan kunlar</div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
                        borderLeft: '4px solid #ea4335'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '500', color: '#ea4335', marginBottom: '8px' }}>
                            {statistics?.missed_days || 0}
                        </div>
                        <div style={{ fontSize: '14px', color: '#5f6368' }}>O'tkazilgan kunlar</div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
                        borderLeft: '4px solid #1a73e8'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '500', color: '#1a73e8', marginBottom: '8px' }}>
                            {statistics?.total_duration || '00:00'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#5f6368' }}>Jami vaqt</div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
                        borderLeft: '4px solid #fbbc04'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '500', color: '#fbbc04', marginBottom: '8px' }}>
                            {statistics?.completion_rate || 0}%
                        </div>
                        <div style={{ fontSize: '14px', color: '#5f6368' }}>To'liqlik darajasi</div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
                        borderLeft: '4px solid #9c27b0'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '500', color: '#9c27b0', marginBottom: '8px' }}>
                            {statistics?.total_storage_used || '0 MB'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#5f6368' }}>Jami hajm</div>
                    </div>
                </div>

                {/* Upload Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.3)'
                }}>
                    <h2 style={{ 
                        fontSize: '18px', 
                        fontWeight: '500', 
                        color: '#202124',
                        marginBottom: '20px'
                    }}>
                        Bugungi kitob o'qishni yuklash
                    </h2>

                    {/* Tabs */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        borderBottom: '1px solid #dadce0',
                        marginBottom: '24px'
                    }}>
                        <button
                            onClick={() => setShowMicTab(false)}
                            style={{
                                padding: '12px 16px',
                                background: 'none',
                                border: 'none',
                                borderBottom: !showMicTab ? '2px solid #1a73e8' : '2px solid transparent',
                                color: !showMicTab ? '#1a73e8' : '#5f6368',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}
                        >
                            📁 Fayl yuklash
                        </button>
                        <button
                            onClick={() => setShowMicTab(true)}
                            style={{
                                padding: '12px 16px',
                                background: 'none',
                                border: 'none',
                                borderBottom: showMicTab ? '2px solid #1a73e8' : '2px solid transparent',
                                color: showMicTab ? '#1a73e8' : '#5f6368',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}
                        >
                            🎤 Mikrofon
                        </button>
                    </div>

                    {/* File Upload */}
                    {!showMicTab && (
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                color: '#5f6368' 
                            }}>
                                Audio fayl tanlash
                            </label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #dadce0',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    marginBottom: '12px'
                                }}
                            />
                            <p style={{ fontSize: '12px', color: '#5f6368', margin: '0 0 16px 0' }}>
                                MP3, WAV, OGG formatlarida, maksimal 50MB
                            </p>

                            {selectedFile && (
                                <div style={{
                                    background: '#e8f0fe',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{ fontSize: '32px' }}>🎵</div>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#202124' }}>{selectedFile.name}</div>
                                        <div style={{ fontSize: '12px', color: '#5f6368' }}>
                                            Hajm: {formatFileSize(selectedFile.size)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                style={{
                                    background: selectedFile && !uploading ? '#1a73e8' : '#dadce0',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}
                            >
                                {uploading ? 'Yuklanmoqda...' : '⬆️ Yuklash'}
                            </button>
                        </div>
                    )}

                    {/* Microphone */}
                    {showMicTab && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            {!isRecording && !recordedBlob && (
                                <>
                                    {/* Kitob nomi input */}
                                    <div style={{ marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '8px', 
                                            fontSize: '14px', 
                                            color: '#5f6368',
                                            textAlign: 'left'
                                        }}>
                                            Kitob nomi
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Masalan: Sariq devning minorasi"
                                            value={bookName}
                                            onChange={(e) => setBookName(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #dadce0',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'border 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                            onBlur={(e) => e.target.style.borderColor = '#dadce0'}
                                        />
                                    </div>

                                    <button
                                        onClick={startRecording}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: '#ea4335',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: '40px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            marginBottom: '16px'
                                        }}
                                    >
                                        🎤
                                    </button>
                                    <p style={{ color: '#5f6368', fontSize: '14px' }}>
                                        Mikrofonni bosing va kitob o'qishni boshlang
                                    </p>
                                </>
                            )}

                            {isRecording && (
                                <>
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: '#ea4335',
                                            borderRadius: '50%',
                                            margin: '0 auto 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '32px',
                                            color: 'white',
                                            animation: 'pulse 1.5s infinite'
                                        }}>
                                            ⏹️
                                        </div>
                                        <div style={{ fontSize: '18px', color: '#ea4335', marginBottom: '8px' }}>
                                            Yozilmoqda...
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: '500', color: '#1a73e8' }}>
                                            {formatTime(recordingTime)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={stopRecording}
                                        style={{
                                            background: '#ea4335',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ⏹️ To'xtatish
                                    </button>
                                </>
                            )}

                            {recordedBlob && (
                                <>
                                    <div style={{
                                        background: '#e8f5e9',
                                        padding: '24px',
                                        borderRadius: '8px',
                                        marginBottom: '24px',
                                        maxWidth: '500px',
                                        margin: '0 auto 24px'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                                        <div style={{ fontSize: '18px', fontWeight: '500', color: '#34a853', marginBottom: '8px' }}>
                                            Audio yozildi!
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#202124', marginBottom: '4px', fontWeight: '500' }}>
                                            📚 {bookName}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#5f6368' }}>
                                            Davomiyligi: {formatTime(recordingTime)}
                                        </div>
                                    </div>

                                    <audio
                                        controls
                                        src={URL.createObjectURL(recordedBlob)}
                                        style={{ width: '100%', maxWidth: '500px', marginBottom: '24px' }}
                                    />

                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => {
                                                setRecordedBlob(null);
                                                setRecordingTime(0);
                                                // Kitob nomini saqlab qolish
                                                startRecording();
                                            }}
                                            style={{
                                                background: '#5f6368',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 24px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            🔄 Qayta yozish
                                        </button>
                                        <button
                                            onClick={handleUploadRecording}
                                            disabled={uploading}
                                            style={{
                                                background: '#1a73e8',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 24px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {uploading ? 'Yuklanmoqda...' : '⬆️ Yuklash'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Calendar */}
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.3)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#202124', margin: 0 }}>
                            📅 Oylik kalendar
                        </h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #dadce0',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#5f6368'
                                }}
                            >
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #dadce0',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#5f6368'
                                }}
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '24px',
                        marginBottom: '20px',
                        fontSize: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#34a853', borderRadius: '4px' }}></div>
                            <span style={{ color: '#5f6368' }}>Yuklangan</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#ea4335', borderRadius: '4px' }}></div>
                            <span style={{ color: '#5f6368' }}>O'tkazilgan</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#e8eaed', borderRadius: '4px' }}></div>
                            <span style={{ color: '#5f6368' }}>Kelgusi kunlar</span>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
                        gap: '8px',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {getCalendarData().map(({ day, hasRecording, isPast, isFuture }) => {
                            let bgColor = '#e8eaed';
                            if (isPast && !isFuture) {
                                bgColor = hasRecording ? '#34a853' : '#ea4335';
                            }

                            return (
                                <div
                                    key={day}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: bgColor,
                                        color: isPast && !isFuture ? 'white' : '#5f6368',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recordings Table */}
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.3)'
                }}>
                    <h2 style={{ 
                        fontSize: '18px', 
                        fontWeight: '500', 
                        color: '#202124',
                        marginBottom: '20px'
                    }}>
                        📋 Yuklangan audio yozuvlar
                    </h2>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #dadce0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>№</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Sana</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Fayl nomi</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Davomiyligi</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Hajmi</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Amal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recordings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📭</div>
                                            <div style={{ fontSize: '14px', color: '#5f6368' }}>Hozircha audio yozuvlar yo'q</div>
                                        </td>
                                    </tr>
                                ) : (
                                    recordings.map((record, index) => (
                                        <tr key={record.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                                            <td style={{ padding: '12px', fontSize: '14px', color: '#202124', fontWeight: '500' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', fontSize: '14px', color: '#5f6368' }}>
                                                {new Date(record.created_at).toLocaleDateString('uz-UZ')}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '14px', color: '#202124' }}>
                                                🎵 {record.filename}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <span style={{
                                                    background: '#e8f0fe',
                                                    color: '#1a73e8',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {formatTime(record.duration)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#5f6368' }}>
                                                {formatFileSize(record.file_size)}
                                            </td>
                                             <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <a
                                                    href={record.file_url.startsWith('http') 
                                                        ? record.file_url 
                                                        : `http://localhost:8000/storage/${record.file_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        background: '#1a73e8',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        textDecoration: 'none',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    ▶️ Eshitish
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }

                button:hover {
                    opacity: 0.9;
                    transition: opacity 0.2s;
                }

                button:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    table {
                        font-size: 12px;
                    }
                    
                    th, td {
                        padding: 8px !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Kitobxonlik;