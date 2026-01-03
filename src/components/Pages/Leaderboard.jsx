import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, TrendingUp, Users } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Leaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [totalStudents, setTotalStudents] = useState(0);

    // School brand color
    const BRAND_COLOR = '#FF8C00';
    const BRAND_LIGHT = '#FFF4E6';

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ranking/class`, {
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
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <Trophy size={28} style={{ color: BRAND_COLOR }} />
                            <h2 className="mb-0" style={{ color: '#333', fontWeight: '600' }}>Sinfim Reytinglari</h2>
                        </div>
                        <p className="text-muted mb-0 mt-2">
                            <Users size={16} className="me-1" />
                            Jami {totalStudents} o'quvchi
                        </p>
                    </div>
                </div>
            </div>

            {/* Top 3 Podium - Mobile Responsive */}
            {rankings.length >= 3 && (
                <div className="row g-3 mb-4">
                    {/* 2nd Place */}
                    <div className="col-md-4 mb-3 order-md-1 order-2">
                        <div className="card h-100 border-0 shadow-sm" style={{ borderTop: '4px solid #C0C0C0' }}>
                            <div className="card-body text-center pt-4">
                                {getMedalIcon(2)}
                                <h4 className="mt-3 mb-2" style={{ color: '#333' }}>{rankings[1].name}</h4>
                                <div
                                    className="badge mb-2"
                                    style={{
                                        backgroundColor: '#C0C0C0',
                                        color: '#fff',
                                        fontSize: '16px',
                                        padding: '6px 16px'
                                    }}
                                >
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

                    {/* 1st Place (Center) - Highlighted */}
                    <div className="col-md-4 mb-3 order-md-2 order-1">
                        <div
                            className="card h-100 border-0 shadow"
                            style={{
                                borderTop: '4px solid #FFD700',
                                transform: 'scale(1.05)'
                            }}
                        >
                            <div className="card-body text-center pt-4" style={{ backgroundColor: BRAND_LIGHT }}>
                                {getMedalIcon(1)}
                                <h3 className="mt-3 mb-2" style={{ color: BRAND_COLOR, fontWeight: '700' }}>
                                    {rankings[0].name}
                                </h3>
                                <div
                                    className="badge mb-2"
                                    style={{
                                        backgroundColor: '#FFD700',
                                        color: '#333',
                                        fontSize: '18px',
                                        padding: '8px 20px',
                                        fontWeight: '700'
                                    }}
                                >
                                    #1
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: '16px' }}>
                                    <TrendingUp size={16} className="me-1" style={{ color: '#FF8C00' }} />
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
                                <div
                                    className="badge mb-2"
                                    style={{
                                        backgroundColor: '#CD7F32',
                                        color: '#fff',
                                        fontSize: '16px',
                                        padding: '6px 16px'
                                    }}
                                >
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

            {/* Full Rankings Table - Clean Design */}
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
                                    <th className="text-center" width="80" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>
                                        O'rin
                                    </th>
                                    <th style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Ism</th>
                                    <th className="text-center" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>Ball</th>
                                    <th className="text-center d-none d-md-table-cell" style={{ color: '#666', fontWeight: '600', fontSize: '13px' }}>
                                        Testlar
                                    </th>
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
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: student.is_current_user ? BRAND_COLOR : '#e0e0e0',
                                                        color: student.is_current_user ? '#fff' : '#666',
                                                        fontSize: '13px',
                                                        padding: '6px 12px'
                                                    }}
                                                >
                                                    #{student.rank}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {student.rank <= 3 && (
                                                    <span className="me-2">
                                                        {getMedalIcon(student.rank)}
                                                    </span>
                                                )}
                                                <span style={{ color: '#333', fontSize: '14px' }}>
                                                    {student.name}
                                                </span>
                                                {student.is_current_user && (
                                                    <span
                                                        className="badge ms-2"
                                                        style={{
                                                            backgroundColor: BRAND_COLOR,
                                                            color: '#fff',
                                                            fontSize: '10px',
                                                            padding: '3px 8px'
                                                        }}
                                                    >
                                                        Siz
                                                    </span>
                                                )}
                                            </div>
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

            {/* Empty State */}
            {rankings.length === 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <Trophy size={64} style={{ color: '#e0e0e0' }} className="mb-3" />
                        <h4 className="text-muted">Hozircha reytinglar yo'q</h4>
                        <p className="text-muted">Testlarni yechib, reytingda o'z o'rningizni egallang!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
