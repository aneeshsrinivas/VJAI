import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { ClipboardCheck, Calendar, Users, Check, X, Save, ChevronDown, Clock } from 'lucide-react';
import './CoachAttendance.css';

const CoachAttendance = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [existingRecords, setExistingRecords] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recentHistory, setRecentHistory] = useState([]);
    const [coachDocId, setCoachDocId] = useState(null);

    // Step 1: Resolve coachDocId from coaches collection
    useEffect(() => {
        if (!currentUser?.uid) return;

        const resolveCoachId = async () => {
            try {
                // Try to find the coach doc whose accountId matches our auth UID
                const coachQuery = query(
                    collection(db, 'coaches'),
                    where('accountId', '==', currentUser.uid)
                );
                const coachSnap = await getDocs(coachQuery);
                if (!coachSnap.empty) {
                    setCoachDocId(coachSnap.docs[0].id);
                } else {
                    // Fallback: the coach doc ID might be the auth UID directly
                    setCoachDocId(currentUser.uid);
                }
            } catch (err) {
                console.error('Could not resolve coachDocId, falling back to uid:', err);
                setCoachDocId(currentUser.uid);
            }
        };
        resolveCoachId();
    }, [currentUser]);

    // Step 2: Fetch batches using the resolved coachDocId
    useEffect(() => {
        if (!coachDocId) return;
        const batchesRef = collection(db, 'coaches', coachDocId, 'batches');
        const unsub = onSnapshot(batchesRef, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setBatches(list);
            setLoading(false);
        }, (error) => {
            console.error('Batch fetch error:', error);
            // Fallback: try auth UID directly if coachDocId is different
            if (coachDocId !== currentUser?.uid) {
                const fallbackRef = collection(db, 'coaches', currentUser.uid, 'batches');
                onSnapshot(fallbackRef, (snap) => {
                    setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    setLoading(false);
                }, () => {
                    setBatches([]);
                    setLoading(false);
                });
            } else {
                setBatches([]);
                setLoading(false);
            }
        });
        return () => unsub();
    }, [coachDocId, currentUser]);

    // Fetch students when batch selected
    useEffect(() => {
        if (!selectedBatch) {
            setStudents([]);
            return;
        }
        const studentIds = selectedBatch.studentsId || [];
        if (studentIds.length === 0) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            const studentList = [];
            for (const sid of studentIds) {
                try {
                    const snap = await getDoc(doc(db, 'users', sid));
                    if (snap.exists()) {
                        studentList.push({ id: snap.id, ...snap.data() });
                    }
                } catch (e) {
                    console.error('Error fetching student:', sid, e);
                }
            }
            setStudents(studentList);
            // Initialize attendance to 'present' for all
            const initial = {};
            studentList.forEach(s => { initial[s.id] = 'present'; });
            setAttendance(initial);
        };
        fetchStudents();
    }, [selectedBatch]);

    // Fetch existing attendance for selected date + batch
    useEffect(() => {
        if (!selectedBatch || !selectedDate || !currentUser?.uid) return;

        const q = query(
            collection(db, 'attendance'),
            where('coachId', '==', currentUser.uid),
            where('batchId', '==', selectedBatch.id),
            where('date', '==', selectedDate)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const records = {};
            snapshot.docs.forEach(d => {
                const data = d.data();
                records[data.studentId] = { id: d.id, ...data };
            });
            setExistingRecords(records);
            // Pre-fill attendance state from existing records
            setAttendance(prev => {
                const updated = { ...prev };
                Object.entries(records).forEach(([sid, rec]) => {
                    updated[sid] = rec.status;
                });
                return updated;
            });
        });

        return () => unsub();
    }, [selectedBatch, selectedDate, currentUser]);

    // Fetch recent attendance history for selected batch
    useEffect(() => {
        if (!selectedBatch || !currentUser?.uid) {
            setRecentHistory([]);
            return;
        }

        const q = query(
            collection(db, 'attendance'),
            where('coachId', '==', currentUser.uid),
            where('batchId', '==', selectedBatch.id)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Group by date
            const grouped = {};
            records.forEach(r => {
                if (!grouped[r.date]) grouped[r.date] = { present: 0, absent: 0, total: 0 };
                grouped[r.date].total++;
                if (r.status === 'present') grouped[r.date].present++;
                else grouped[r.date].absent++;
            });
            const history = Object.entries(grouped)
                .map(([date, data]) => ({ date, ...data }))
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10);
            setRecentHistory(history);
        });

        return () => unsub();
    }, [selectedBatch, currentUser]);

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
        }));
    };

    const handleSave = async () => {
        if (!selectedBatch || students.length === 0) return;
        setSaving(true);
        try {
            for (const student of students) {
                const status = attendance[student.id] || 'present';
                const existing = existingRecords[student.id];

                if (existing) {
                    // Update existing record
                    await updateDoc(doc(db, 'attendance', existing.id), {
                        status,
                        markedAt: serverTimestamp()
                    });
                } else {
                    // Create new record
                    await addDoc(collection(db, 'attendance'), {
                        coachId: currentUser.uid,
                        batchId: selectedBatch.id,
                        batchName: selectedBatch.name,
                        studentId: student.id,
                        studentName: student.studentName || student.fullName || 'Student',
                        date: selectedDate,
                        status,
                        markedBy: currentUser.uid,
                        markedAt: serverTimestamp()
                    });
                }
            }
            toast.success('Attendance saved successfully!');
        } catch (e) {
            console.error('Error saving attendance:', e);
            toast.error('Failed to save attendance');
        }
        setSaving(false);
    };

    const alreadyMarked = Object.keys(existingRecords).length > 0;

    if (loading) {
        return (
            <div className={`coach-attendance-page ${isDark ? 'dark' : ''}`}>
                <div className="attendance-loading">
                    <ClipboardCheck size={48} color="#94a3b8" />
                    <p>Loading batches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`coach-attendance-page ${isDark ? 'dark' : ''}`}>
            {/* Header */}
            <div className="attendance-header">
                <div className="header-left">
                    <div className="header-icon">
                        <ClipboardCheck size={28} color="white" />
                    </div>
                    <div>
                        <h1>Attendance</h1>
                        <p>Mark and track student attendance</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="attendance-controls">
                <div className="control-group">
                    <label><Users size={16} /> Select Batch</label>
                    <select
                        value={selectedBatch?.id || ''}
                        onChange={(e) => {
                            const batch = batches.find(b => b.id === e.target.value);
                            setSelectedBatch(batch || null);
                        }}
                    >
                        <option value="">-- Choose Batch --</option>
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({(b.studentsId || []).length} students)</option>
                        ))}
                    </select>
                </div>
                <div className="control-group">
                    <label><Calendar size={16} /> Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            {/* Attendance List */}
            {selectedBatch && (
                <div className="attendance-card">
                    <div className="card-header">
                        <h3>{selectedBatch.name} - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                        {alreadyMarked && (
                            <span className="marked-badge">Already Marked</span>
                        )}
                    </div>

                    {students.length === 0 ? (
                        <div className="empty-state">
                            <Users size={40} color="#94a3b8" />
                            <p>No students in this batch yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="student-list">
                                {students.map(student => (
                                    <div
                                        key={student.id}
                                        className={`student-row ${attendance[student.id] === 'absent' ? 'absent' : 'present'}`}
                                        onClick={() => toggleAttendance(student.id)}
                                    >
                                        <div className="student-info">
                                            <div className="student-avatar">
                                                {(student.studentName || student.fullName || 'S').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="student-name">{student.studentName || student.fullName || 'Student'}</div>
                                                <div className="student-level">{student.level || student.learningLevel || 'Beginner'}</div>
                                            </div>
                                        </div>
                                        <div className={`status-toggle ${attendance[student.id] === 'absent' ? 'absent' : 'present'}`}>
                                            {attendance[student.id] === 'absent' ? (
                                                <><X size={16} /> Absent</>
                                            ) : (
                                                <><Check size={16} /> Present</>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="attendance-summary">
                                <div className="summary-stat">
                                    <span className="stat-value present">{Object.values(attendance).filter(v => v === 'present').length}</span>
                                    <span className="stat-label">Present</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-value absent">{Object.values(attendance).filter(v => v === 'absent').length}</span>
                                    <span className="stat-label">Absent</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-value total">{students.length}</span>
                                    <span className="stat-label">Total</span>
                                </div>
                            </div>

                            <div className="save-bar">
                                <Button onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                                    <Save size={18} /> {saving ? 'Saving...' : alreadyMarked ? 'Update Attendance' : 'Save Attendance'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Recent History */}
            {selectedBatch && recentHistory.length > 0 && (
                <div className="attendance-card history-card">
                    <div className="card-header">
                        <h3><Clock size={18} /> Recent History</h3>
                    </div>
                    <div className="history-list">
                        {recentHistory.map(h => (
                            <div key={h.date} className="history-row">
                                <div className="history-date">
                                    {new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="history-stats">
                                    <span className="history-present">{h.present} present</span>
                                    {h.absent > 0 && <span className="history-absent">{h.absent} absent</span>}
                                </div>
                                <div className="history-percent">
                                    {Math.round((h.present / h.total) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachAttendance;
