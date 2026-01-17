import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SkillHeatmap from '../../components/features/hackathon/SkillHeatmap';
import '../../pages/Dashboard.css';

const StudentDatabase = () => {
    const students = [
        { id: 'ICA-001', name: 'Arjun Sharma', type: 'Group', level: 'Intermediate', batch: 'Intermediate B2', parent: 'Sharma Family', status: 'ACTIVE' },
        { id: 'ICA-002', name: 'Priya Patel', type: '1-1', level: 'Beginner', batch: '-', parent: 'Patel Family', status: 'ACTIVE' },
        { id: 'ICA-003', name: 'Rohan Gupta', type: 'Group', level: 'Advanced', batch: 'Advanced C1', parent: 'Gupta Family', status: 'PAUSED' },
        { id: 'ICA-004', name: 'Vihaan Verma', type: '1-1', level: 'Beginner', batch: '-', parent: 'Verma Family', status: 'CANCELLED' },
        { id: 'ICA-005', name: 'Ananya Singh', type: 'Group', level: 'Intermediate', batch: 'Intermediate B2', parent: 'Singh Family', status: 'ACTIVE' },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Student Database</h1>
                    <p className="sub-text">Manage student profiles and enrollments.</p>
                </div>
                <Button>Add New Student</Button>
            </div>

            <div className="dashboard-grid">
                <div className="col-12">
                    <Card>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <Input placeholder="Search students..." style={{ width: '300px' }} />
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                <option>All Batches</option>
                                <option>Intermediate B2</option>
                            </select>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#999', fontSize: '12px' }}>
                                    <th style={{ padding: '12px' }}>ID</th>
                                    <th style={{ padding: '12px' }}>NAME</th>
                                    <th style={{ padding: '12px' }}>TYPE</th>
                                    <th style={{ padding: '12px' }}>LEVEL</th>
                                    <th style={{ padding: '12px' }}>BATCH</th>
                                    <th style={{ padding: '12px' }}>PARENT</th>
                                    <th style={{ padding: '12px' }}>STATUS</th>
                                    <th style={{ padding: '12px' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px 12px', fontSize: '14px', color: '#666' }}>{student.id}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: '600' }}>{student.name}</td>
                                        <td style={{ padding: '16px 12px' }}><span style={{ backgroundColor: '#F5F5F5', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{student.type}</span></td>
                                        <td style={{ padding: '16px 12px' }}>{student.level}</td>
                                        <td style={{ padding: '16px 12px' }}>{student.batch}</td>
                                        <td style={{ padding: '16px 12px' }}>{student.parent}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span style={{
                                                backgroundColor: student.status === 'ACTIVE' ? '#E8F5E9' : student.status === 'PAUSED' ? '#FFF3E0' : '#FFEBEE',
                                                color: student.status === 'ACTIVE' ? '#2E7D32' : student.status === 'PAUSED' ? '#EF6C00' : '#C62828',
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600'
                                            }}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px', display: 'flex', gap: '8px' }}>
                                            <Button variant="ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Edit</Button>
                                            <SkillHeatmap studentName={student.name} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDatabase;
