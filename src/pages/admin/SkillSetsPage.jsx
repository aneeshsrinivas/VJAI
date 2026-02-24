import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast, ToastContainer } from 'react-toastify';
import { Target, Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

const SkillSetsPage = () => {
    const [skillSets, setSkillSets] = useState({
        beginner: [],
        intermediate: [],
        advanced: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedLevel, setExpandedLevel] = useState('beginner');
    const [editingSkill, setEditingSkill] = useState(null);
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Strategy' });

    const categories = ['Strategy', 'Tactics', 'Endgame', 'Opening', 'Psychology'];

    // Fetch skill sets from Firestore
    useEffect(() => {
        const fetchSkillSets = async () => {
            try {
                const levels = ['beginner', 'intermediate', 'advanced'];
                const fetchedSkills = { beginner: [], intermediate: [], advanced: [] };
                
                for (const level of levels) {
                    const docRef = doc(db, 'skillsets', level);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        fetchedSkills[level] = docSnap.data().skills || [];
                    }
                }
                
                // Check if any level has skills
                const hasSkills = levels.some(level => fetchedSkills[level].length > 0);
                
                if (hasSkills) {
                    setSkillSets(fetchedSkills);
                } else {
                    // Initialize with default skills
                    const defaultSkills = {
                        beginner: [
                            { id: 'piece_movement', name: 'Piece Movement & Rules', category: 'Strategy' },
                            { id: 'checkmate_basics', name: 'Basic Checkmate Patterns', category: 'Tactics' },
                            { id: 'opening_principles', name: 'Opening Principles', category: 'Opening' },
                            { id: 'piece_values', name: 'Piece Values & Exchanges', category: 'Strategy' },
                            { id: 'basic_tactics', name: 'Basic Tactics (Fork, Pin, Skewer)', category: 'Tactics' },
                            { id: 'king_safety', name: 'King Safety & Castling', category: 'Strategy' },
                            { id: 'simple_endgames', name: 'Simple King & Pawn Endgames', category: 'Endgame' }
                        ],
                        intermediate: [
                            { id: 'advanced_tactics', name: 'Advanced Tactics (Discovery, Double Attack)', category: 'Tactics' },
                            { id: 'pawn_structures', name: 'Pawn Structure Understanding', category: 'Strategy' },
                            { id: 'middlegame_planning', name: 'Middlegame Planning', category: 'Strategy' },
                            { id: 'piece_coordination', name: 'Piece Coordination', category: 'Strategy' },
                            { id: 'positional_sacrifices', name: 'Positional Sacrifices', category: 'Tactics' },
                            { id: 'rook_endgames', name: 'Rook Endgames', category: 'Endgame' },
                            { id: 'minor_piece_endgames', name: 'Minor Piece Endgames', category: 'Endgame' },
                            { id: 'opening_repertoire', name: 'Building Opening Repertoire', category: 'Opening' },
                            { id: 'calculation_depth', name: 'Calculation (3-5 moves deep)', category: 'Tactics' },
                            { id: 'prophylaxis', name: 'Prophylactic Thinking', category: 'Strategy' },
                            { id: 'attack_defense', name: 'Attack & Defense Balance', category: 'Strategy' },
                            { id: 'time_management', name: 'Clock Management', category: 'Psychology' }
                        ],
                        advanced: [
                            { id: 'complex_tactics', name: 'Complex Tactical Combinations', category: 'Tactics' },
                            { id: 'strategic_planning', name: 'Long-term Strategic Planning', category: 'Strategy' },
                            { id: 'opening_theory', name: 'Deep Opening Theory', category: 'Opening' },
                            { id: 'opening_novelties', name: 'Opening Novelties & Preparation', category: 'Opening' },
                            { id: 'endgame_technique', name: 'Advanced Endgame Technique', category: 'Endgame' },
                            { id: 'opposite_bishops', name: 'Opposite Color Bishop Endgames', category: 'Endgame' },
                            { id: 'queen_endgames', name: 'Queen Endgames', category: 'Endgame' },
                            { id: 'positional_mastery', name: 'Positional Mastery', category: 'Strategy' },
                            { id: 'dynamic_play', name: 'Dynamic vs Static Positions', category: 'Strategy' },
                            { id: 'deep_calculation', name: 'Deep Calculation (7+ moves)', category: 'Tactics' },
                            { id: 'intuitive_sacrifices', name: 'Intuitive Sacrifices', category: 'Tactics' },
                            { id: 'practical_psychology', name: 'Practical Psychology', category: 'Psychology' },
                            { id: 'tournament_preparation', name: 'Tournament Preparation', category: 'Psychology' },
                            { id: 'analysis_technique', name: 'Game Analysis Technique', category: 'Strategy' },
                            { id: 'converting_advantages', name: 'Converting Advantages', category: 'Strategy' }
                        ]
                    };
                    
                    // Save each level to its own document
                    for (const level of levels) {
                        await setDoc(doc(db, 'skillsets', level), { skills: defaultSkills[level] });
                    }
                    setSkillSets(defaultSkills);
                }
            } catch (error) {
                console.error('Error fetching skill sets:', error);
                toast.error('Failed to load skill sets');
            }
            setLoading(false);
        };

        fetchSkillSets();
    }, []);

    const handleAddSkill = async (level) => {
        if (!newSkill.name.trim()) {
            toast.error('Please enter a skill name');
            return;
        }

        const skillId = newSkill.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const skill = {
            id: skillId,
            name: newSkill.name,
            category: newSkill.category
        };

        const updatedSkills = {
            ...skillSets,
            [level]: [...skillSets[level], skill]
        };

        setSaving(true);
        try {
            await setDoc(doc(db, 'skillsets', level), { skills: updatedSkills[level] });
            setSkillSets(updatedSkills);
            setNewSkill({ name: '', category: 'Strategy' });
            toast.success('Skill added successfully');
        } catch (error) {
            toast.error('Failed to add skill');
        }
        setSaving(false);
    };

    const handleDeleteSkill = async (level, skillId) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) return;

        const updatedSkills = {
            ...skillSets,
            [level]: skillSets[level].filter(s => s.id !== skillId)
        };

        setSaving(true);
        try {
            await setDoc(doc(db, 'skillsets', level), { skills: updatedSkills[level] });
            setSkillSets(updatedSkills);
            toast.success('Skill deleted');
        } catch (error) {
            toast.error('Failed to delete skill');
        }
        setSaving(false);
    };

    const handleUpdateSkill = async (level, skillId, updatedData) => {
        const updatedSkills = {
            ...skillSets,
            [level]: skillSets[level].map(s => 
                s.id === skillId ? { ...s, ...updatedData } : s
            )
        };

        setSaving(true);
        try {
            await setDoc(doc(db, 'skillsets', level), { skills: updatedSkills[level] });
            setSkillSets(updatedSkills);
            setEditingSkill(null);
            toast.success('Skill updated');
        } catch (error) {
            toast.error('Failed to update skill');
        }
        setSaving(false);
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' };
            case 'intermediate': return { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' };
            case 'advanced': return { bg: '#dcfce7', border: '#22c55e', text: '#15803d' };
            default: return { bg: '#f1f5f9', border: '#64748b', text: '#475569' };
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <p>Loading skill sets...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Target size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Skill Sets Management</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b' }}>Define curriculum skills for each level</p>
                </div>
            </div>

            {/* Skill Levels */}
            {['beginner', 'intermediate', 'advanced'].map(level => {
                const colors = getLevelColor(level);
                const isExpanded = expandedLevel === level;
                
                return (
                    <Card key={level} style={{ marginBottom: '16px', border: `2px solid ${colors.border}` }}>
                        {/* Level Header */}
                        <div 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '16px',
                                background: colors.bg,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginBottom: isExpanded ? '16px' : 0
                            }}
                            onClick={() => setExpandedLevel(isExpanded ? null : level)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ 
                                    fontSize: '20px', 
                                    fontWeight: '700', 
                                    color: colors.text,
                                    textTransform: 'capitalize'
                                }}>
                                    {level === 'beginner' ? '🌱' : level === 'intermediate' ? '📚' : '🏆'} {level}
                                </span>
                                <span style={{
                                    background: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: colors.text
                                }}>
                                    {skillSets[level]?.length || 0} skills
                                </span>
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>

                        {/* Skills List */}
                        {isExpanded && (
                            <div style={{ padding: '0 16px 16px' }}>
                                {skillSets[level]?.map(skill => (
                                    <div 
                                        key={skill.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        {editingSkill === skill.id ? (
                                            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                                <input
                                                    type="text"
                                                    defaultValue={skill.name}
                                                    id={`edit-name-${skill.id}`}
                                                    style={{ 
                                                        flex: 1, 
                                                        padding: '8px', 
                                                        borderRadius: '6px', 
                                                        border: '1px solid #e2e8f0' 
                                                    }}
                                                />
                                                <select
                                                    defaultValue={skill.category}
                                                    id={`edit-category-${skill.id}`}
                                                    style={{ 
                                                        padding: '8px', 
                                                        borderRadius: '6px', 
                                                        border: '1px solid #e2e8f0' 
                                                    }}
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleUpdateSkill(level, skill.id, {
                                                        name: document.getElementById(`edit-name-${skill.id}`).value,
                                                        category: document.getElementById(`edit-category-${skill.id}`).value
                                                    })}
                                                    style={{
                                                        background: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingSkill(null)}
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{skill.name}</span>
                                                    <span style={{
                                                        marginLeft: '12px',
                                                        fontSize: '12px',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        background: '#e2e8f0',
                                                        color: '#64748b'
                                                    }}>
                                                        {skill.category}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => setEditingSkill(skill.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#64748b'
                                                        }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSkill(level, skill.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#ef4444'
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* Add New Skill */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '16px',
                                    padding: '16px',
                                    background: colors.bg,
                                    borderRadius: '8px',
                                    border: `1px dashed ${colors.border}`
                                }}>
                                    <input
                                        type="text"
                                        placeholder="New skill name..."
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                    <select
                                        value={newSkill.category}
                                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <Button 
                                        onClick={() => handleAddSkill(level)}
                                        disabled={saving}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Plus size={16} /> Add
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default SkillSetsPage;
