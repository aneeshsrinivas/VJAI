import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, arrayUnion, getDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SkillHeatmap from '../../components/features/hackathon/SkillHeatmap';
import AddStudentModal from '../../components/features/admin/AddStudentModal';
import { toast, ToastContainer } from 'react-toastify';
import { Edit2, X, Save, Search, Users, Mail, BookOpen, MapPin, Star } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import '../../pages/Dashboard.css';
import '../../components/ui/Modal.css';
import './StudentDatabase.css';

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
    const [coachNames, setCoachNames] = useState({}); // Cache for coach names
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [batches, setBatches] = useState([]);


    useEffect(() => {
        if (!db) {
            console.error('Firestore database (db) is null. Check Firebase initialization.');
            toast.error('Firestore database not initialized');
            setLoading(false);
            return;
        }

        // Query all users — filter client-side to avoid Firestore 'in' operator bug in onSnapshot
        const q = query(collection(db, 'users'));
        setLoading(true);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentList = querySnapshot.docs
                .filter(doc => doc.data().role?.toLowerCase() === 'customer' || doc.data().studentName)
                .map(doc => {
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
                        assigned_batch_id: data.assignedBatch || data.assignedBatchId || '-',
                        assigned_batch_name: data.assignedBatchName || '-',
                        assigned_coach_id: data.assignedCoach || data.assignedCoachId || '-',
                        chess_usernames: data.chessUsername || '-',
                        rating: data.fideRating || 'Unrated',
                        status: data.status || 'ACTIVE'
                    };
                });
            setStudents(studentList);
            setLoading(false);
        }, (error) => {
            console.error("Error setting up real-time student listener:", error);
            toast.error('Failed to load students');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // load coaches and batches for assignment selects
    useEffect(() => {
        const loadCoaches = async () => {
            try {
                // Load from coaches collection to get the correct doc ID (used for batches subcollection path)
                const snap = await getDocs(query(collection(db, 'coaches'), where('status', '==', 'ACTIVE')));
                const coachList = snap.docs.map(d => ({
                    id: d.id,
                    name: d.data().fullName || d.data().email?.split('@')[0] || d.id
                }));
                setCoaches(coachList);
                console.log('Loaded coaches:', coachList);
            } catch (err) {
                console.error('Error loading coaches:', err);
            }
        };
        loadCoaches();
    }, []);

    // Fetch batches from coach subcollection when coach is selected
    useEffect(() => {
        const loadBatches = async () => {
            if (!editingStudent?.assigned_coach_id) {
                setBatches([]);
                return;
            }
            try {
                const bSnap = await getDocs(collection(db, 'coaches', editingStudent.assigned_coach_id, 'batches'));
                const batchList = bSnap.docs.map(d => ({ id: d.id, name: d.data().name || d.id }));
                setBatches(batchList);
            } catch (err) {
                console.error('Error loading batches:', err);
                setBatches([]);
            }
        };
        if (editingStudent) {
            loadBatches();
        }
    }, [editingStudent?.assigned_coach_id]);

    const handleEditSave = async () => {
        if (!editingStudent) return;

        try {
            const studentRef = doc(db, 'users', editingStudent.id);

            // 1. Fetch current data to handle batch switching
            const currentSnap = await getDoc(studentRef);
            if (currentSnap.exists()) {
                const oldData = currentSnap.data();
                const oldBatchId = oldData.assignedBatchId || oldData.assignedBatch;
                const oldCoachId = oldData.assignedCoachId || oldData.assignedCoach;

                // Check if batch changed/removed
                if (oldBatchId && oldBatchId !== editingStudent.assigned_batch_id) {
                    if (oldCoachId) {
                        try {
                            const oldBatchRef = doc(db, 'coaches', oldCoachId, 'batches', oldBatchId);
                            await updateDoc(oldBatchRef, {
                                studentsId: arrayRemove(editingStudent.id),
                                updatedAt: serverTimestamp()
                            });
                            console.log(`Removed student from old batch: ${oldBatchId}`);
                        } catch (err) {
                            console.error("Error removing from old batch:", err);
                        }
                    }
                }
            }

            // Update the student document
            await updateDoc(studentRef, {
                studentName: editingStudent.student_name,
                studentAge: editingStudent.student_age,
                studentType: editingStudent.student_type,
                learningLevel: editingStudent.level,
                country: editingStudent.country,
                timezone: editingStudent.timezone,
                status: editingStudent.status,
                fideRating: editingStudent.rating,
                // assignment fields (support older and newer field names)
                assignedCoach: editingStudent.assigned_coach_id || null,
                assignedCoachId: editingStudent.assigned_coach_id || null,
                assignedBatch: editingStudent.assigned_batch_id || null,
                assignedBatchId: editingStudent.assigned_batch_id || null,
                assignedBatchName: editingStudent.assigned_batch_name || null,
                updatedAt: serverTimestamp()
            });

            // If batch is assigned, add student ID to batch's studentsId array
            if (editingStudent.assigned_coach_id && editingStudent.assigned_batch_id) {
                const batchRef = doc(db, 'coaches', editingStudent.assigned_coach_id, 'batches', editingStudent.assigned_batch_id);
                await updateDoc(batchRef, {
                    studentsId: arrayUnion(editingStudent.id),
                    updatedAt: serverTimestamp()
                });
            }

            toast.success('Student updated successfully!');
            setEditingStudent(null);
            // Real-time listener auto-updates the list
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Failed to update student');
        }
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const safeStudentName = student.student_name || '';
        const safeParentEmail = student.parent_email || '';
        const safeStudentId = student.student_id || '';

        const matchesSearch = safeStudentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            safeParentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            safeStudentId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
        const matchesType = typeFilter === 'All' || student.student_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Helper function to get coach name from coach ID (synchronous)
    const getCoachName = (coachId) => {
        if (!coachId || coachId === '-') return '-';
        return coachNames[coachId] || coachId;
    };

    // Load coach names for all assigned coaches
    useEffect(() => {
        const loadCoachNames = async () => {
            const uniqueCoachIds = [...new Set(students.map(s => s.assigned_coach_id).filter(id => id && id !== '-'))];
            console.log('Unique coach IDs in students:', uniqueCoachIds);

            const newCoachNames = { ...coachNames };
            for (const coachId of uniqueCoachIds) {
                if (!coachNames[coachId]) {
                    try {
                        const coachDoc = await getDoc(doc(db, 'coaches', coachId));
                        if (coachDoc.exists()) {
                            const coachName = coachDoc.data().fullName || coachDoc.data().email?.split('@')[0] || coachId;
                            newCoachNames[coachId] = coachName;
                            console.log(`Loaded coach name for ${coachId}:`, coachName);
                        }
                    } catch (err) {
                        console.error(`Error fetching coach ${coachId}:`, err);
                        newCoachNames[coachId] = coachId;
                    }
                }
            }
            setCoachNames(newCoachNames);
        };

        if (students.length > 0) {
            loadCoachNames();
        }
    }, [students]);

    return (
        <div className="students-page-container dashboard-container" style={{ minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0, color: COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={28} /> Student Database
                    </h1>
                    <p className="page-subtitle" style={{ color: '#666', margin: '8px 0 0' }}>Manage student profiles, types, and parent details.</p>
                </div>
                <Button onClick={() => setAddModalOpen(true)} style={{ backgroundColor: COLORS.orange, border: 'none' }}>
                    + Add New Student
                </Button>
            </div>

            <Card className="content-card visible" style={{ padding: '24px' }}>
                {/* Filters */}
                <div className="filters-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                        />
                    </div>
                    <select
                        className="filter-select"
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
                        className="filter-select"
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
                    <div className="stat-box count-box admin-panel-list-item" style={{ padding: '12px 20px', borderRadius: '8px', border: `2px solid ${COLORS.deepBlue}` }}>
                        <span className="stat-val" style={{ fontWeight: '700', fontSize: '18px' }}>{students.length}</span>
                        <span className="stat-label" style={{ marginLeft: '8px', fontSize: '13px' }}>Total Students</span>
                    </div>
                    <div className="stat-box active-box admin-panel-list-item" style={{ padding: '12px 20px', borderRadius: '8px', border: '2px solid #10B981' }}>
                        <span className="stat-val" style={{ fontWeight: '700', color: '#10B981', fontSize: '18px' }}>{students.filter(s => s.status === 'ACTIVE').length}</span>
                        <span className="stat-label" style={{ marginLeft: '8px', fontSize: '13px' }}>Active</span>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="students-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${COLORS.deepBlue}`, textAlign: 'left', color: COLORS.deepBlue, fontSize: '12px', textTransform: 'uppercase' }}>
                                <th style={{ padding: '12px' }}>Student Info</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="1" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading Students...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="1" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No students found.</td></tr>
                            ) : (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className="student-row" style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                                                {/* Student Name & ID Section */}
                                                <div style={{ minWidth: '160px' }}>
                                                    <div className="primary-text" style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{student.student_name}</div>
                                                    <div className="secondary-text" style={{ fontSize: '13px' }}>{student.student_id} • Age {student.student_age}</div>
                                                </div>

                                                {/* Parent Contact Section */}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '220px' }}>
                                                    <Mail size={14} style={{ color: COLORS.orange, marginTop: '3px', flexShrink: 0 }} />
                                                    <div>
                                                        <div className="primary-text" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.3' }}>{student.parent_name}</div>
                                                        <div className="secondary-text" style={{ fontSize: '12px', lineHeight: '1.3' }}>{student.parent_email}</div>
                                                    </div>
                                                </div>

                                                {/* Type & Level Section */}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '140px' }}>
                                                    <BookOpen size={14} style={{ color: COLORS.orange, marginTop: '3px', flexShrink: 0 }} />
                                                    <div>
                                                        <div className="primary-text" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.3' }}>{student.student_type}</div>
                                                        <div className="secondary-text" style={{ fontSize: '12px', lineHeight: '1.3' }}>{student.level}</div>
                                                    </div>
                                                </div>

                                                {/* Batch & Coach Section */}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '180px' }}>
                                                    <Users size={14} style={{ color: COLORS.orange, marginTop: '3px', flexShrink: 0 }} />
                                                    <div>
                                                        <div className="primary-text" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.3' }}>{student.assigned_batch_name}</div>
                                                        <div className="secondary-text" style={{ fontSize: '12px', lineHeight: '1.3' }}>Coach: {getCoachName(student.assigned_coach_id)}</div>
                                                    </div>
                                                </div>

                                                {/* Location Section */}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '140px' }}>
                                                    <MapPin size={14} style={{ color: COLORS.orange, marginTop: '3px', flexShrink: 0 }} />
                                                    <div>
                                                        <div className="primary-text" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.3' }}>{student.country}</div>
                                                        <div className="secondary-text" style={{ fontSize: '12px', lineHeight: '1.3' }}>{student.timezone}</div>
                                                    </div>
                                                </div>

                                                {/* Rating, Status & Actions */}
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto', minWidth: '220px', justifyContent: 'flex-end' }}>
                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                        <Star size={14} style={{ color: COLORS.orange, fill: COLORS.orange }} />
                                                        <span className="primary-text" style={{ fontSize: '14px', fontWeight: '600' }}>{student.rating}</span>
                                                    </div>
                                                    <span style={{
                                                        backgroundColor: student.status === 'ACTIVE' ? '#E8F5E9' : student.status === 'PAUSED' ? '#FFF3E0' : '#FFEBEE',
                                                        color: student.status === 'ACTIVE' ? '#2E7D32' : student.status === 'PAUSED' ? '#EF6C00' : '#C62828',
                                                        padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap'
                                                    }}>
                                                        {student.status}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingStudent({ ...student })}
                                                        style={{ padding: '4px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </Button>
                                                </div>
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
                onSuccess={() => setAddModalOpen(false)}
            />

            {/* Edit Student Modal */}
            {editingStudent && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="modal-content" style={{
                        borderRadius: '16px', width: '500px', maxWidth: '95%'
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


                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Assigned Coach</label>
                                    <select value={editingStudent.assigned_coach_id || ''} onChange={(e) => setEditingStudent({ ...editingStudent, assigned_coach_id: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}>
                                        <option value="">-- No Coach --</option>
                                        {coaches.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: COLORS.deepBlue, fontSize: '14px' }}>Assigned Batch</label>
                                    <select
                                        value={editingStudent.assigned_batch_id || ''}
                                        onChange={(e) => {
                                            const selectedBatch = batches.find(b => b.id === e.target.value);
                                            setEditingStudent({
                                                ...editingStudent,
                                                assigned_batch_id: e.target.value,
                                                assigned_batch_name: selectedBatch?.name || ''
                                            });
                                        }}
                                        disabled={!editingStudent.assigned_coach_id}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', backgroundColor: !editingStudent.assigned_coach_id ? '#f5f5f5' : '#fff', cursor: !editingStudent.assigned_coach_id ? 'not-allowed' : 'pointer' }}
                                    >
                                        <option value="">{!editingStudent.assigned_coach_id ? '-- Select Coach First --' : '-- No Batch --'}</option>
                                        {batches.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
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
