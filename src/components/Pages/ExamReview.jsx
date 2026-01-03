import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ExamReview = ({ examId, onClose }) => {
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);

    const BRAND_COLOR = '#FF8C00';
    const BRAND_LIGHT = '#FFF4E6';

    useEffect(() => {
        fetchExamDetail();
    }, [examId]);

    const fetchExamDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/stats/exam/${examId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setExamData(data.data);
            }
        } catch (error) {
            console.error('Xatolik:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border" style={{ color: BRAND_COLOR }} role="status"></div>
            </div>
        );
    }

    if (!examData) {
        return (
            <div className="alert alert-danger">Test topilmadi</div>
        );
    }

    return (
        <div className="container-xxl flex-grow-1 container-p-y" style={{ backgroundColor: '#fff' }}>
            {/* Header */}
            <div className="mb-4">
                <button
                    className="btn btn-link p-0 mb-3"
                    onClick={onClose}
                    style={{ color: BRAND_COLOR, textDecoration: 'none' }}
                >
                    <ArrowLeft size={20} className="me-2" />
                    Orqaga
                </button>

                <div className="pb-3" style={{ borderBottom: `3px solid ${BRAND_COLOR}` }}>
                    <h2 style={{ color: '#333', fontWeight: '600' }}>📝 {examData.quiz_name}</h2>
                    <p className="text-muted mb-2">{examData.subject_name}</p>
                    <div className="d-flex gap-3 flex-wrap">
                        <span className="badge" style={{ backgroundColor: BRAND_LIGHT, color: BRAND_COLOR, fontSize: '13px', padding: '6px 12px' }}>
                            {examData.correct_answers}/{examData.total_questions} to'g'ri
                        </span>
                        <span
                            className="badge"
                            style={{
                                backgroundColor: examData.percentage >= 80 ? '#10b981' :
                                    examData.percentage >= 60 ? '#f59e0b' : '#ef4444',
                                color: '#fff',
                                fontSize: '13px',
                                padding: '6px 12px'
                            }}
                        >
                            {examData.percentage}%
                        </span>
                        <small className="text-muted align-self-center">
                            {new Date(examData.created_at).toLocaleString('uz-UZ')}
                        </small>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="row g-3">
                {examData.questions.map((question, index) => (
                    <div key={question.question_id} className="col-12">
                        <div
                            className="card border-0 shadow-sm"
                            style={{
                                borderLeft: `4px solid ${question.is_correct ? '#10b981' : '#ef4444'}`
                            }}
                        >
                            <div className="card-body">
                                {/* Question Header */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: '#f0f0f0',
                                                    color: '#666',
                                                    fontSize: '12px',
                                                    padding: '4px 10px'
                                                }}
                                            >
                                                Savol #{index + 1}
                                            </span>
                                            {question.is_correct ? (
                                                <CheckCircle size={20} style={{ color: '#10b981' }} />
                                            ) : (
                                                <XCircle size={20} style={{ color: '#ef4444' }} />
                                            )}
                                        </div>
                                        <p className="mb-2" style={{ color: '#333', fontSize: '15px', fontWeight: '500' }}>
                                            {question.question_text}
                                        </p>
                                        {question.question_image && (
                                            <img
                                                src={`${API_BASE_URL}/storage/${question.question_image}`}
                                                alt="Savol rasmi"
                                                className="img-fluid rounded mb-2"
                                                style={{ maxWidth: '300px' }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="d-grid gap-2">
                                    {question.options.map((option) => {
                                        const isUserSelected = option.id === question.user_selected_id;
                                        const isCorrectOption = option.is_correct;

                                        let bgColor = '#fff';
                                        let borderColor = '#e0e0e0';
                                        let textColor = '#333';

                                        if (isUserSelected && isCorrectOption) {
                                            // To'g'ri javob berganda
                                            bgColor = '#d1fae5';
                                            borderColor = '#10b981';
                                            textColor = '#065f46';
                                        } else if (isUserSelected && !isCorrectOption) {
                                            // Xato javob berganda
                                            bgColor = '#fee2e2';
                                            borderColor = '#ef4444';
                                            textColor = '#991b1b';
                                        } else if (!isUserSelected && isCorrectOption) {
                                            // To'g'ri javob (tanlanmagan)
                                            bgColor = '#f0fdf4';
                                            borderColor = '#10b981';
                                            textColor = '#065f46';
                                        }

                                        return (
                                            <div
                                                key={option.id}
                                                className="p-3 rounded d-flex align-items-center justify-content-between"
                                                style={{
                                                    backgroundColor: bgColor,
                                                    border: `2px solid ${borderColor}`,
                                                    color: textColor
                                                }}
                                            >
                                                <span style={{ fontSize: '14px' }}>{option.text}</span>
                                                <div className="d-flex gap-2">
                                                    {isUserSelected && (
                                                        <span className="badge" style={{ backgroundColor: '#333', color: '#fff', fontSize: '10px' }}>
                                                            Sizning javobingiz
                                                        </span>
                                                    )}
                                                    {isCorrectOption && (
                                                        <CheckCircle size={18} style={{ color: '#10b981' }} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Feedback */}
                                {!question.is_correct && (
                                    <div className="alert alert-warning mt-3 mb-0 d-flex align-items-center" style={{ fontSize: '13px' }}>
                                        <AlertCircle size={18} className="me-2" />
                                        To'g'ri javob yuqorida yashil rangda ko'rsatilgan
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamReview;
