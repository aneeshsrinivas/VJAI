import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import './PlanSelection.css';
import Button from '../components/ui/Button';

const mockPlans = [
    {
        id: 'beginner-advanced',
        name: 'Beginner / Advanced Beginner',
        price: '$60',
        numericPrice: 60,
        period: '/ Month',
        desc: 'Perfect for those starting their chess journey or building strong foundational skills.',
        features: [
            '1 Month: $60',
            '3 Months: $160',
            '4 Months: $200'
        ],
        type: '1-on-1',
        level: 'Beginner',
        cta: 'Select Plan',
        popular: false,
        color: '#4CAF50'
    },
    {
        id: 'intermediate-i-ii',
        name: 'Intermediate-I / Intermediate-II',
        price: '$70',
        numericPrice: 70,
        period: '/ Month',
        desc: 'For players advancing their tactical understanding and competitive readiness.',
        features: [
            '1 Month: $70',
            '3 Months: $187',
            '4 Months: $233'
        ],
        type: '1-on-1',
        level: 'Intermediate',
        cta: 'Select Plan',
        popular: true,
        color: '#FFA500'
    }
];

const PlanSelection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get('demoId');

    const [plans, setPlans] = useState(mockPlans);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            if (!db) return;
            setLoading(true);
            try {
                const plansQuery = query(
                    collection(db, 'subscriptionPlans'),
                    where('isActive', '==', true),
                    orderBy('sortOrder', 'asc')
                );
                const snapshot = await getDocs(plansQuery);

                if (!snapshot.empty) {
                    const plansList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            planId: data.planId || doc.id,
                            name: data.name,
                            price: data.price,
                            numericPrice: data.numericPrice || 0,
                            period: '/ Month',
                            desc: data.description || '',
                            type: data.classType === 'one-on-one' ? '1-on-1' : 'Group',
                            level: data.level?.charAt(0).toUpperCase() + data.level?.slice(1) || 'Beginner',
                            billingCycle: data.billingCycle?.toLowerCase() || 'month',
                            features: data.features || [],
                            popular: data.isFeatured || false,
                            color: data.classType === 'one-on-one'
                                ? (data.level === 'intermediate' ? 'var(--color-warm-orange)' : 'var(--color-olive-green)')
                                : 'var(--color-deep-blue)',
                            cta: 'Select Plan'
                        };
                    });
                    setPlans(plansList);
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
                // Fallback to mockPlans on error
                setPlans(mockPlans);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const handleContinue = () => {
        if (selectedPlan) {
            navigate('/payment/checkout', {
                state: {
                    plan: { ...selectedPlan, price: selectedPlan.numericPrice },
                    demoId
                }
            });
        }
    };

    return (
        <div className="plan-selection-page">
            {/* Hero Section */}
            <div className="plan-hero">
                <div className="plan-hero-bg-glow"></div>
                <div className="plan-hero-content">
                    <div className="hero-icon-animate">♔</div>
                    <h1 className="plan-hero-title">Choose Your Path to Mastery</h1>
                    <p className="plan-hero-subtitle">
                        Premium 1-on-1 coaching tailored to your skill level.
                        <span className="hero-highlight">Start your journey today.</span>
                    </p>
                </div>
            </div>

            {/* Pricing Cards Grid */}
            {loading ? null : (
                <div className="plan-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`pricing-card-glass ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                            onClick={() => handleSelectPlan(plan)}
                        >
                            {plan.popular && <span className="popular-badge">Most Popular</span>}
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                {plan.price}
                                <span className="plan-period">{plan.period}</span>
                            </div>
                            <p className="plan-desc">{plan.desc}</p>
                            <ul className="plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="feature-item">{feature}</li>
                                ))}
                            </ul>
                            <button className="plan-cta">
                                {selectedPlan?.id === plan.id ? '✓ Plan Selected' : plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Comparison Table */}
            <div className="plan-comparison-section">
                <h2 className="plan-comparison-title">Compare Features</h2>
                <div className="plan-comparison-table-wrapper">
                    <table className="plan-comparison-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Beginner</th>
                                <th className="highlight-col">Intermediate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Price per Month</td><td>$60</td><td className="highlight-col">$70</td></tr>
                            <tr><td>Coach Level</td><td>Professional Coach</td><td className="highlight-col">FIDE Master / IM</td></tr>
                            <tr><td>Sessions</td><td>4 per month</td><td className="highlight-col">4 per month</td></tr>
                            <tr><td>Curriculum</td><td>Foundational Skills</td><td className="highlight-col">Advanced Tactics</td></tr>
                            <tr><td>Tournament Prep</td><td><span className="text-muted">—</span></td><td className="highlight-col"><span className="check-icon">✓</span></td></tr>
                            <tr><td>Game Analysis</td><td>Basic Review</td><td className="highlight-col">Deep Analysis</td></tr>
                            <tr><td>Personalized Plan</td><td><span className="check-icon">✓</span></td><td className="highlight-col"><span className="check-icon">✓</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Family Plan Banner */}
            <div className="family-plan-banner">
                <div className="family-plan-content">
                    <div className="family-plan-icon" style={{ fontSize: '48px' }}>👨‍👩‍👧‍👦</div>
                    <div className="family-plan-text">
                        <h3>Have multiple children?</h3>
                        <p>Get 15% off when you enroll 2+ students. Family plans available at checkout!</p>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            {selectedPlan && (
                <div className="plan-sticky-bar">
                    <div className="plan-sticky-content">
                        <div className="plan-sticky-info">
                            <div className="plan-sticky-name">{selectedPlan.name}</div>
                            <div className="plan-sticky-price">{selectedPlan.price}/month</div>
                        </div>
                        <Button
                            onClick={handleContinue}
                            style={{
                                backgroundColor: '#F88B22',
                                padding: '16px 48px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white'
                            }}
                        >
                            Continue to Checkout →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanSelection;
