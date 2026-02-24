import React, { useState, useEffect } from 'react';
import { X, Check, TrendingUp, Award, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const SkillMapModal = ({ isOpen, onClose, student, onUpgrade }) => {
    if (!isOpen || !student) return null;

    const [skills, setSkills] = useState([]);
    const [curriculum, setCurriculum] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [hasOutdatedSkills, setHasOutdatedSkills] = useState(false);
    const [downgrading, setDowngrading] = useState(false);

    const studentLevel = student?.level?.toLowerCase() || 'beginner';

    const getNextLevel = (currentLevel) => {
        const levels = { 'beginner': 'intermediate', 'intermediate': 'advanced', 'advanced': null };
        return levels[currentLevel] || null;
    };

    const getPreviousLevel = (currentLevel) => {
        const levels = { 'beginner': null, 'intermediate': 'beginner', 'advanced': 'intermediate' };
        return levels[currentLevel] || null;
    };

    const getLevelLabel = (level) => {
        const labels = { 'beginner': '🌱 Beginner', 'intermediate': '📚 Intermediate', 'advanced': '🏆 Advanced' };
        return labels[level] || level;
    };

    useEffect(() => {
        const fetchSkillsAndProgress = async () => {
            setLoading(true);
            try {
                // Fetch curriculum from skillsets collection based on student level
                const skillsetRef = doc(db, 'skillsets', studentLevel);
                const skillsetSnap = await getDoc(skillsetRef);
                
                let levelSkills = [];
                if (skillsetSnap.exists()) {
                    levelSkills = skillsetSnap.data().skills || [];
                }
                setCurriculum(levelSkills);

                // Fetch student's mastered skills from users collection
                const studentRef = doc(db, 'users', student.id);
                const studentSnap = await getDoc(studentRef);

                if (studentSnap.exists()) {
                    const data = studentSnap.data();
                    const mastered = data.skillsMastered || [];
                    
                    // Get valid skill IDs from current curriculum
                    const validSkillIds = levelSkills.map(s => s.id);
                    
                    // Check if student has any outdated skills (skills not in current curriculum)
                    const outdatedSkills = mastered.filter(id => !validSkillIds.includes(id));
                    setHasOutdatedSkills(outdatedSkills.length > 0);

                    // Merge curriculum with mastery status
                    const mappedSkills = levelSkills.map(skill => ({
                        ...skill,
                        completed: mastered.includes(skill.id)
                    }));
                    setSkills(mappedSkills);
                } else {
                    setSkills(levelSkills.map(s => ({ ...s, completed: false })));
                    setHasOutdatedSkills(false);
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
                setSkills([]);
            }
            setLoading(false);
        };

        fetchSkillsAndProgress();
    }, [student.id, studentLevel]);

    const toggleSkill = async (skillId, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic UI update
        setSkills(prev => prev.map(s =>
            s.id === skillId ? { ...s, completed: newStatus } : s
        ));

        try {
            // Update 'users' collection using student.id
            const studentRef = doc(db, 'users', student.id);
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
                s.id === skillId ? { ...s, completed: !newStatus } : s
            ));
            alert("Failed to update skill. Please try again.");
        }
    };

    const completedCount = skills.filter(s => s.completed).length;
    const totalSkills = curriculum.length || 1;
    const completionPercent = Math.round((completedCount / totalSkills) * 100);
    const isFullyCompleted = completedCount === totalSkills && totalSkills > 0;
    const nextLevel = getNextLevel(studentLevel);
    const previousLevel = getPreviousLevel(studentLevel);

    // Sync student's skills with current curriculum (remove outdated, keep valid)
    const handleSyncSkills = async () => {
        setSyncing(true);
        try {
            const studentRef = doc(db, 'users', student.id);
            const studentSnap = await getDoc(studentRef);
            
            if (studentSnap.exists()) {
                const mastered = studentSnap.data().skillsMastered || [];
                const validSkillIds = curriculum.map(s => s.id);
                
                // Keep only skills that exist in current curriculum
                const syncedSkills = mastered.filter(id => validSkillIds.includes(id));
                
                await updateDoc(studentRef, {
                    skillsMastered: syncedSkills
                });
                
                // Update local state
                const mappedSkills = curriculum.map(skill => ({
                    ...skill,
                    completed: syncedSkills.includes(skill.id)
                }));
                setSkills(mappedSkills);
                setHasOutdatedSkills(false);
                
                alert('Skills synced successfully! Outdated skills removed.');
            }
        } catch (error) {
            console.error("Error syncing skills:", error);
            alert("Failed to sync skills. Please try again.");
        }
        setSyncing(false);
    };

    const handleUpgrade = async () => {
        if (!nextLevel) return;
        
        setUpgrading(true);
        try {
            const studentRef = doc(db, 'users', student.id);
            await updateDoc(studentRef, {
                level: nextLevel,
                skillsMastered: [] // Reset skills for new level
            });
            
            if (onUpgrade) {
                onUpgrade(student.id, nextLevel);
            }
            alert(`${student.studentName} has been upgraded to ${getLevelLabel(nextLevel)}!`);
            onClose();
        } catch (error) {
            console.error("Error upgrading student:", error);
            alert("Failed to upgrade student. Please try again.");
        }
        setUpgrading(false);
    };

    const handleDegrade = async () => {
        if (!previousLevel) return;
        
        const confirmDegrade = window.confirm(
            `Are you sure you want to downgrade ${student.studentName} to ${getLevelLabel(previousLevel)}? Their current skills progress will be reset.`
        );
        
        if (!confirmDegrade) return;
        
        setDowngrading(true);
        try {
            const studentRef = doc(db, 'users', student.id);
            await updateDoc(studentRef, {
                level: previousLevel,
                skillsMastered: [] // Reset skills for new level
            });
            
            if (onUpgrade) {
                onUpgrade(student.id, previousLevel);
            }
            alert(`${student.studentName} has been moved to ${getLevelLabel(previousLevel)}.`);
            onClose();
        } catch (error) {
            console.error("Error downgrading student:", error);
            alert("Failed to downgrade student. Please try again.");
        }
        setDowngrading(false);
    };

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
                            <span style={{
                                display: 'inline-block',
                                marginTop: '8px',
                                padding: '4px 12px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                fontSize: '13px'
                            }}>
                                {getLevelLabel(studentLevel)}
                            </span>
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
                    ) : curriculum.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            No skills defined for this level. Contact admin to set up curriculum.
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                    <TrendingUp size={20} color="#3b82f6" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                                        {completedCount} / {totalSkills}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Skills Mastered</div>
                                </div>
                                <div style={{ flex: 1, background: isFullyCompleted ? '#dcfce7' : '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Award size={20} color={isFullyCompleted ? '#22c55e' : '#f59e0b'} style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: isFullyCompleted ? '#15803d' : '#1e293b' }}>
                                        {completionPercent}%
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Completion</div>
                                </div>
                            </div>

                            {/* Sync Skills Button - Shows when student has outdated skills */}
                            {hasOutdatedSkills && (
                                <button
                                    onClick={handleSyncSkills}
                                    disabled={syncing}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        marginBottom: '16px',
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #f59e0b',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: syncing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                                    {syncing ? 'Syncing...' : 'Update Skills - Remove Outdated'}
                                </button>
                            )}

                            {/* Upgrade Button - Shows when 100% complete and not at max level */}
                            {isFullyCompleted && nextLevel && (
                                <button
                                    onClick={handleUpgrade}
                                    disabled={upgrading}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        marginBottom: '24px',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        cursor: upgrading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 14px rgba(34, 197, 94, 0.4)';
                                    }}
                                >
                                    <ArrowUpCircle size={22} />
                                    {upgrading ? 'Upgrading...' : `Upgrade to ${getLevelLabel(nextLevel)}`}
                                </button>
                            )}

                            {/* Max level message */}
                            {isFullyCompleted && !nextLevel && (
                                <div style={{
                                    width: '100%',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    borderRadius: '16px',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: '24px' }}>🏆</span>
                                    <p style={{ margin: '8px 0 0', fontWeight: '600', color: '#92400e' }}>
                                        Congratulations! Student has mastered all Advanced skills!
                                    </p>
                                </div>
                            )}

                            {/* Degrade Button - Shows when not at beginner level */}
                            {previousLevel && (
                                <button
                                    onClick={handleDegrade}
                                    disabled={downgrading}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        marginBottom: '16px',
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        border: '1px solid #fca5a5',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: downgrading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <ArrowDownCircle size={18} />
                                    {downgrading ? 'Downgrading...' : `Downgrade to ${getLevelLabel(previousLevel)}`}
                                </button>
                            )}

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                                Curriculum Checklist ({getLevelLabel(studentLevel)})
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
                                                <span style={{ fontWeight: '600', color: skill.completed ? '#15803d' : '#334155' }}>
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
