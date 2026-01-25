import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, X, Edit2, Trash2, CreditCard, Package, CheckCircle, Shield, Star, RefreshCw } from 'lucide-react';

// Default plans from mockData - used for seeding
const defaultPlans = [
    {
        id: 'one-on-one-beginner',
        name: 'Personal Beginner Training',
        description: '1-on-1 personalized coaching for beginners',
        price: 60,
        billingCycle: 'MONTHLY',
        level: 'beginner',
        classType: 'one-on-one',
        features: [
            'Dedicated coach assignment',
            'Personalized lesson plans',
            'Flexible scheduling',
            '4 sessions per month',
            'Progress tracking dashboard',
            'Direct coach messaging'
        ],
        isActive: true,
        isFeatured: false,
        sortOrder: 0
    },
    {
        id: 'one-on-one-intermediate',
        name: 'Personal Intermediate Training',
        description: '1-on-1 advanced coaching for intermediate players',
        price: 70,
        billingCycle: 'MONTHLY',
        level: 'intermediate',
        classType: 'one-on-one',
        features: [
            'Expert FIDE Master coach',
            'Advanced tactics training',
            'Tournament preparation',
            '4 sessions per month',
            'Game analysis included',
            'Opening repertoire building'
        ],
        isActive: true,
        isFeatured: true,
        sortOrder: 1
    },
    {
        id: 'group-beginner',
        name: 'Group Beginner Class',
        description: 'Small batch group classes for beginners',
        price: 40,
        billingCycle: 'MONTHLY',
        level: 'beginner',
        classType: 'group',
        features: [
            'Small batch (max 8 students)',
            'Peer learning environment',
            'Fixed schedule (3x/week)',
            '12 sessions per month',
            'Batch group chat access',
            'Shared learning materials'
        ],
        isActive: true,
        isFeatured: false,
        sortOrder: 2
    },
    {
        id: 'group-intermediate',
        name: 'Group Intermediate Class',
        description: 'Skill-matched group classes for intermediate players',
        price: 50,
        billingCycle: 'MONTHLY',
        level: 'intermediate',
        classType: 'group',
        features: [
            'Skill-matched batches',
            'Competitive practice games',
            'Fixed schedule (3x/week)',
            '12 sessions per month',
            'Tournament opportunities',
            'Rating improvement focus'
        ],
        isActive: true,
        isFeatured: false,
        sortOrder: 3
    }
];

const SubscriptionPlansManager = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        billingCycle: 'MONTHLY',
        level: 'beginner',
        classType: 'group',
        features: [''],
        isActive: true,
        isFeatured: false,
        sortOrder: 0
    });

    // Real-time listener for subscription plans
    useEffect(() => {
        const q = query(collection(db, 'subscriptionPlans'), orderBy('sortOrder', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const planList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPlans(planList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching plans:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            billingCycle: 'MONTHLY',
            level: 'beginner',
            classType: 'group',
            features: [''],
            isActive: true,
            isFeatured: false,
            sortOrder: plans.length
        });
        setEditingPlan(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name || '',
            description: plan.description || '',
            price: plan.price || '',
            billingCycle: plan.billingCycle || 'MONTHLY',
            level: plan.level || 'beginner',
            classType: plan.classType || 'group',
            features: plan.features?.length > 0 ? plan.features : [''],
            isActive: plan.isActive !== false,
            isFeatured: plan.isFeatured || false,
            sortOrder: plan.sortOrder || 0
        });
        setShowAddModal(true);
    };

    const handleAddFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const handleRemoveFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleFeatureChange = (index, value) => {
        setFormData(prev => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return { ...prev, features: newFeatures };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Please fill in plan name and price');
            return;
        }

        const planData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            billingCycle: formData.billingCycle,
            level: formData.level,
            classType: formData.classType,
            features: formData.features.filter(f => f.trim() !== ''),
            isActive: formData.isActive,
            isFeatured: formData.isFeatured,
            sortOrder: parseInt(formData.sortOrder) || 0,
            updatedAt: serverTimestamp()
        };

        try {
            if (editingPlan) {
                // Update existing plan
                await updateDoc(doc(db, 'subscriptionPlans', editingPlan.id), planData);
                toast.success('Plan updated successfully!');
            } else {
                // Add new plan
                planData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'subscriptionPlans'), planData);
                toast.success('Plan created successfully!');
            }
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to save plan: ' + error.message);
        }
    };

    const handleDelete = async (plan) => {
        if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

        try {
            await deleteDoc(doc(db, 'subscriptionPlans', plan.id));
            toast.success('Plan deleted successfully');
        } catch (error) {
            toast.error('Failed to delete plan: ' + error.message);
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            await updateDoc(doc(db, 'subscriptionPlans', plan.id), {
                isActive: !plan.isActive,
                updatedAt: serverTimestamp()
            });
            toast.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Seed default plans from mockData
    const handleSeedDefaultPlans = async () => {
        if (!window.confirm('This will add the 4 default plans from the pricing page. Existing plans with the same ID will be skipped. Continue?')) {
            return;
        }

        try {
            const existingIds = plans.map(p => p.id);
            let added = 0;
            let skipped = 0;

            for (const plan of defaultPlans) {
                // Check if plan with this planId already exists
                const exists = plans.some(p => p.planId === plan.id || p.name === plan.name);
                
                if (exists) {
                    skipped++;
                    continue;
                }

                await addDoc(collection(db, 'subscriptionPlans'), {
                    planId: plan.id,
                    name: plan.name,
                    description: plan.description,
                    price: plan.price,
                    billingCycle: plan.billingCycle,
                    level: plan.level,
                    classType: plan.classType,
                    features: plan.features,
                    isActive: plan.isActive,
                    isFeatured: plan.isFeatured,
                    sortOrder: plan.sortOrder,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                added++;
            }

            if (added > 0) {
                toast.success(`Added ${added} default plans! ${skipped > 0 ? `(${skipped} already existed)` : ''}`);
            } else {
                toast.info('All default plans already exist.');
            }
        } catch (error) {
            toast.error('Failed to seed plans: ' + error.message);
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return { bg: '#DCFCE7', color: '#166534' };
            case 'intermediate': return { bg: '#FEF3C7', color: '#92400E' };
            case 'advanced': return { bg: '#FEE2E2', color: '#991B1B' };
            default: return { bg: '#F3F4F6', color: '#374151' };
        }
    };

    const getClassTypeIcon = (type) => {
        return type === 'one-on-one' ? '👤' : '👥';
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: '800', color: '#003366' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            borderRadius: '12px',
                            padding: '10px',
                            display: 'flex'
                        }}>
                            <Package size={24} color="white" />
                        </span>
                        Subscription Plans Manager
                    </h1>
                    <p style={{ color: '#666', margin: '8px 0 0 56px' }}>
                        Create and manage subscription plans for parents to choose from.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                        onClick={handleSeedDefaultPlans} 
                        variant="outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={18} />
                        Seed Default Plans
                    </Button>
                    <Button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Add New Plan
                    </Button>
                </div>
            </div>

            {/* Plans Grid */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading plans...</div>
            ) : plans.length === 0 ? (
                <Card style={{ padding: '60px', textAlign: 'center' }}>
                    <Package size={64} style={{ color: '#ccc', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px', color: '#333' }}>No Subscription Plans Yet</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Create your first subscription plan or seed the default plans from the pricing page.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Button onClick={handleSeedDefaultPlans} variant="outline">
                            <RefreshCw size={16} style={{ marginRight: 8 }} />
                            Seed Default Plans
                        </Button>
                        <Button onClick={handleOpenAdd}>
                            <Plus size={16} style={{ marginRight: 8 }} />
                            Create Custom Plan
                        </Button>
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {plans.map(plan => (
                        <Card key={plan.id} style={{
                            padding: '0',
                            overflow: 'hidden',
                            border: plan.isFeatured ? '2px solid #4facfe' : '1px solid #e5e7eb',
                            opacity: plan.isActive ? 1 : 0.6,
                            position: 'relative'
                        }}>
                            {/* Featured Badge */}
                            {plan.isFeatured && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    color: '#000',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <Star size={12} fill="#000" /> FEATURED
                                </div>
                            )}

                            {/* Plan Header */}
                            <div style={{
                                padding: '24px',
                                background: plan.isActive
                                    ? 'linear-gradient(135deg, #003366 0%, #0f3460 100%)'
                                    : '#6B7280',
                                color: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>{getClassTypeIcon(plan.classType)}</span>
                                    <span style={{
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        backgroundColor: getLevelColor(plan.level).bg,
                                        color: getLevelColor(plan.level).color
                                    }}>
                                        {plan.level}
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700' }}>{plan.name}</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                                    {plan.description || 'No description'}
                                </p>
                            </div>

                            {/* Pricing */}
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: '800', color: '#003366' }}>₹{plan.price?.toLocaleString()}</span>
                                    <span style={{ color: '#666', fontSize: '14px' }}>/{plan.billingCycle?.toLowerCase()}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ padding: '20px 24px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Features Included
                                </h4>
                                {plan.features?.length > 0 ? (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '6px 0',
                                                fontSize: '14px',
                                                color: '#334155'
                                            }}>
                                                <CheckCircle size={16} color="#10B981" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No features listed</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                gap: '8px',
                                backgroundColor: '#F9FAFB'
                            }}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenEdit(plan)}
                                    style={{ flex: 1 }}
                                >
                                    <Edit2 size={14} style={{ marginRight: 4 }} /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant={plan.isActive ? 'secondary' : 'primary'}
                                    onClick={() => handleToggleActive(plan)}
                                    style={{ flex: 1 }}
                                >
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleDelete(plan)}
                                    style={{ color: '#DC2626' }}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Plan Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => { setShowAddModal(false); resetForm(); }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        width: '600px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#003366' }}>
                                {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                            </h3>
                            <button
                                onClick={() => { setShowAddModal(false); resetForm(); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={24} color="#666" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {/* Plan Name */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Plan Name *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Beginner Group Class - Monthly"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this plan..."
                                    rows="2"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Price and Billing Cycle Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Price (₹) *
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="2500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Billing Cycle
                                    </label>
                                    <select
                                        value={formData.billingCycle}
                                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="YEARLY">Yearly</option>
                                        <option value="ONE_TIME">One Time</option>
                                    </select>
                                </div>
                            </div>

                            {/* Level and Class Type Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Level
                                    </label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="all">All Levels</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Class Type
                                    </label>
                                    <select
                                        value={formData.classType}
                                        onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="group">Group Class</option>
                                        <option value="one-on-one">1:1 Coaching</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Features Included
                                </label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <Input
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder={`Feature ${index + 1}`}
                                            style={{ flex: 1 }}
                                        />
                                        {formData.features.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => handleRemoveFeature(index)}
                                                style={{ padding: '8px 12px' }}
                                            >
                                                <X size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddFeature}
                                    size="sm"
                                    style={{ marginTop: '8px' }}
                                >
                                    <Plus size={14} style={{ marginRight: 4 }} /> Add Feature
                                </Button>
                            </div>

                            {/* Options Row */}
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>Active (visible to parents)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>Featured Plan</span>
                                </label>
                            </div>

                            {/* Sort Order */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Sort Order (lower = first)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                                    placeholder="0"
                                    style={{ width: '100px' }}
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                                paddingTop: '16px',
                                borderTop: '1px solid #f0f0f0'
                            }}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingPlan ? '💾 Update Plan' : '✨ Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlansManager;
