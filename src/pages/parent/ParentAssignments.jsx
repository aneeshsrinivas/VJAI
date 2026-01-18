import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText, CheckCircle, Clock, Upload, ArrowRight } from 'lucide-react';

const ParentAssignments = () => {
    const assignments = [
        { id: 1, title: 'Endgame: King & Pawn Mastery', dueDate: 'Jan 25, 2026', status: 'Pending', type: 'Puzzle Set', pieces: 12, description: "Solve the 12 key pawn structures." },
        { id: 2, title: 'Middle Game Tactics Quiz', dueDate: 'Jan 22, 2026', status: 'Submitted', type: 'Quiz', score: '-', description: "Review and solve tactical pins and skewers." },
        { id: 3, title: 'Opening Principles: Italian Game', dueDate: 'Jan 18, 2026', status: 'Graded', score: '9/10', type: 'Video Review', description: "Watch the analysis of your last game." }
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: '#FFF7ED', color: '#C2410C', icon: Clock, label: 'Due Soon' };
            case 'Submitted': return { bg: '#F0F9FF', color: '#0369A1', icon: CheckCircle, label: 'In Review' };
            case 'Graded': return { bg: '#F0FDF4', color: '#15803D', icon: CheckCircle, label: 'Completed' };
            default: return { bg: '#f5f5f5', color: '#666' };
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#003366',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FileText size={24} color="white" />
                        </span>
                        Arjun's Assignments
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px', marginLeft: '54px' }}>
                        Manage homework, puzzles, and quizzes to reinforce learning.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {assignments.map(item => {
                        const style = getStatusStyle(item.status);
                        const StatusIcon = style.icon;

                        return (
                            <Card key={item.id} className="assignment-card" style={{
                                border: 'none',
                                borderRadius: '16px',
                                padding: '0',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                cursor: 'pointer',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div style={{ padding: '24px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{
                                            background: style.bg,
                                            color: style.color,
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {StatusIcon && <StatusIcon size={14} />} {item.status}
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{item.type}</span>
                                    </div>

                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', lineHeight: '1.4' }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                                        {item.description}
                                    </p>

                                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>Due: <strong style={{ color: '#334155' }}>{item.dueDate}</strong></span>
                                        {item.status === 'Graded' && (
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#003366' }}>Score: {item.score}</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    background: item.status === 'Pending' ? '#f093fb' : '#f8f9fc',
                                    backgroundImage: item.status === 'Pending' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'none',
                                    padding: '16px 24px',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    {item.status === 'Pending' ? (
                                        <button style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}>
                                            <Upload size={18} /> Upload Solution
                                        </button>
                                    ) : (
                                        <button style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#64748b',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}>
                                            View Details <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ParentAssignments;
