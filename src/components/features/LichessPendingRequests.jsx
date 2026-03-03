import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { LICHESS_STATUS } from '../../config/firestoreCollections';
import { Link2, CheckCircle, XCircle, Loader2, User, TrendingUp, ExternalLink } from 'lucide-react';
import './LichessPendingRequests.css';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const LichessPendingRequests = ({ currentUser }) => {
    const [pendingStudents, setPendingStudents] = useState([]);
    const [previews, setPreviews] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    // Listen for students with pending lichess requests assigned to this coach
    useEffect(() => {
        if (!currentUser?.uid || !db) return;

        const q = query(
            collection(db, 'users'),
            where('assignedCoachId', '==', currentUser.uid),
            where('role', '==', 'customer'),
            where('lichessStatus', '==', LICHESS_STATUS.PENDING)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setPendingStudents(list);
        }, (error) => {
            console.error('Error fetching pending lichess requests:', error);
            setPendingStudents([]);
        });

        return () => unsub();
    }, [currentUser?.uid]);

    // Fetch Lichess rating preview for each pending student
    useEffect(() => {
        pendingStudents.forEach(async (student) => {
            if (previews[student.id] || !student.lichessUsername) return;

            try {
                const res = await fetch(`${API_BASE}/api/lichess/user/${encodeURIComponent(student.lichessUsername)}`);
                const json = await res.json();
                if (json.success) {
                    setPreviews(prev => ({ ...prev, [student.id]: json.data }));
                }
            } catch (err) {
                console.error(`Failed to preview ${student.lichessUsername}:`, err);
            }
        });
    }, [pendingStudents]);

    const handleApprove = async (student) => {
        const preview = previews[student.id];
        if (!preview) return;

        setActionLoading(prev => ({ ...prev, [student.id]: 'approving' }));

        try {
            const userRef = doc(db, 'users', student.id);
            await updateDoc(userRef, {
                lichessStatus: LICHESS_STATUS.APPROVED,
                lichessApprovedBy: currentUser.uid,
                lichessLinkedAt: serverTimestamp(),
                currentRapid: preview.rapid || 0,
                currentPuzzle: preview.puzzle || 0,
                lastSyncedAt: serverTimestamp(),
            });

            // Store initial rating snapshot
            const histRef = collection(db, 'users', student.id, 'ratingHistory');
            await addDoc(histRef, {
                rapid: preview.rapid || 0,
                puzzle: preview.puzzle || 0,
                timestamp: serverTimestamp(),
                source: 'initial',
            });
        } catch (err) {
            console.error('Approve error:', err);
        } finally {
            setActionLoading(prev => ({ ...prev, [student.id]: null }));
        }
    };

    const handleReject = async (student) => {
        setActionLoading(prev => ({ ...prev, [student.id]: 'rejecting' }));

        try {
            const userRef = doc(db, 'users', student.id);
            await updateDoc(userRef, {
                lichessStatus: LICHESS_STATUS.REJECTED,
            });
        } catch (err) {
            console.error('Reject error:', err);
        } finally {
            setActionLoading(prev => ({ ...prev, [student.id]: null }));
        }
    };

    // Don't render if no pending requests
    if (pendingStudents.length === 0) return null;

    return (
        <div className="lichess-pending-card content-card">
            <div className="lp-header">
                <div className="lp-icon">
                    <Link2 size={20} />
                </div>
                <div>
                    <h3 className="lp-title">Pending Lichess Requests</h3>
                    <p className="lp-subtitle">{pendingStudents.length} student{pendingStudents.length !== 1 ? 's' : ''} waiting for approval</p>
                </div>
            </div>

            <div className="lp-list">
                {pendingStudents.map(student => {
                    const preview = previews[student.id];
                    const loadState = actionLoading[student.id];

                    return (
                        <div key={student.id} className="lp-item">
                            <div className="lp-student-info">
                                <div className="lp-avatar">
                                    <User size={18} />
                                </div>
                                <div>
                                    <div className="lp-student-name">
                                        {student.fullName || student.studentName || student.email}
                                    </div>
                                    <a
                                        href={`https://lichess.org/@/${student.lichessUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="lp-lichess-link"
                                    >
                                        @{student.lichessUsername}
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                            {/* Rating Preview */}
                            <div className="lp-ratings">
                                {preview ? (
                                    <>
                                        <div className="lp-rating-chip rapid">
                                            <TrendingUp size={12} />
                                            Rapid: {preview.rapid ?? '—'}
                                        </div>
                                        <div className="lp-rating-chip puzzle">
                                            <TrendingUp size={12} />
                                            Puzzle: {preview.puzzle ?? '—'}
                                        </div>
                                    </>
                                ) : (
                                    <div className="lp-rating-chip loading">
                                        <Loader2 size={12} className="lp-spin" />
                                        Loading...
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="lp-actions">
                                <button
                                    className="lp-btn approve"
                                    onClick={() => handleApprove(student)}
                                    disabled={!!loadState || !preview}
                                >
                                    {loadState === 'approving' ? <Loader2 size={14} className="lp-spin" /> : <CheckCircle size={14} />}
                                    Approve
                                </button>
                                <button
                                    className="lp-btn reject"
                                    onClick={() => handleReject(student)}
                                    disabled={!!loadState}
                                >
                                    {loadState === 'rejecting' ? <Loader2 size={14} className="lp-spin" /> : <XCircle size={14} />}
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LichessPendingRequests;
