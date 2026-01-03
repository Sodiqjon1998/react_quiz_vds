import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Award, TrendingUp, Calendar, Eye, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import ExamReview from './ExamReview';

const Statistics = () => {
    const [examHistory, setExamHistory] = useState([]);
    const [subjectStats, setSubjectStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState(null);

    // School brand color - Logo rangi
    const BRAND_COLOR = '#FF8C00';
    const BRAND_LIGHT = '#FFF4E6';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            const historyRes = await fetch(`${API_BASE_URL}/api/stats/exam-history`, { headers });
            const historyData = await historyRes.json();

            const statsRes = await fetch(`${API_BASE_URL}/api/stats/subject-stats`, { headers });
            const statsData = await statsRes.json();

            if (historyData.success) setExamHistory(historyData.data);
            if (statsData.success) setSubjectStats(statsData.data);

        } catch (error) {
            console.error('Xatolik:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalExams = examHistory.length;
    const totalScore = examHistory.reduce((sum, exam) => sum + exam.score, 0);
    const avgPercentage = totalExams > 0
        ? (examHistory.reduce((sum, exam) => sum + exam.percentage, 0) / totalExams).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border" style={{ color: BRAND_COLOR }} role="status"></div>
            </div>
        );
    }

    // Agar test tanlangan bo'lsa, ExamReview ko'rsatish
    if (selectedExamId) {
        return <ExamReview examId={selectedExamId} onClose={() => setSelectedExamId(null)} />;
    }

    return (
        <div className="container-xxl flex-grow-1 container-p-y" style={{ backgroundColor: '#fff' }}>
            {/* Header - Maktab brand rangi bilan */}
            <div className="mb-4 pb-3" style={{ borderBottom: `3px solid ${BRAND_COLOR}` }}>
                <div className="d-flex align-items-center gap-2">
                    <BarChart3 size={28} style={{ color: BRAND_COLOR }} />
                    <h2 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>Mening Statistikam</h2>
                </div>
                <p className="text-muted mb-0 mt-2">Barcha topshirgan testlarim va natijalarim</p>
            </div>

            {/* Statistics Cards - Professional Clean Design */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid ${BRAND_COLOR}` }}>
                        <div className="card-body text-center">
                            <BookOpen size={28} style={{ color: BRAND_COLOR }} className="mb-2" />
                            <h3 className="mb-1" style={{ color: '#333', fontWeight: '700' }}>{totalExams}</h3>
                            <small className="text-muted">Jami Testlar</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid #10b981` }}>
                        <div className="card-body text-center">
                            <Award size={28} style={{ color: '#10b981' }} className="mb-2" />
                            <h3 className="mb-1" style={{ color: '#333', fontWeight: '700' }}>{totalScore}</h3>
                            <small className="text-muted">Umumiy Ball</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid #3b82f6` }}>
                        <div className="card-body text-center">
                            <TrendingUp size={28} style={{ color: '#3b82f6' }} className="mb-2" />
                            <h3 className="mb-1" style={{ color: '#333', fontWeight: '700' }}>{avgPercentage}%</h3>
                            <small className="text-muted">O'rtacha</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid #8b5cf6` }}>
                        <div className="card-body text-center">
                            <Calendar size={28} style={{ color: '#8b5cf6' }} className="mb-2" />
                            <h3 className="mb-1" style={{ color: '#333', fontWeight: '700' }}>{subjectStats.length}</h3>
                            <small className="text-muted">Fanlar</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row - Mobile Responsive */}
            <div className="row g-3 mb-4">
                {/* Bar Chart */}
                {subjectStats.length > 0 && (
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white" style={{ borderBottom: `2px solid ${BRAND_LIGHT}` }}>
                                <div className="d-flex align-items-center gap-2">
                                    <BarChart3 size={20} style={{ color: BRAND_COLOR }} />
                                    <h5 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>
                                        Fan Bo'yicha O'rtacha Ball
                                    </h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={subjectStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="subject_name"
                                            tick={{ fill: '#666', fontSize: 11 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: `1px solid ${BRAND_COLOR}`,
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="avg_score"
                                            fill={BRAND_COLOR}
                                            name="O'rtacha Ball"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pie Chart */}
                {subjectStats.length > 0 && (
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white" style={{ borderBottom: `2px solid ${BRAND_LIGHT}` }}>
                                <div className="d-flex align-items-center gap-2">
                                    <PieChartIcon size={20} style={{ color: BRAND_COLOR }} />
                                    <h5 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>
                                        Fanlar Taqsimoti
                                    </h5>
                                </div>
                            </div>
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={subjectStats}
                                            dataKey="total_exams"
                                            nameKey="subject_name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={(entry) => entry.total_exams}
                                            labelLine={false}
                                        >
                                            {subjectStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: `1px solid ${BRAND_COLOR}`,
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Exam History - Desktop Table + Mobile Cards */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white" style={{ borderBottom: `2px solid ${BRAND_LIGHT}` }}>
                    <div className="d-flex align-items-center gap-2">
                        <FileText size={20} style={{ color: BRAND_COLOR }} />
                        <h5 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>
                            Topshirgan Testlarim
                        </h5>
                    </div>
                </div>
                <div className="card-body p-0">
                    {examHistory.length > 0 ? (
                        <>
                            {/* Desktop Table - Hidden on mobile */}
                            <div className="table-responsive d-none d-md-block">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: BRAND_LIGHT }}>
                                        <tr>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>#</th>
                                            <th style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Test Nomi</th>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Fan</th>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Ball</th>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Foiz</th>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Sana</th>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Harakatlar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examHistory.map((exam, index) => (
                                            <tr key={exam.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                <td className="text-center text-muted" style={{ fontSize: '13px' }}>
                                                    {index + 1}
                                                </td>
                                                <td style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>
                                                    {exam.quiz_name}
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: subjectStats.find(s => s.subject_id === exam.subject_id)?.color || '#999',
                                                            color: '#fff',
                                                            fontSize: '11px',
                                                            padding: '4px 12px'
                                                        }}
                                                    >
                                                        {exam.subject_name}
                                                    </span>
                                                </td>
                                                <td className="text-center" style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                                                    {exam.score}/{exam.total_questions}
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: exam.percentage >= 80 ? '#10b981' :
                                                                exam.percentage >= 60 ? '#f59e0b' : '#ef4444',
                                                            color: '#fff',
                                                            padding: '4px 10px',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {exam.percentage}%
                                                    </span>
                                                </td>
                                                <td className="text-center text-muted" style={{ fontSize: '13px' }}>
                                                    {new Date(exam.created_at).toLocaleDateString('uz-UZ', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => setSelectedExamId(exam.id)}
                                                        style={{
                                                            backgroundColor: BRAND_COLOR,
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '4px 12px',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <Eye size={14} className="me-1" />
                                                        Ko'rish
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards - Hidden on desktop */}
                            <div className="d-md-none p-3">
                                {examHistory.map((exam, index) => (
                                    <div
                                        key={exam.id}
                                        className="card mb-3 border-0 shadow-sm"
                                        style={{ borderLeft: `4px solid ${subjectStats.find(s => s.subject_id === exam.subject_id)?.color || BRAND_COLOR}` }}
                                    >
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1" style={{ color: '#333', fontWeight: '600' }}>
                                                        {exam.quiz_name}
                                                    </h6>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: subjectStats.find(s => s.subject_id === exam.subject_id)?.color || '#999',
                                                            color: '#fff',
                                                            fontSize: '10px',
                                                            padding: '3px 8px'
                                                        }}
                                                    >
                                                        {exam.subject_name}
                                                    </span>
                                                </div>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: exam.percentage >= 80 ? '#10b981' :
                                                            exam.percentage >= 60 ? '#f59e0b' : '#ef4444',
                                                        color: '#fff',
                                                        padding: '6px 12px',
                                                        fontSize: '13px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {exam.percentage}%
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
                                                <div className="d-flex gap-3">
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Ball</small>
                                                        <strong style={{ color: '#333', fontSize: '14px' }}>
                                                            {exam.score}/{exam.total_questions}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Sana</small>
                                                        <strong style={{ color: '#333', fontSize: '12px' }}>
                                                            {new Date(exam.created_at).toLocaleDateString('uz-UZ', {
                                                                day: '2-digit',
                                                                month: '2-digit'
                                                            })}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => setSelectedExamId(exam.id)}
                                                    style={{
                                                        backgroundColor: BRAND_COLOR,
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <BookOpen size={64} style={{ color: '#e0e0e0' }} className="mb-3" />
                            <p className="text-muted">Hozircha testlar topshirmadingiz</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;
