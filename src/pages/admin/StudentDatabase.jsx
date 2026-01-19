import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SkillHeatmap from '../../components/features/hackathon/SkillHeatmap';
import AddStudentModal from '../../components/features/admin/AddStudentModal';
import '../../pages/Dashboard.css';

const StudentDatabase = () => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'customer'));
            const querySnapshot = await getDocs(q);
            const studentList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, // Firestore Doc ID as unique key
                    student_id: doc.id.substring(0, 8).toUpperCase(), // Fake ID for display
                    student_name: data.studentName || data.fullName || 'N/A',
                    student_age: data.studentAge || '-',
                    parent_name: data.fullName || 'N/A', // Assuming fullName is parent's name in 'customer'
                    parent_email: data.email,
                    timezone: data.timezone || '-',
                    country: data.country || '-',
                    student_type: data.studentType || 'Group',
                    level: data.learningLevel || 'Beginner',
                    assigned_batch_id: data.assignedBatch || '-',
                    assigned_coach_id: data.assignedCoach || '-',
                    chess_usernames: data.chessUsername || '-',
                    rating: data.fideRating || 'Unrated',
                    status: data.status || 'ACTIVE'
                };
            });
            setStudents(studentList);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Student Database</h1>
                    <p className="sub-text">Manage student profiles, types, and parent details.</p>
                </div>
                <Button onClick={() => setAddModalOpen(true)}>+ Add New Student</Button>
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
                                    {loading ? (
                                        <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center' }}>Loading Students...</td></tr>
                                    ) : students.length === 0 ? (
                                        <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center' }}>No students found.</td></tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={fetchStudents}
            />
        </div>
    );
};

export default StudentDatabase;
