import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SkillHeatmap from '../../components/features/hackathon/SkillHeatmap';
import '../../pages/Dashboard.css';

const StudentDatabase = () => {
    // Mock Data based on Core Student Entity 2.2
    const students = [
        {
            student_id: 'ICA-001',
            account_id: 'ACC-101',
            student_name: 'Arjun Sharma',
            student_age: 12,
            parent_name: 'Rahul Sharma',
            parent_email: 'rahul.sharma@example.com',
            timezone: 'IST',
            country: 'India',
            student_type: 'Group',
            level: 'Intermediate',
            assigned_batch_id: 'Intermediate B2',
            assigned_coach_id: 'Coach Ramesh',
            chess_usernames: 'arjun_chess (chess.com)',
            rating: 1250,
            status: 'ACTIVE'
        },
        {
            student_id: 'ICA-002',
            account_id: 'ACC-102',
            student_name: 'Priya Patel',
            student_age: 8,
            parent_name: 'Anjali Patel',
            parent_email: 'anjali.p@example.com',
            timezone: 'EST',
            country: 'USA',
            student_type: '1-1',
            level: 'Beginner',
            assigned_batch_id: '-',
            assigned_coach_id: 'Coach Sarah',
            chess_usernames: '-',
            rating: 800,
            status: 'ACTIVE'
        },
        {
            student_id: 'ICA-003',
            account_id: 'ACC-103',
            student_name: 'Rohan Gupta',
            student_age: 15,
            parent_name: 'Vikram Gupta',
            parent_email: 'vikram.g@example.com',
            timezone: 'IST',
            country: 'India',
            student_type: 'Group',
            level: 'Advanced',
            assigned_batch_id: 'Advanced C1',
            assigned_coach_id: 'Coach Ramesh',
            chess_usernames: 'rohan_gm_wannabe (lichess)',
            rating: 1600,
            status: 'PAUSED'
        },
        {
            student_id: 'ICA-004',
            account_id: 'ACC-104',
            student_name: 'Vihaan Verma',
            student_age: 10,
            parent_name: 'Suresh Verma',
            parent_email: 'suresh.v@example.com',
            timezone: 'GMT',
            country: 'UK',
            student_type: '1-1',
            level: 'Beginner',
            assigned_batch_id: '-',
            assigned_coach_id: 'Coach Mike',
            chess_usernames: '-',
            rating: 'Unrated',
            status: 'CANCELLED'
        },
        {
            student_id: 'ICA-005',
            account_id: 'ACC-105',
            student_name: 'Ananya Singh',
            student_age: 11,
            parent_name: 'Meera Singh',
            parent_email: 'meera.s@example.com',
            timezone: 'IST',
            country: 'India',
            student_type: 'Group',
            level: 'Intermediate',
            assigned_batch_id: 'Intermediate B2',
            assigned_coach_id: 'Coach Ramesh',
            chess_usernames: 'ananya_plays',
            rating: 1100,
            status: 'ACTIVE'
        },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Student Database</h1>
                    <p className="sub-text">Manage student profiles, types, and parent details.</p>
                </div>
                <Button onClick={() => alert('ADD STUDENT: Opening registration modal (Mock)')}>+ Add New Student</Button>
            </div>

            <div className="dashboard-grid">
                <div className="col-12">
                    <Card>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <Input placeholder="Search by name, email, or ID..." style={{ width: '300px' }} />
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                <option>All Statuses</option>
                                <option>Active</option>
                                <option>Paused</option>
                                <option>Cancelled</option>
                            </select>
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                <option>All Types</option>
                                <option>Group</option>
                                <option>1-1</option>
                            </select>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '12px' }}>Student Info</th>
                                        <th style={{ padding: '12px' }}>Parent Contact</th>
                                        <th style={{ padding: '12px' }}>Type & Level</th>
                                        <th style={{ padding: '12px' }}>Batch / Coach</th>
                                        <th style={{ padding: '12px' }}>Location</th>
                                        <th style={{ padding: '12px' }}>Rating</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                        <th style={{ padding: '12px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.student_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--color-deep-blue)' }}>{student.student_name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{student.student_id} | Age: {student.student_age}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ fontSize: '14px' }}>{student.parent_name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{student.parent_email}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ backgroundColor: '#F5F5F5', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{student.student_type}</span>
                                                    <span style={{ fontSize: '14px' }}>{student.level}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ fontSize: '14px' }}>{student.assigned_batch_id}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{student.assigned_coach_id}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ fontSize: '14px' }}>{student.country}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{student.timezone}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                                                {student.rating}
                                            </td>
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
                                                <SkillHeatmap studentName={student.student_name} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDatabase;
