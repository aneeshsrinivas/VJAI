import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './PricingSection.css';

const PricingSection = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Beginner / Advanced Beginner',
            price: '$60',
            period: '/ Month',
            desc: 'Perfect for those starting their chess journey or building strong foundational skills.',
            pricingTiers: [
                '1 Month: $60',
                '3 Months: $180',
                '4 Months: $240'
            ],
            cta: 'Join This Class',
            popular: false
        },
        {
            name: 'Intermediate-I / Intermediate-II',
            price: '$70',
            period: '/ Month',
            desc: 'For players advancing their tactical understanding and competitive readiness.',
            pricingTiers: [
                '1 Month: $70',
                '3 Months: $210',
                '4 Months: $280'
            ],
            cta: 'Join This Class',
            popular: true
        }
    ];

    return (
        <section className="pricing-section-premium" id="pricing">
            <div className="pricing-header">
                <motion.span
                    className="pricing-label"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    FLEXIBLE PLANS
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    Invest in Mastery
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    Choose the path that fits your goals. Transparent pricing, no hidden fees.
                </motion.p>
            </div>

            <div className="pricing-cards-container">
                {plans.map((plan, index) => (
                    <motion.div
                        key={index}
                        className={`pricing-card-glass ${plan.popular ? 'popular' : ''}`}
                        initial={{ opacity: 0, y: 20, x: index % 2 === 0 ? -15 : 15 }}
                        whileInView={{ opacity: 1, y: 0, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{
                            delay: 0.4 + (index * 0.12),
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                    >
                        {plan.popular && <span className="popular-badge">Most Popular</span>}

                        <h3 className="plan-name">{plan.name}</h3>
                        <div className="plan-price">
                            {plan.price}
                            <span className="plan-period">{plan.period}</span>
                        </div>
                        <p className="plan-desc">{plan.desc}</p>

                        <ul className="plan-features">
                            {plan.pricingTiers.map((tier, i) => (
                                <li key={i} className="feature-item">
                                    {tier}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`plan-cta ${plan.popular ? 'plan-cta-primary' : 'plan-cta-secondary'}`}
                            onClick={() => navigate('/select-role')}
                        >
                            {plan.cta}
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default PricingSection;
