import React, { useState, useEffect } from 'react';
import { X, Check, TrendingUp, Award } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';

const SkillMapModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Standard curriculum skills
    const CURRICULUM = [
        { id: 'opening_principles', name: 'Opening Principles', category: 'Strategy' },
        { id: 'basic_tactics', name: 'Basic Tactics (Forks, Pins)', category: 'Tactics' },
        { id: 'checkmate_patterns', name: 'Checkmate Patterns', category: 'Tactics' },
        { id: 'middle_game_planning', name: 'Middle Game Planning', category: 'Strategy' },
        { id: 'endgame_fundamentals', name: 'Endgame Fundamentals', category: 'Endgame' },
        { id: 'advanced_strategy', name: 'Advanced Strategy', category: 'Strategy' },
        { id: 'complex_calculations', name: 'Complex Calculations', category: 'Tactics' }
    ];

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            try {
                // We'll store progress in a 'progress' field on the student doc for simplicity
                // or a subcollection if it gets complex. Let's use the student doc's 'skillsMastered' array.
                const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);
                const studentSnap = await getDoc(studentRef);

                if (studentSnap.exists()) {
                    const data = studentSnap.data();
                    const mastered = data.skillsMastered || [];

                    // Merge curriculum with mastery status
                    const mappedSkills = CURRICULUM.map(skill => ({
                        ...skill,
                        completed: mastered.includes(skill.id),
                        score: mastered.includes(skill.id) ? 100 : 0 // Simplified score
                    }));
                    setSkills(mappedSkills);
                } else {
                    // Fallback local state if doc fetch fails
                    setSkills(CURRICULUM.map(s => ({ ...s, completed: false, score: 0 })));
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
            }
            setLoading(false);
        };

        fetchProgress();
    }, [student.id]);

    const toggleSkill = async (skillId, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic UI update
        setSkills(prev => prev.map(s =>
            s.id === skillId ? { ...s, completed: newStatus, score: newStatus ? 100 : 0 } : s
        ));

        try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);
            if (newStatus) {
                await updateDoc(studentRef, {
                    skillsMastered: arrayUnion(skillId)
                });
            } else {
                await updateDoc(studentRef, {
                    skillsMastered: arrayRemove(skillId)
                });
            }
        } catch (error) {
            console.error("Error updating skill:", error);
            // Revert on error
            setSkills(prev => prev.map(s =>
                s.id === skillId ? { ...s, completed: !newStatus, score: !newStatus ? 100 : 0 } : s
            ));
            alert("Failed to update skill. Please try again.");
        }
    };

    const completedCount = skills.filter(s => s.completed).length;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '24px', padding: '0',
                width: '100%', maxWidth: '500px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Skill Map</h2>
                            <p style={{ margin: '4px 0 0', opacity: 0.9 }}>{student.studentName}'s Progress</p>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading skills...</div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                    <TrendingUp size={20} color="#3b82f6" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                                        {completedCount} / {CURRICULUM.length}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Skills Mastered</div>
                                </div>
                                <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Award size={20} color="#f59e0b" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                                        {Math.round((completedCount / CURRICULUM.length) * 100)}%
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Completion</div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                                Curriculum Checklist
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {skills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        onClick={() => toggleSkill(skill.id, skill.completed)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '16px',
                                            padding: '12px', borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: skill.completed ? '#dcfce7' : '#e2e8f0',
                                            background: skill.completed ? '#f0fdf4' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '6px',
                                            border: skill.completed ? 'none' : '2px solid #cbd5e1',
                                            background: skill.completed ? '#22c55e' : 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {skill.completed && <Check size={16} color="white" />}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', color: skill.completed ? '#15803d' : '#334155', textDecoration: skill.completed ? 'none' : 'none' }}>
                                                    {skill.name}
                                                </span>
                                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b' }}>
                                                    {skill.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillMapModal;
