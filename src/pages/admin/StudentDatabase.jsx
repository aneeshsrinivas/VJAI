import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SkillHeatmap from '../../components/features/hackathon/SkillHeatmap';
import AddStudentModal from '../../components/features/admin/AddStudentModal';
import { toast, ToastContainer } from 'react-toastify';
import { Edit2, X, Save, Search, Users } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import '../../pages/Dashboard.css';

// ICA Colors
const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
    ivory: '#FFFEF3'
};

const StudentDatabase = () => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Fetch Coaches for dropdown
    const fetchCoaches = async () => {
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'coach'));
            const snap = await getDocs(q);
            setCoaches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error("Error fetching coaches:", e);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'customer'));
            const querySnapshot = await getDocs(q);
            const studentList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    student_id: doc.id.substring(0, 8).toUpperCase(),
                    student_name: data.studentName || data.fullName || 'N/A',
                    student_age: data.studentAge || '-',
                    parent_name: data.fullName || 'N/A',
                    parent_email: data.email,
                    timezone: data.timezone || '-',
                    country: data.country || '-',
                    student_type: data.studentType || 'Group',
                    level: data.learningLevel || 'Beginner',
                    assigned_batch_id: data.batchName || data.assignedBatch || '-', // standardized to batchName
                    assigned_coach_id: data.assignedCoachId || data.assignedCoach || '-', // standardized to assignedCoachId
                    chess_usernames: data.chessUsername || '-',
                    rating: data.fideRating || 'Unrated',
                    status: data.status || 'ACTIVE'
                };
            });
            setStudents(studentList);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchCoaches();
    }, []);

    const handleEditSave = async () => {
        if (!editingStudent) return;

        try {
            await updateDoc(doc(db, 'users', editingStudent.id), {
                studentName: editingStudent.student_name,
                studentAge: editingStudent.student_age,
                studentType: editingStudent.student_type,
                learningLevel: editingStudent.level,
                country: editingStudent.country,
                timezone: editingStudent.timezone,
                status: editingStudent.status,
                fideRating: editingStudent.rating,
                assignedCoachId: editingStudent.assigned_coach_id === '-' ? null : editingStudent.assigned_coach_id,
                batchName: editingStudent.assigned_batch_id === '-' ? null : editingStudent.assigned_batch_id,
                assignedBatch: editingStudent.assigned_batch_id === '-' ? null : editingStudent.assigned_batch_id, // Redundant save
                updatedAt: serverTimestamp()
            });

            toast.success('Student updated successfully!');
            setEditingStudent(null);
            fetchStudents();
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Failed to update student');
        }
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.parent_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
        const matchesType = typeFilter === 'All' || student.student_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="dashboard-container" style={{ backgroundColor: COLORS.ivory, minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={28} /> Student Database
                    </h1>
                    <p style={{ color: '#666', margin: '8px 0 0' }}>Manage student profiles, types, and parent details.</p>
                </div>
                <Button onClick={() => setAddModalOpen(true)} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                    + Add New Student
                </Button>
            </div>

            <Card style={{ padding: '24px' }}>
                {/* Filters */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '140px' }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '120px' }}
                    >
                        <option value="All">All Types</option>
                        <option value="Group">Group</option>
                        <option value="1-1">1-1</option>
                    </select>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px 20px', background: '#fff', borderRadius: '8px', border: `2px solid ${COLORS.deepBlue}` }}>
                        <span style={{ fontWeight: '700', color: COLORS.deepBlue, fontSize: '18px' }}>{students.length}</span>
                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '13px' }}>Total Students</span>
                    </div>
                    <div style={{ padding: '12px 20px', background: '#fff', borderRadius: '8px', border: '2px solid #10B981' }}>
                        <span style={{ fontWeight: '700', color: '#10B981', fontSize: '18px' }}>{students.filter(s => s.status === 'ACTIVE').length}</span>
                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '13px' }}>Active</span>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${COLORS.deepBlue}`, textAlign: 'left', color: COLORS.deepBlue, fontSize: '12px', textTransform: 'uppercase' }}>
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
                                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading Students...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No students found.</td></tr>
                            ) : (
                                filteredStudents.map(student => (
                                    <tr key={student.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ fontWeight: '600', color: COLORS.deepBlue }}>{student.student_name}</div>
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
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingStudent({ ...student })}
                                                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </Button>
                                                <SkillHeatmap studentName={student.student_name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={fetchStudents}
            />

            {/* Edit Student Modal */}
            {editingStudent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '16px', width: '500px', maxWidth: '95%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #eee',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: COLORS.deepBlue }}>Edit Student</h3>
                            <button onClick={() => setEditingStudent(null)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: '#666'
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Student Name</label>
                                <input
                                    type="text"
                                    value={editingStudent.student_name}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, student_name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Age</label>
                                    <input
                                        type="text"
                                        value={editingStudent.student_age}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, student_age: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Rating</label>
                                    <input
                                        type="text"
                                        value={editingStudent.rating}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, rating: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Type</label>
                                    <select
                                        value={editingStudent.student_type}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, student_type: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    >
                                        <option value="Group">Group</option>
                                        <option value="1-1">1-1</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Level</label>
                                    <select
                                        value={editingStudent.level}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, level: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Country</label>
                                    <input
                                        type="text"
                                        value={editingStudent.country}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, country: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Status</label>
                                    <select
                                        value={editingStudent.status}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="PAUSED">Paused</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                            </div>

                            {/* Coach & Batch Assignment */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Assigned Coach</label>
                                    <select
                                        value={editingStudent.assigned_coach_id === '-' ? '' : editingStudent.assigned_coach_id}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, assigned_coach_id: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    >
                                        <option value="">No Coach Assigned</option>
                                        {coaches.map(c => (
                                            <option key={c.id} value={c.id}>{c.fullName || c.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Batch Name</label>
                                    <select
                                        value={editingStudent.assigned_batch_id === '-' ? '' : editingStudent.assigned_batch_id}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, assigned_batch_id: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                                    >
                                        <option value="">Select Batch...</option>
                                        <option value="Beginner Group">Beginner Group</option>
                                        <option value="Intermediate Group">Intermediate Group</option>
                                        <option value="Intermediate 1:1">Intermediate 1:1</option>
                                        <option value="Advanced Group">Advanced Group</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => setEditingStudent(null)}>Cancel</Button>
                            <Button onClick={handleEditSave} style={{ backgroundColor: COLORS.oliveGreen, border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    </div>
                </div >
            )}
        </div >
    );
};

export default StudentDatabase;
