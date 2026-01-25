import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import './PlanSelection.css';
import PricingCard from '../components/ui/PricingCard';
import Button from '../components/ui/Button';
import { mockPlans } from '../data/mockData';

const PlanSelection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get('demoId'); // Get demoId from URL if present

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all', '1-on-1', 'Group'
    const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'Beginner', 'Intermediate'

    // Fetch plans from Firestore
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const plansQuery = query(
                    collection(db, 'subscriptionPlans'),
                    where('isActive', '==', true),
                    orderBy('sortOrder', 'asc')
                );
                const snapshot = await getDocs(plansQuery);
                
                if (snapshot.empty) {
                    // Fallback to mockPlans if no plans in database
                    setPlans(mockPlans);
                } else {
                    const plansList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            planId: data.planId || doc.id,
                            name: data.name,
                            type: data.classType === 'one-on-one' ? '1-on-1' : 'Group',
                            level: data.level?.charAt(0).toUpperCase() + data.level?.slice(1) || 'Beginner',
                            price: data.price,
                            billingCycle: data.billingCycle?.toLowerCase() || 'month',
                            features: data.features || [],
                            recommended: data.isFeatured || false,
                            description: data.description,
                            color: data.classType === 'one-on-one' 
                                ? (data.level === 'intermediate' ? 'var(--color-warm-orange)' : 'var(--color-olive-green)')
                                : 'var(--color-deep-blue)'
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

    const filteredPlans = plans.filter(plan => {
        if (filterType !== 'all' && plan.type !== filterType) return false;
        if (filterLevel !== 'all' && plan.level !== filterLevel) return false;
        return true;
    });

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const handleContinue = () => {
        if (selectedPlan) {
            // Pass demoId to checkout if present
            navigate('/payment/checkout', { state: { plan: selectedPlan, demoId } });
        }
    };

    return (
        <div className="plan-selection-page">
            {/* Hero Section */}
            <div className="plan-hero">
                <div className="plan-hero-content">
                    <div className="plan-hero-icon">♔</div>
                    <h1 className="plan-hero-title">Choose Your Path to Mastery</h1>
                    <p className="plan-hero-subtitle">
                        Select the perfect training plan tailored to your chess journey
                    </p>
                </div>
                <div className="plan-hero-pattern"></div>
            </div>

            {/* Filters */}
            <div className="plan-filters">
                <div className="plan-filter-group">
                    <label className="plan-filter-label">Training Type</label>
                    <div className="plan-filter-buttons">
                        <button
                            className={`plan-filter-btn ${filterType === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterType('all')}
                        >
                            All Plans
                        </button>
                        <button
                            className={`plan-filter-btn ${filterType === '1-on-1' ? 'active' : ''}`}
                            onClick={() => setFilterType('1-on-1')}
                        >
                            ♔ 1-on-1
                        </button>
                        <button
                            className={`plan-filter-btn ${filterType === 'Group' ? 'active' : ''}`}
                            onClick={() => setFilterType('Group')}
                        >
                            ♟ Group Classes
                        </button>
                    </div>
                </div>

                <div className="plan-filter-group">
                    <label className="plan-filter-label">Skill Level</label>
                    <div className="plan-filter-buttons">
                        <button
                            className={`plan-filter-btn ${filterLevel === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterLevel('all')}
                        >
                            All Levels
                        </button>
                        <button
                            className={`plan-filter-btn ${filterLevel === 'Beginner' ? 'active' : ''}`}
                            onClick={() => setFilterLevel('Beginner')}
                        >
                            Beginner
                        </button>
                        <button
                            className={`plan-filter-btn ${filterLevel === 'Intermediate' ? 'active' : ''}`}
                            onClick={() => setFilterLevel('Intermediate')}
                        >
                            Intermediate
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Cards Grid */}
            {loading ? (
                <div className="plan-empty-state">
                    <div className="plan-empty-icon">⏳</div>
                    <p>Loading available plans...</p>
                </div>
            ) : (
                <div className="plan-grid">
                    {filteredPlans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className="plan-grid-item"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <PricingCard
                                plan={plan}
                                onSelect={handleSelectPlan}
                                isSelected={selectedPlan?.id === plan.id}
                                showComparison={true}
                            />
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredPlans.length === 0 && (
                <div className="plan-empty-state">
                    <div className="plan-empty-icon">🔍</div>
                    <p>No plans match your filters. Try adjusting your selection.</p>
                </div>
            )}

            {/* Comparison Table */}
            <div className="plan-comparison-section">
                <h2 className="plan-comparison-title">Compare All Plans</h2>
                <div className="plan-comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>1-on-1 Beginner</th>
                                <th>1-on-1 Intermediate</th>
                                <th>Group Beginner</th>
                                <th>Group Intermediate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Price/Month</td>
                                <td>$60</td>
                                <td>$70</td>
                                <td>$40</td>
                                <td>$50</td>
                            </tr>
                            <tr>
                                <td>Sessions/Month</td>
                                <td>4</td>
                                <td>4</td>
                                <td>12</td>
                                <td>12</td>
                            </tr>
                            <tr>
                                <td>Dedicated Coach</td>
                                <td>✓</td>
                                <td>✓</td>
                                <td>—</td>
                                <td>—</td>
                            </tr>
                            <tr>
                                <td>Flexible Scheduling</td>
                                <td>✓</td>
                                <td>✓</td>
                                <td>—</td>
                                <td>—</td>
                            </tr>
                            <tr>
                                <td>Batch Chat</td>
                                <td>—</td>
                                <td>—</td>
                                <td>✓</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>Tournament Prep</td>
                                <td>—</td>
                                <td>✓</td>
                                <td>—</td>
                                <td>✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Family Plan Teaser */}
            <div className="family-plan-banner">
                <div className="family-plan-content">
                    <div className="family-plan-icon">👨‍👩‍👧‍👦</div>
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
                            <div className="plan-sticky-price">${selectedPlan.price}/month</div>
                        </div>
                        <Button
                            onClick={handleContinue}
                            style={{
                                backgroundColor: 'var(--color-warm-orange)',
                                padding: '16px 48px',
                                fontSize: '16px',
                                fontWeight: '600'
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
