import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, TrendingUp, Users, School, BarChart3, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../../config';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('students'); // 'students' | 'classes'
    const [rankings, setRankings] = useState([]);
    const [classRankings, setClassRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [totalStudents, setTotalStudents] = useState(0);

    // Month filter state (default: current month)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // School brand color
    const BRAND_COLOR = '#FF8C00';
    const BRAND_LIGHT = '#FFF4E6';

    // Generate last 12 months for dropdown
    const getMonths = () => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                value: d.getMonth() + 1,
                year: d.getFullYear(),
                label: d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
            });
        }
        return months;
    };

    const monthOptions = getMonths();

    useEffect(() => {
        fetchStudentRankings();
        fetchClassRankings();
    }, [selectedMonth, selectedYear]);

    const fetchStudentRankings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ranking/class?month=${selectedMonth}&year=${selectedYear}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setRankings(data.data.rankings);
                setCurrentUserId(data.data.current_user_id);
                setTotalStudents(data.data.total_students);
            }
        } catch (error) {
            console.error('Reytinglarni yuklashda xato:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassRankings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ranking/class-rankings?month=${selectedMonth}&year=${selectedYear}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                setClassRankings(data.data);
            }
        } catch (error) {
            console.error('Sinf reytinglarini yuklashda xato:', error);
        }
    };

    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy size={32} style={{ color: '#FFD700' }} />;
            case 2:
                return <Medal size={28} style={{ color: '#C0C0C0' }} />;
            case 3:
                return <Medal size={24} style={{ color: '#CD7F32' }} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border" style={{ color: BRAND_COLOR }} role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-xxl flex-grow-1 container-p-y" style={{ backgroundColor: '#fff' }}>
            {/* Header */}
            <div className="mb-4 pb-3" style={{ borderBottom: `3px solid ${BRAND_COLOR}` }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <Trophy size={28} style={{ color: BRAND_COLOR }} />
                        <h2 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>Reytinglar</h2>
                    </div>

                    {/* Month Selector */}
                    <div>
                        <select
                            className="form-select"
                            value={`${selectedYear}-${selectedMonth}`}
                            onChange={(e) => {
                                const [year, month] = e.target.value.split('-');
                                setSelectedYear(parseInt(year));
                                setSelectedMonth(parseInt(month));
                            }}
                            style={{
                                borderColor: BRAND_COLOR,
                                color: '#333',
                                fontSize: '14px',
                                minWidth: '200px'
                            }}
                        >
                            {monthOptions.map((option, index) => (
                                <option key={index} value={`${option.year}-${option.value}`}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4">
                <div className="btn-group w-100" role="group">
                    <button
                        type="button"
                        className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('students')}
                        style={{
                            backgroundColor: activeTab === 'students' ? BRAND_COLOR : '#fff',
                            borderColor: BRAND_COLOR,
                            color: activeTab === 'students' ? '#fff' : BRAND_COLOR
                        }}
                    >
                        <Users size={16} className="me-2" />
                        O'quvchilar
                    </button>
                    <button
                        type="button"
                        className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('classes')}
                        style={{
                            backgroundColor: activeTab === 'classes' ? BRAND_COLOR : '#fff',
                            borderColor: BRAND_COLOR,
                            color: activeTab === 'classes' ? '#fff' : BRAND_COLOR
                        }}
                    >
                        <School size={16} className="me-2" />
                        Sinflar
                    </button>
                </div>
            </div>

            {activeTab === 'students' ? (
                /* Student Rankings */
                <>
                    <p className="text-muted mb-4">
                        <Users size={16} className="me-1" />
                        Jami {totalStudents} o'quvchi
                    </p>

                    {/* Top 3 Podium */}
                    {rankings.length >= 3 && (
                        <div className="row g-3 mb-4">
                            {/* 2nd Place */}
                            <div className="col-md-4 mb-3 order-md-1 order-2">
                                <div className="card h-100 border-0 shadow-sm" style={{ borderTop: '4px solid #C0C0C0' }}>
                                    <div className="card-body text-center pt-4">
                                        {getMedalIcon(2)}
                                        <h4 className="mt-3 mb-2" style={{ color: '#333' }}>{rankings[1].name}</h4>
                                        <div className="badge mb-2" style={{ backgroundColor: '#C0C0C0', color: '#fff', fontSize: '16px', padding: '6px 16px' }}>
                                            #2
                                        </div>
                                        <p className="mb-0" style={{ fontSize: '14px' }}>
                                            <TrendingUp size={14} className="me-1" style={{ color: '#C0C0C0' }} />
                                            <strong>{rankings[1].total_score}</strong> ball
                                        </p>
                                        <small className="text-muted">{rankings[1].total_exams} ta test</small>
                                    </div>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="col-md-4 mb-3 order-md-2 order-1">
                                <div className="card h-100 border-0 shadow" style={{ borderTop: '4px solid #FFD700', transform: 'scale(1.05)' }}>
                                    <div className="card-body text-center pt-4" style={{ backgroundColor: BRAND_LIGHT }}>
                                        {getMedalIcon(1)}
                                        <h3 className="mt-3 mb-2" style={{ color: BRAND_COLOR, fontWeight: '700' }}>
                                            {rankings[0].name}
                                        </h3>
                                        <div className="badge mb-2" style={{ backgroundColor: '#FFD700', color: '#333', fontSize: '18px', padding: '8px 20px', fontWeight: '700' }}>
                                            #1
                                        </div>
                                        <p className="mb-0 fw-bold" style={{ fontSize: '16px' }}>
                                            <TrendingUp size={16} className="me-1" style={{ color: BRAND_COLOR }} />
                                            <strong style={{ color: BRAND_COLOR, fontSize: '18px' }}>{rankings[0].total_score}</strong> ball
                                        </p>
                                        <small className="text-muted">{rankings[0].total_exams} ta test</small>
                                    </div>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="col-md-4 mb-3 order-3">
                                <div className="card h-100 border-0 shadow-sm" style={{ borderTop: '4px solid #CD7F32' }}>
                                    <div className="card-body text-center pt-4">
                                        {getMedalIcon(3)}
                                        <h4 className="mt-3 mb-2" style={{ color: '#333' }}>{rankings[2].name}</h4>
                                        <div className="badge mb-2" style={{ backgroundColor: '#CD7F32', color: '#fff', fontSize: '16px', padding: '6px 16px' }}>
                                            #3
                                        </div>
                                        <p className="mb-0" style={{ fontSize: '14px' }}>
                                            <TrendingUp size={14} className="me-1" style={{ color: '#CD7F32' }} />
                                            <strong>{rankings[2].total_score}</strong> ball
                                        </p>
                                        <small className="text-muted">{rankings[2].total_exams} ta test</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Rankings Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white" style={{ borderBottom: `2px solid ${BRAND_LIGHT}` }}>
                            <h5 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>
                                <Award className="me-2" size={20} style={{ color: BRAND_COLOR }} />
                                To'liq Reytinglar
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: BRAND_LIGHT }}>
                                        <tr>
                                            <th className="text-center" width="80" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>O'rin</th>
                                            <th style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Ism</th>
                                            <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Ball</th>
                                            <th className="text-center d-none d-md-table-cell" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Testlar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankings.map((student) => (
                                            <tr
                                                key={student.user_id}
                                                style={{
                                                    backgroundColor: student.is_current_user ? BRAND_LIGHT : '#fff',
                                                    fontWeight: student.is_current_user ? '600' : 'normal',
                                                    borderBottom: '1px solid #f5f5f5'
                                                }}
                                            >
                                                <td className="text-center">
                                                    {student.rank <= 3 ? (
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            {getMedalIcon(student.rank)}
                                                        </div>
                                                    ) : (
                                                        <span className="badge" style={{ backgroundColor: student.is_current_user ? BRAND_COLOR : '#e0e0e0', color: student.is_current_user ? '#fff' : '#666', fontSize: '13px', padding: '6px 12px' }}>
                                                            #{student.rank}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ color: '#333', fontSize: '14px' }}>
                                                        {student.name}
                                                    </span>
                                                    {student.is_current_user && (
                                                        <span className="badge ms-2" style={{ backgroundColor: BRAND_COLOR, color: '#fff', fontSize: '10px', padding: '3px 8px' }}>
                                                            Siz
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center" style={{ fontWeight: '700', color: '#333', fontSize: '15px' }}>
                                                    {student.total_score}
                                                </td>
                                                <td className="text-center text-muted d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                    {student.total_exams}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* Class Rankings */
                <>
                    <p className="text-muted mb-4">
                        <School size={16} className="me-1" />
                        Jami {classRankings.length} sinf
                    </p>

                    {/* Bar Chart */}
                    {classRankings.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white" style={{ borderBottom: `2px solid ${BRAND_LIGHT}` }}>
                                <div className="d-flex align-items-center gap-2">
                                    <BarChart3 size={20} style={{ color: BRAND_COLOR }} />
                                    <h5 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>
                                        Sinflar Bo'yicha To'g'ri Javoblar
                                    </h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={classRankings}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="class_name"
                                            tick={{ fill: '#666', fontSize: 12 }}
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
                                            dataKey="total_correct_answers"
                                            fill={BRAND_COLOR}
                                            name="To'g'ri javoblar"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Class Cards */}
                    <div className="row g-3">
                        {classRankings.map((classData, index) => (
                            <div key={classData.class_id} className="col-md-6 col-lg-4">
                                <div
                                    className="card h-100 border-0 shadow-sm"
                                    style={{
                                        borderLeft: index < 3 ? `4px solid ${index === 0 ? '#FFD700' :
                                            index === 1 ? '#C0C0C0' : '#CD7F32'
                                            }` : `4px solid ${BRAND_COLOR}`
                                    }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    {index < 3 && getMedalIcon(index + 1)}
                                                    <h5 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>
                                                        {classData.class_name}
                                                    </h5>
                                                </div>
                                                <small className="text-muted">
                                                    <Users size={14} className="me-1" />
                                                    {classData.total_students} o'quvchi
                                                </small>
                                            </div>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: index < 3 ?
                                                        (index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32')
                                                        : '#e0e0e0',
                                                    color: index < 3 ? (index === 0 ? '#333' : '#fff') : '#666',
                                                    fontSize: '14px',
                                                    padding: '6px 12px'
                                                }}
                                            >
                                                #{index + 1}
                                            </span>
                                        </div>

                                        <div className="border-top pt-3 mt-3">
                                            <div className="row text-center g-2">
                                                <div className="col-4">
                                                    <Award size={18} style={{ color: BRAND_COLOR }} className="mb-1" />
                                                    <div style={{ fontWeight: '700', color: '#333', fontSize: '16px' }}>
                                                        {classData.total_correct_answers}
                                                    </div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>To'g'ri</small>
                                                </div>
                                                <div className="col-4">
                                                    <BookOpen size={18} style={{ color: '#3b82f6' }} className="mb-1" />
                                                    <div style={{ fontWeight: '700', color: '#333', fontSize: '16px' }}>
                                                        {classData.total_exams}
                                                    </div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>Testlar</small>
                                                </div>
                                                <div className="col-4">
                                                    <TrendingUp size={18} style={{ color: '#10b981' }} className="mb-1" />
                                                    <div style={{ fontWeight: '700', color: '#333', fontSize: '16px' }}>
                                                        {classData.average_score}
                                                    </div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>O'rtacha</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;
