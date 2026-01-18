import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import './CTASection.css';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="cta-section-shared">
            <div className="cta-container-shared">
                <div className="cta-card-shared">
                    <div className="cta-content-wrapper">
                        <h2>Ready to Start Your Chess Journey?</h2>
                        <p>Join 117+ students learning from FIDE Masters in our premium online chess academy</p>
                        <Button onClick={() => navigate('/demo-booking')} className="cta-button-shared">
                            Book a Free Demo Class
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
