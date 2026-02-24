import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clipboard } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
    const { currentUser } = useAuth();
    const [batchName, setBatchName] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBatchDetails = async () => {
            if (!student || !currentUser?.uid) return;
            
            setLoading(true);
            try {
                // Get the student's assignedBatchId from the user document
                const assignedBatchId = student.assignedBatchId || student.batchId;
                
                if (assignedBatchId) {
                    // Fetch batch from coach's subcollection: coaches/{coachId}/batches/{batchId}
                    const batchRef = doc(db, 'coaches', currentUser.uid, 'batches', assignedBatchId);
                    const batchSnap = await getDoc(batchRef);
                    
                    if (batchSnap.exists()) {
                        setBatchName(batchSnap.data().name || batchSnap.data().batchName);
                    } else {
                        // Fallback to student's stored batch name
                        setBatchName(student.assignedBatchName || student.batchName || 'Batch not found');
                    }
                } else {
                    setBatchName(student.assignedBatchName || student.batchName || 'No Batch Assigned');
                }
            } catch (error) {
                console.error('Error fetching batch:', error);
                setBatchName(student.assignedBatchName || student.batchName || 'Error loading batch');
            }
            setLoading(false);
        };

        if (isOpen && student) {
            fetchBatchDetails();
        }
    }, [isOpen, student, currentUser]);

    if (!isOpen || !student) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '24px', padding: '32px',
                width: '100%', maxWidth: '500px',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '24px', right: '24px',
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b'
                }}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {/* Avatar with Circular Progress Ring */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                        {(() => {
                            const skillsMastered = student.skillsMastered || [];
                            const totalSkills = 7;
                            const progressPercent = Math.round((skillsMastered.length / totalSkills) * 100);
                            const circumference = 2 * Math.PI * 52;
                            const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
                            const progressColor = progressPercent >= 70 ? '#22c55e' : progressPercent >= 40 ? '#f59e0b' : '#3b82f6';
                            
                            return (
                                <>
                                    <svg width="120" height="120" style={{ position: 'absolute', top: '-10px', left: '-10px' }}>
                                        {/* Background circle */}
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="52"
                                            fill="none"
                                            stroke="#e2e8f0"
                                            strokeWidth="8"
                                        />
                                        {/* Progress circle */}
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="52"
                                            fill="none"
                                            stroke={progressColor}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 0.5s ease' }}
                                        />
                                    </svg>
                                    <div style={{
                                        width: '100px', height: '100px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                        color: 'white', fontSize: '40px', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                                        position: 'relative'
                                    }}>
                                        {(student.studentName || 'S').charAt(0)}
                                    </div>
                                    {/* Progress percentage badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-5px',
                                        right: '-5px',
                                        background: progressColor,
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}>
                                        {progressPercent}%
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                        {student.studentName}
                    </h2>
                    {/* Level badge */}
                    <span style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        background: (student.level?.toLowerCase() || '').includes('advanced') ? '#dcfce7' :
                                   (student.level?.toLowerCase() || '').includes('intermediate') ? '#fef3c7' : '#dbeafe',
                        color: (student.level?.toLowerCase() || '').includes('advanced') ? '#15803d' :
                               (student.level?.toLowerCase() || '').includes('intermediate') ? '#b45309' : '#1d4ed8',
                        marginBottom: '8px'
                    }}>
                        {student.level || 'Beginner'}
                    </span>
                    <p style={{ margin: 0, color: '#64748b' }}>{student.studentAge} Years Old</p>
                    {/* Skills progress text */}
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                        <strong style={{ color: '#1e293b' }}>{(student.skillsMastered || []).length}/7</strong> Skills Mastered
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Calendar size={18} color="#f59e0b" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Joined Date</div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {student.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Clipboard size={18} color="#8b5cf6" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Assigned Batch</div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {loading ? 'Loading...' : (batchName || 'No Batch Assigned')}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>Student ID: {student.id}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailsModal;
