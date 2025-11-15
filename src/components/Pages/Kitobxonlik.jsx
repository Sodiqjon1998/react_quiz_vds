import { useState, useEffect } from 'react';

function Kitobxonlik() {
    const [recordings, setRecordings] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [error, setError] = useState(null);

    // Mikrofon state'lari
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    useEffect(() => {
        fetchReadings();
    }, [selectedMonth, selectedYear]);

    // Timer for recording
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const fetchReadings = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
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
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        
        if (!file) return;

        // Audio fayl ekanligini tekshirish
        if (!file.type.startsWith('audio/')) {
            alert('Faqat audio fayllarni yuklash mumkin!');
            return;
        }

        // Fayl hajmini tekshirish (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('Fayl hajmi 50MB dan oshmasligi kerak!');
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Iltimos, audio fayl tanlang!');
            return;
        }

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
                document.getElementById('audioInput').value = '';
                fetchReadings();
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('❌ Xatolik: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Mikrofon funksiyalari
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setAudioChunks(chunks);
            setIsRecording(true);
            setRecordingTime(0);
        } catch (err) {
            console.error('Mikrofon xatosi:', err);
            alert('❌ Mikrofonni yoqishda xatolik! Brauzer ruxsat berishini tekshiring.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
        setRecordedBlob(null);
        setRecordingTime(0);
    };

    const handleRecordAgain = () => {
        setRecordedBlob(null);
        setRecordingTime(0);
        startRecording();
    };

    const handleUploadRecording = async () => {
        if (!recordedBlob) {
            alert('Iltimos, avval audio yozing!');
            return;
        }

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            // Blob'ni file formatiga o'tkazish
            const file = new File(
                [recordedBlob], 
                `recording_${Date.now()}.webm`, 
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
                fetchReadings();
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('❌ Xatolik: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getCalendarData = () => {
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        const today = new Date();
        const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;
        
        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const hasRecording = recordings.some(r => {
                const recordDate = new Date(r.created_at);
                return recordDate.getDate() === day;
            });

            const isPast = isCurrentMonth ? day <= today.getDate() : true;
            const isFuture = isCurrentMonth ? day > today.getDate() : false;

            days.push({
                day,
                hasRecording,
                isPast,
                isFuture
            });
        }
        return days;
    };

    const months = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Yuklanmoqda...</span>
                    </div>
                    <h5 className="text-muted">Ma'lumotlar yuklanmoqda...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="row g-4">
            {/* Header */}
            <div className="col-12">
                <div className="card border-0 shadow-sm bg-gradient-primary text-white">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="text-white mb-2">
                                    <i className="ri-book-read-line me-2"></i>
                                    Kitobxonlik
                                </h3>
                                <p className="text-white-50 mb-0">
                                    Har kuni kitob o'qib audio yuklang va taraqqiyotingizni kuzating
                                </p>
                            </div>
                            <div className="text-end">
                                <div className="avatar avatar-xl bg-white rounded-circle d-flex align-items-center justify-content-center">
                                    <i className="ri-mic-line text-primary" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="avatar bg-label-success rounded-3">
                                <i className="ri-calendar-check-line icon-24px"></i>
                            </div>
                        </div>
                        <div className="card-info mt-4">
                            <h4 className="mb-1 text-success">{statistics?.completed_days || 0}</h4>
                            <p className="mb-0 text-muted">Yuklangan kunlar</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="avatar bg-label-danger rounded-3">
                                <i className="ri-calendar-close-line icon-24px"></i>
                            </div>
                        </div>
                        <div className="card-info mt-4">
                            <h4 className="mb-1 text-danger">{statistics?.missed_days || 0}</h4>
                            <p className="mb-0 text-muted">O'tkazilgan kunlar</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="avatar bg-label-primary rounded-3">
                                <i className="ri-time-line icon-24px"></i>
                            </div>
                        </div>
                        <div className="card-info mt-4">
                            <h4 className="mb-1 text-primary">{statistics?.total_duration || '00:00'}</h4>
                            <p className="mb-0 text-muted">Jami vaqt</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="avatar bg-label-info rounded-3">
                                <i className="ri-percent-line icon-24px"></i>
                            </div>
                        </div>
                        <div className="card-info mt-4">
                            <h4 className="mb-1 text-info">{statistics?.completion_rate || 0}%</h4>
                            <p className="mb-0 text-muted">To'liqlik darajasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light">
                        <h5 className="mb-0">
                            <i className="ri-mic-line me-2"></i>
                            Bugungi kitob o'qishni yuklash
                        </h5>
                    </div>
                    <div className="card-body p-4">
                        {/* Tabs - Fayl yoki Mikrofon */}
                        <ul className="nav nav-pills mb-4" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${!isRecording && !recordedBlob ? 'active' : ''}`}
                                    onClick={() => {
                                        setIsRecording(false);
                                        setRecordedBlob(null);
                                        setRecordingTime(0);
                                    }}
                                    type="button"
                                >
                                    <i className="ri-folder-music-line me-2"></i>
                                    Fayl yuklash
                                </button>
                            </li>
                            <li className="nav-item ms-2" role="presentation">
                                <button
                                    className={`nav-link ${isRecording || recordedBlob ? 'active' : ''}`}
                                    onClick={() => setSelectedFile(null)}
                                    type="button"
                                >
                                    <i className="ri-mic-line me-2"></i>
                                    Mikrofon orqali yozish
                                </button>
                            </li>
                        </ul>

                        {/* Fayl yuklash */}
                        {!isRecording && !recordedBlob && (
                            <div className="row g-3 align-items-end">
                                <div className="col-md-8">
                                    <label className="form-label fw-semibold">
                                        <i className="ri-file-music-line me-1"></i>
                                        Audio fayl tanlash
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control form-control-lg"
                                        id="audioInput"
                                        accept="audio/*"
                                        onChange={handleFileSelect}
                                        disabled={uploading}
                                    />
                                    <small className="text-muted">
                                        <i className="ri-information-line me-1"></i>
                                        MP3, WAV, OGG formatlarida, maksimal 50MB
                                    </small>

                                    {selectedFile && (
                                        <div className="alert alert-info mt-3 mb-0">
                                            <div className="d-flex align-items-center">
                                                <i className="ri-file-music-line fs-3 me-3"></i>
                                                <div className="flex-grow-1">
                                                    <strong>{selectedFile.name}</strong>
                                                    <br />
                                                    <small>Hajm: {formatFileSize(selectedFile.size)}</small>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <button
                                        className="btn btn-primary btn-lg w-100 shadow-sm"
                                        onClick={handleUpload}
                                        disabled={!selectedFile || uploading}
                                    >
                                        {uploading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Yuklanmoqda...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-upload-2-line me-2"></i>
                                                Yuklash
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mikrofon yozish */}
                        {(isRecording || recordedBlob) && (
                            <div className="text-center">
                                {!recordedBlob ? (
                                    <>
                                        {/* Yozilmoqda */}
                                        <div className="mb-4">
                                            <div className="recording-animation mb-3">
                                                <div className="pulse-ring"></div>
                                                <div className="pulse-ring pulse-ring-2"></div>
                                                <button
                                                    className="btn btn-danger btn-lg rounded-circle"
                                                    style={{ width: '80px', height: '80px' }}
                                                    onClick={stopRecording}
                                                >
                                                    <i className="ri-stop-fill fs-1"></i>
                                                </button>
                                            </div>
                                            <h4 className="text-danger mb-2">Yozilmoqda...</h4>
                                            <h3 className="text-primary">{formatRecordingTime(recordingTime)}</h3>
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-lg"
                                            onClick={cancelRecording}
                                        >
                                            <i className="ri-close-line me-2"></i>
                                            Bekor qilish
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Yozuv tayyor */}
                                        <div className="mb-4">
                                            <div className="alert alert-success d-inline-block px-5 py-3">
                                                <i className="ri-checkbox-circle-line fs-1 d-block mb-2"></i>
                                                <h5 className="mb-2">Audio yozildi!</h5>
                                                <p className="mb-0">Davomiyligi: {formatRecordingTime(recordingTime)}</p>
                                            </div>
                                        </div>

                                        {/* Audio player */}
                                        <audio
                                            controls
                                            src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''}
                                            className="w-100 mb-4"
                                            style={{ maxWidth: '500px' }}
                                        />

                                        <div className="d-flex gap-3 justify-content-center">
                                            <button
                                                className="btn btn-secondary btn-lg"
                                                onClick={handleRecordAgain}
                                            >
                                                <i className="ri-restart-line me-2"></i>
                                                Qayta yozish
                                            </button>
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handleUploadRecording}
                                                disabled={uploading}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Yuklanmoqda...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-upload-2-line me-2"></i>
                                                        Yuklash
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mikrofon yoqish tugmasi */}
                        {!isRecording && !recordedBlob && !selectedFile && (
                            <div className="text-center py-4">
                                <button
                                    className="btn btn-danger btn-lg rounded-circle shadow-lg"
                                    style={{ width: '100px', height: '100px' }}
                                    onClick={startRecording}
                                >
                                    <i className="ri-mic-line" style={{ fontSize: '2.5rem' }}></i>
                                </button>
                                <p className="text-muted mt-3 mb-0">
                                    <i className="ri-information-line me-1"></i>
                                    Mikrofonni bosing va kitob o'qishni boshlang
                                </p>
                            </div>
                        )}

                        {statistics?.today_uploaded && (
                            <div className="alert alert-success mt-3 mb-0">
                                <i className="ri-checkbox-circle-line me-2"></i>
                                <strong>Bugun audio yuklangan!</strong> Davom eting! 🎉
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="ri-calendar-line me-2"></i>
                            Oylik kalendar
                        </h5>
                        <div className="d-flex gap-2">
                            <select
                                className="form-select"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            >
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                            <select
                                className="form-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-around mb-4">
                            <div className="d-flex align-items-center">
                                <span className="badge bg-success me-2" style={{ width: '20px', height: '20px' }}></span>
                                <span>Yuklangan</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="badge bg-danger me-2" style={{ width: '20px', height: '20px' }}></span>
                                <span>O'tkazilgan</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2" style={{ width: '20px', height: '20px' }}></span>
                                <span>Kelgusi kunlar</span>
                            </div>
                        </div>

                        <div className="row g-2">
                            {getCalendarData().map(({ day, hasRecording, isPast, isFuture }) => {
                                let badgeClass = 'bg-secondary';
                                if (isPast && !isFuture) {
                                    badgeClass = hasRecording ? 'bg-success' : 'bg-danger';
                                }

                                return (
                                    <div className="col-auto" key={day}>
                                        <div
                                            className={`badge ${badgeClass} text-white d-flex align-items-center justify-content-center`}
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}
                                            title={
                                                isFuture ? 'Kelgusi kun' :
                                                hasRecording ? 'Audio yuklangan' :
                                                'Audio yuklanmagan'
                                            }
                                        >
                                            {day}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recordings List */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light">
                        <h5 className="mb-0">
                            <i className="ri-list-check me-2"></i>
                            Yuklangan audio yozuvlar
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '5%' }}>№</th>
                                        <th style={{ width: '15%' }}>Sana</th>
                                        <th style={{ width: '40%' }}>Fayl nomi</th>
                                        <th style={{ width: '15%' }} className="text-center">Davomiyligi</th>
                                        <th style={{ width: '15%' }} className="text-center">Hajmi</th>
                                        <th style={{ width: '10%' }} className="text-center">Amal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordings.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <i className="ri-inbox-line text-muted" style={{ fontSize: '60px', opacity: 0.3 }}></i>
                                                <h5 className="text-muted mt-3">Hozircha audio yozuvlar yo'q</h5>
                                            </td>
                                        </tr>
                                    ) : (
                                        recordings.map((record, index) => (
                                            <tr key={record.id}>
                                                <td className="fw-bold">{index + 1}</td>
                                                <td>
                                                    <i className="ri-calendar-line me-1 text-muted"></i>
                                                    {new Date(record.created_at).toLocaleDateString('uz-UZ')}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className="ri-file-music-line text-primary me-2 fs-4"></i>
                                                        <span>{record.filename}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-info px-3 py-2">
                                                        <i className="ri-time-line me-1"></i>
                                                        {formatDuration(record.duration)}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-secondary px-3 py-2">
                                                        {formatFileSize(record.file_size)}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <a
                                                        href={record.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-primary"
                                                        title="Eshitish"
                                                    >
                                                        <i className="ri-play-circle-line"></i>
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
            </div>
        </div>
    );
}

export default Kitobxonlik;

// CSS - HTML head ga qo'shish kerak yoki alohida CSS faylda
/*
<style>
.recording-animation {
    position: relative;
    display: inline-block;
}

.pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 3px solid #dc3545;
    border-radius: 50%;
    animation: pulse 1.5s ease-out infinite;
}

.pulse-ring-2 {
    animation-delay: 0.75s;
}

@keyframes pulse {
    0% {
        width: 100px;
        height: 100px;
        opacity: 1;
    }
    100% {
        width: 150px;
        height: 150px;
        opacity: 0;
    }
}
</style>
*/