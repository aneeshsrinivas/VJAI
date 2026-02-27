import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText, CheckCircle, Clock, Upload, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';
import { useAuth } from '../../context/AuthContext';
import { where } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';

const ParentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentUser } = useAuth();
    const { isDark } = useTheme();

    const c = {
        pageBg: isDark ? '#0f1117' : 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
        heading: isDark ? '#f0f0f0' : '#181818',
        subtext: isDark ? 'rgba(255,255,255,0.5)' : '#666',
        cardBg: isDark ? '#141820' : 'white',
        cardBorder: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        cardTitle: isDark ? '#e0e0e0' : '#1e293b',
        cardDesc: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
        cardMeta: isDark ? 'rgba(255,255,255,0.4)' : '#64748b',
        cardMetaStrong: isDark ? '#c0c0c0' : '#334155',
        cardScore: isDark ? '#f0f0f0' : '#181818',
        divider: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
        footerBg: isDark ? '#1a1f2e' : '#f8f9fc',
        footerBtnColor: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
        emptyText: isDark ? 'rgba(255,255,255,0.4)' : '#888',
    };

    useEffect(() => {
        if (!currentUser?.uid) return;

        // Listen to the USER document to get assigned batch
        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribeStudent = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const student = docSnap.data();

                console.log('Student data:', student);

                // Get batch ID from user document
                const batchId = student.assignedBatchId || student.assignedBatch;

                console.log('Looking for assignments with batchId:', batchId);

                if (batchId) {
                    // Query assignments filtered by batchId
                    const q = query(
                        collection(db, COLLECTIONS.ASSIGNMENTS),
                        where('batchId', '==', batchId)
                    );

                    const unsubscribeAssignments = onSnapshot(q, (snapshot) => {
                        console.log('Found assignments:', snapshot.docs.length);
                        const list = snapshot.docs.map(doc => {
                            console.log('Assignment:', doc.id, doc.data());
                            return {
                                id: doc.id,
                                ...doc.data()
                            };
                        });

                        // Client-side Sort (Newest First)
                        list.sort((a, b) => {
                            const dateA = a.createdAt?.seconds || 0;
                            const dateB = b.createdAt?.seconds || 0;
                            return dateB - dateA;
                        });

                        setAssignments(list);
                        setLoading(false);
                    });
                    return () => unsubscribeAssignments();
                } else {
                    setLoading(false);
                    setAssignments([]);
                }
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeStudent();
    }, [currentUser]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: '#FFF7ED', color: '#C2410C', icon: Clock, label: 'Due Soon' };
            case 'Submitted': return { bg: '#F0F9FF', color: '#0369A1', icon: CheckCircle, label: 'In Review' };
            case 'Graded': return { bg: '#F0FDF4', color: '#15803D', icon: CheckCircle, label: 'Completed' };
            default: return { bg: '#f5f5f5', color: '#666' };
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: c.pageBg,
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif",
            transition: 'background 0.2s ease'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: c.heading,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'color 0.2s ease'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FileText size={24} color="white" />
                        </span>
                        Assignments
                    </h1>
                    <p style={{ color: c.subtext, fontSize: '16px', marginLeft: '54px', transition: 'color 0.2s ease' }}>
                        Manage homework, puzzles, and quizzes to reinforce learning.
                    </p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: c.emptyText }}>
                        Loading assignments...
                    </div>
                ) : assignments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: c.emptyText }}>
                        No assignments assigned yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {assignments.map(item => {
                            const style = getStatusStyle(item.status);
                            const StatusIcon = style.icon;

                            return (
                                <Card key={item.id} className="assignment-card" style={{
                                    border: c.cardBorder,
                                    borderRadius: '16px',
                                    padding: '0',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.2s ease',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: c.cardBg
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = isDark ? '0 4px 6px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <div style={{ padding: '24px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <div style={{
                                                background: style.bg,
                                                color: style.color,
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {StatusIcon && <StatusIcon size={14} />} {item.status}
                                            </div>
                                            <span style={{ fontSize: '13px', color: c.cardMeta, fontWeight: '500' }}>{item.type}</span>
                                        </div>

                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: c.cardTitle, marginBottom: '12px', lineHeight: '1.4', transition: 'color 0.2s ease' }}>
                                            {item.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: c.cardDesc, lineHeight: '1.6', marginBottom: '20px', transition: 'color 0.2s ease' }}>
                                            {item.description}
                                        </p>

                                        <div style={{ paddingTop: '16px', borderTop: `1px solid ${c.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: c.cardMeta }}>Due: <strong style={{ color: c.cardMetaStrong }}>{item.dueDate}</strong></span>
                                            {item.status === 'Graded' && (
                                                <span style={{ fontSize: '14px', fontWeight: '800', color: c.cardScore }}>Score: {item.score}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: item.status === 'Pending' ? '#f093fb' : c.footerBg,
                                        backgroundImage: item.status === 'Pending' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'none',
                                        padding: '16px 24px',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}>
                                        {item.status === 'Pending' ? (
                                            <button style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'white',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                cursor: 'pointer',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}>
                                                <Upload size={18} /> Upload Solution
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    console.log("Attempting to open:", item.url);
                                                    if (item.url) window.open(item.url, '_blank');
                                                    else alert("Resource link is missing");
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: c.footerBtnColor,
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}>
                                                {item.type === 'PGN' || item.type === 'PDF' ? 'Open Resource' : 'View Details'} <ArrowRight size={16} />
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentAssignments;
