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
        features: ['1 Month: $60', '3 Months: $160', '4 Months: $200'],
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
        features: ['1 Month: $70', '3 Months: $187', '4 Months: $233'],
        type: '1-on-1',
        level: 'Intermediate',
        cta: 'Select Plan',
        popular: true,
        color: '#FFA500'
    }
];

const PERIOD_PRICES = {
    'beginner-advanced':  { 1: 60,  3: 160, 4: 200 },
    'intermediate-i-ii':  { 1: 70,  3: 187, 4: 233 },
};

const PERIOD_SAVINGS  = { 1: null, 3: 'Save 11%', 4: 'Save 17%' };
const PERIOD_LABELS   = { 1: '1 Month', 3: '3 Months', 4: '4 Months' };
const BILLING_NOTE    = { 1: 'billed monthly', 3: 'billed every 3 months', 4: 'billed every 4 months' };

const PLAN_FEATURES = {
    beginner: [
        '4 × 1-on-1 sessions per month',
        'Professional FIDE-rated coach',
        'Personalised learning roadmap',
        'Foundational & opening skills',
        'Monthly progress report',
    ],
    intermediate: [
        '4 × 1-on-1 sessions per month',
        'FIDE Master / IM-level coach',
        'Advanced tactics & strategy',
        'Tournament preparation',
        'Deep game analysis',
        'Priority scheduling',
    ],
};

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="8" fill="rgba(74,222,128,0.1)" />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ShieldIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const UsersIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const AwardIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const LockIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const PlanSelection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const demoId = searchParams.get('demoId');

    const [plans, setPlans] = useState(mockPlans);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingPeriod, setBillingPeriod] = useState(1);

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
                setPlans(mockPlans);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const getPrice = (plan) => {
        const prices = PERIOD_PRICES[plan.id];
        if (prices) return prices[billingPeriod];
        // Fallback for Firestore plans
        return billingPeriod === 1
            ? plan.numericPrice
            : billingPeriod === 3
                ? Math.round(plan.numericPrice * 3 * 0.89)
                : Math.round(plan.numericPrice * 4 * 0.83);
    };

    const getMonthlyEq = (plan) => {
        if (billingPeriod === 1) return null;
        return Math.round(getPrice(plan) / billingPeriod);
    };

    const isFeaturedPlan = (plan) => plan.id === 'intermediate-i-ii' || plan.popular;

    const getPlanFeatures = (plan) =>
        isFeaturedPlan(plan) ? PLAN_FEATURES.intermediate : PLAN_FEATURES.beginner;

    const handleSelectPlan = (plan) => setSelectedPlan(plan);

    const handleContinue = () => {
        if (selectedPlan) {
            navigate('/payment/checkout', {
                state: {
                    plan: { ...selectedPlan, price: getPrice(selectedPlan) },
                    demoId
                }
            });
        }
    };

    return (
        <div className="ps-page">

            {/* ── HEADER ── */}
            <section className="ps-header">
                <span className="ps-eyebrow">CHESS COACHING PLANS</span>
                <h1 className="ps-title">
                    Simple,{' '}
                    <span className="ps-title-accent">Transparent</span>
                    <br />Pricing
                </h1>
                <p className="ps-subtitle">
                    No hidden fees. No lock-in contracts.&nbsp;
                    Start with a free demo session.
                </p>
            </section>

            {/* ── BILLING TOGGLE ── */}
            <div className="ps-toggle-wrap">
                <div className="ps-toggle-group">
                    {[1, 3, 4].map((p) => (
                        <button
                            key={p}
                            className={`ps-toggle-btn${billingPeriod === p ? ' active' : ''}`}
                            onClick={() => setBillingPeriod(p)}
                        >
                            {PERIOD_LABELS[p]}
                            {PERIOD_SAVINGS[p] && (
                                <span className="ps-save-pill">{PERIOD_SAVINGS[p]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PRICING CARDS ── */}
            {!loading && (
                <div className="ps-cards">
                    {plans.map((plan) => {
                        const price    = getPrice(plan);
                        const monthly  = getMonthlyEq(plan);
                        const featured = isFeaturedPlan(plan);
                        const selected = selectedPlan?.id === plan.id;
                        const features = getPlanFeatures(plan);

                        return (
                            <div
                                key={plan.id}
                                className={`ps-card${featured ? ' ps-card--featured' : ''}${selected ? ' ps-card--selected' : ''}`}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                {featured && <div className="ps-popular-badge">MOST POPULAR</div>}

                                <div className={`ps-level-pill${featured ? ' featured' : ''}`}>
                                    {plan.level.toUpperCase()}
                                </div>

                                <h3 className="ps-plan-name">{plan.name}</h3>

                                <div className="ps-price-block">
                                    <div className="ps-price-row">
                                        <span className="ps-currency">$</span>
                                        <span className="ps-amount">{price}</span>
                                    </div>
                                    <div className="ps-price-sub">
                                        {monthly
                                            ? <><span className="ps-monthly-eq">${monthly}/mo equivalent</span><br /></>
                                            : null
                                        }
                                        <span className="ps-billing-note">{BILLING_NOTE[billingPeriod]}</span>
                                    </div>
                                </div>

                                <div className="ps-rule" />

                                <ul className="ps-features">
                                    {features.map((f, i) => (
                                        <li key={i} className="ps-feature">
                                            <CheckIcon />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`ps-cta${featured ? ' featured' : ''}${selected ? ' selected' : ''}`}>
                                    {selected
                                        ? '✓ Plan Selected'
                                        : featured
                                            ? 'Select Intermediate'
                                            : 'Select Beginner'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── TRUST STRIP ── */}
            <div className="ps-trust">
                <div className="ps-trust-item"><ShieldIcon /><span>100% Satisfaction</span></div>
                <div className="ps-trust-sep" />
                <div className="ps-trust-item"><UsersIcon /><span>FIDE-Rated Coaches</span></div>
                <div className="ps-trust-sep" />
                <div className="ps-trust-item"><CalendarIcon /><span>4 Sessions / Month</span></div>
                <div className="ps-trust-sep" />
                <div className="ps-trust-item"><AwardIcon /><span>Free Demo First</span></div>
            </div>

            {/* ── COMPARISON TABLE ── */}
            <section className="ps-compare">
                <h2 className="ps-compare-title">Compare Plans</h2>
                <div className="ps-compare-scroll">
                    <table className="ps-table">
                        <thead>
                            <tr>
                                <th className="ps-th-label">Feature</th>
                                <th>Beginner</th>
                                <th className="ps-th-highlight">Intermediate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Monthly price',      '$60',                '$70'],
                                ['Coach level',        'Professional Coach', 'FIDE Master / IM'],
                                ['Sessions / month',   '4',                  '4'],
                                ['Curriculum focus',   'Foundational skills','Advanced tactics'],
                                ['Tournament prep',    '—',                  '✓'],
                                ['Deep game analysis', 'Basic review',       'Full analysis'],
                                ['Personalised plan',  '✓',                  '✓'],
                            ].map(([feature, beg, inter], i) => (
                                <tr key={i}>
                                    <td className="ps-td-label">{feature}</td>
                                    <td className={beg === '—' ? 'ps-td-no' : beg === '✓' ? 'ps-td-yes' : ''}>
                                        {beg}
                                    </td>
                                    <td className={`ps-td-highlight${inter === '✓' ? ' ps-td-yes' : inter === '—' ? ' ps-td-no' : ''}`}>
                                        {inter}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── GUARANTEE ── */}
            <div className="ps-guarantee">
                <LockIcon />
                <span>Free demo session included</span>
                <span className="ps-dot">·</span>
                <span>No commitment required</span>
                <span className="ps-dot">·</span>
                <span>Cancel anytime</span>
            </div>

            {/* ── STICKY BAR ── */}
            {selectedPlan && (
                <div className="ps-sticky-wrap">
                    <div className="ps-sticky">
                        <div className="ps-sticky-inner">
                            <div className="ps-sticky-info">
                                <span className="ps-sticky-name">{selectedPlan.name}</span>
                                <span className="ps-sticky-price">
                                    ${getPrice(selectedPlan)}
                                    <span className="ps-sticky-period">
                                        {' '}/ {billingPeriod === 1 ? 'month' : `${billingPeriod} months`}
                                    </span>
                                </span>
                            </div>
                            <Button
                                onClick={handleContinue}
                                style={{
                                    backgroundColor: '#F88B22',
                                    padding: '13px 36px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    letterSpacing: '0.02em',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Continue to Checkout →
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanSelection;
