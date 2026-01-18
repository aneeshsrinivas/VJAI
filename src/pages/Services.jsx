import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './Services.css';

const Services = () => {
    const services = [
        {
            title: 'Group Classes',
            description: 'Small group sessions with personalized attention. Learn alongside peers while receiving individual coaching.',
            features: ['Max 6 students per class', 'Age-grouped batches', 'Interactive learning', 'Twice weekly sessions']
        },
        {
            title: '1v1 Tutoring',
            description: 'One-on-one coaching tailored to your specific needs and goals. Perfect for rapid improvement.',
            features: ['Personalized curriculum', 'Flexible scheduling', 'Focused attention', 'Custom pace']
        },
        {
            title: 'Tournament Preparation',
            description: 'Specialized training for competitive chess. Develop tournament strategies and mental toughness.',
            features: ['Opening preparation', 'Game analysis', 'Time management', 'Psychological training']
        },
        {
            title: 'Beginner Programs',
            description: 'Start your chess journey with our structured beginner curriculum. Learn fundamentals in a fun environment.',
            features: ['Basic rules & tactics', 'Pattern recognition', 'Simple strategies', 'Confidence building']
        },
        {
            title: 'Advanced Training',
            description: 'Elite coaching for serious players. Master complex strategies and refine your game.',
            features: ['Deep analysis', 'Advanced tactics', 'Endgame mastery', 'Opening repertoire']
        },
        {
            title: 'Parent Support',
            description: 'Regular updates and guidance for parents. Stay involved in your child\'s chess journey.',
            features: ['Progress reports', 'Parent-coach meetings', 'Learning resources', 'Tournament guidance']
        }
    ];

    return (
        <div className="services-page">
            <Navbar />

            <section className="services-hero">
                <div className="services-hero-content">
                    <h1>Our Services</h1>
                    <p>Comprehensive chess education tailored to every skill level</p>
                </div>
            </section>

            <section className="services-grid-section">
                <div className="services-container">
                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="service-card">
                                <h3>{service.title}</h3>
                                <p className="service-description">{service.description}</p>
                                <ul className="service-features">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Services;
