import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText, CheckCircle, Clock, Upload } from 'lucide-react';

const ParentAssignments = () => {
    const assignments = [
        { id: 1, title: 'Endgame: King & Pawn', dueDate: 'Jan 25, 2026', status: 'Pending', type: 'Puzzle' },
        { id: 2, title: 'Middle Game Tactics', dueDate: 'Jan 22, 2026', status: 'Submitted', type: 'Quiz' },
        { id: 3, title: 'Opening Principles', dueDate: 'Jan 18, 2026', status: 'Graded', score: '9/10', type: 'Video' }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px', color: 'var(--color-deep-blue)' }}>Arjun's Assignments</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {assignments.map(item => (
                    <Card key={item.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: item.status === 'Pending' ? '#FFF7ED' : '#F0FDF4',
                                    color: item.status === 'Pending' ? 'var(--color-warm-orange)' : 'var(--color-olive-green)'
                                }}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0' }}>{item.title}</h3>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
                                        <span>Due: {item.dueDate}</span>
                                        <span>Type: {item.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                {item.status === 'Pending' && (
                                    <Button size="sm">
                                        <Upload size={16} /> Upload Solution
                                    </Button>
                                )}
                                {item.status === 'Submitted' && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-olive-green)', fontWeight: 'bold' }}>
                                        <Clock size={16} /> Under Review
                                    </span>
                                )}
                                {item.status === 'Graded' && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-deep-blue)', fontWeight: 'bold' }}>
                                        <CheckCircle size={16} /> Score: {item.score}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ParentAssignments;
