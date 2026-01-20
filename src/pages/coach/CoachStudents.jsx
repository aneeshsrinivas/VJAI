import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLLECTIONS } from '../../config/firestoreCollections';
import {
    Users, GraduationCap, Search, Filter, ChevronRight,
    BookOpen, Target, Star, Calendar, MoreVertical
} from 'lucide-react';
import './CoachStudents.css';
import SkillMapModal from '../../components/features/SkillMapModal';
import StudentDetailsModal from '../../components/features/StudentDetailsModal';

const CoachStudents = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [selectedSkillStudent, setSelectedSkillStudent] = useState(null);
    const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);

    useEffect(() => {
        if (!currentUser?.uid) return;

        const loadStudentsFromBatches = async () => {
            try {
                setLoading(true);
                // Get all batches for this coach
                const batchesRef = collection(db, 'coaches', currentUser.uid, 'batches');
                const batchesSnap = await getDocs(batchesRef);

                // Collect all student IDs from all batches
                const studentIds = new Set();
                batchesSnap.docs.forEach(batchDoc => {
                    const batchData = batchDoc.data();
                    if (batchData.studentsId && Array.isArray(batchData.studentsId)) {
                        batchData.studentsId.forEach(id => studentIds.add(id));
                    }
                });

                // If no students, set empty and return
                if (studentIds.size === 0) {
                    setStudents([]);
                    setLoading(false);
                    return;
                }

                // Query users collection for all student IDs
                const studentIdArray = Array.from(studentIds);
                const studentsList = [];

                // Firestore has a limit of 10 items in 'in' query, so chunk if needed
                const chunkSize = 10;
                for (let i = 0; i < studentIdArray.length; i += chunkSize) {
                    const chunk = studentIdArray.slice(i, i + chunkSize);
                    const q = query(
                        collection(db, 'users'),
                        where('__name__', 'in', chunk)
                    );
                    const snapshot = await getDocs(q);
                    snapshot.docs.forEach(doc => {
                        studentsList.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                }

                setStudents(studentsList);
            } catch (error) {
                console.error('Error fetching students from batches:', error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        loadStudentsFromBatches();
    }, [currentUser]);

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.studentName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterLevel === 'all' || student.level === filterLevel;
        return matchesSearch && matchesFilter;
    });

    const getLevelBadge = (level) => {
        const badges = {
            beginner: { label: '🌱 Beginner', className: 'beginner' },
            intermediate: { label: '📚 Intermediate', className: 'intermediate' },
            advanced: { label: '🏆 Advanced', className: 'advanced' }
        };
        return badges[level?.toLowerCase()] || badges.beginner;
    };

    const getStudentType = (type) => {
        return type === '1-1' ? '1-on-1' : 'Group';
    };

    if (loading) {
        return (
            <div className="coach-students-loading">
                <div className="loading-spinner">👥</div>
                <p>Loading your students...</p>
            </div>
        );
    }

    return (
        <div className="coach-students-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <GraduationCap size={28} color="#FC8A24" />
                    <div>
                        <h1>My Students</h1>
                        <p>{students.length} student{students.length !== 1 ? 's' : ''} assigned to you</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No Students Found</h3>
                    <p>
                        {students.length === 0
                            ? 'You don\'t have any students assigned yet. Students will appear here once admin assigns them to you.'
                            : 'No students match your search criteria.'}
                    </p>
                </div>
            ) : (
                <div className="students-grid">
                    {filteredStudents.map(student => {
                        const levelBadge = getLevelBadge(student.level);
                        return (
                            <div key={student.id} className="student-card">
                                <div className="card-header">
                                    <div className="student-avatar">
                                        {(student.studentName || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <button className="btn-more">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <h3>{student.studentName || 'Unknown Student'}</h3>
                                    <p className="student-age">{student.studentAge} years old</p>

                                    <div className="badges-row">
                                        <span className={`badge level ${levelBadge.className}`}>
                                            {levelBadge.label}
                                        </span>
                                        <span className="badge type">
                                            {getStudentType(student.studentType)}
                                        </span>
                                    </div>

                                    <div className="student-meta">
                                        <div className="meta-item">
                                            <Calendar size={14} />
                                            <span>Joined {student.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                                        </div>
                                        {student.batchName && (
                                            <div className="meta-item">
                                                <BookOpen size={14} />
                                                <span>{student.batchName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button className="btn-view" onClick={() => setSelectedSkillStudent(student)}>
                                        🎯 View Skills
                                    </button>
                                    <button className="btn-secondary" onClick={() => setSelectedDetailStudent(student)}>
                                        View Details <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SkillMapModal
                isOpen={!!selectedSkillStudent}
                onClose={() => setSelectedSkillStudent(null)}
                student={selectedSkillStudent}
            />

            <StudentDetailsModal
                isOpen={!!selectedDetailStudent}
                onClose={() => setSelectedDetailStudent(null)}
                student={selectedDetailStudent}
            />
        </div>
    );
};

export default CoachStudents;
