import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CTASection from '../components/shared/CTASection';
import './FAQ.css';

const FAQ = () => {
    const [activeFAQ, setActiveFAQ] = useState(null);

    const faqs = [
        {
            category: 'General Information',
            questions: [
                {
                    question: 'What is Indian Chess Academy?',
                    answer: 'Indian Chess Academy is a premier platform offering live online chess coaching for children. Our structured programs are designed to build skills from the beginner to tournament level.'
                },
                {
                    question: 'Who are the coaches?',
                    answer: 'Our coaches are experienced players and educators who are passionate about teaching and have a proven track record of mentoring young chess talents.'
                },
                {
                    question: 'What age groups do you teach?',
                    answer: 'We offer classes for children aged 5 and above, grouped by age and skill level.'
                }
            ]
        },
        {
            category: 'Classes & Curriculum',
            questions: [
                {
                    question: 'How are classes conducted?',
                    answer: 'All classes are conducted live on Zoom in small groups to ensure individual attention.'
                },
                {
                    question: 'What is the class schedule?',
                    answer: 'Classes are held twice a week, each session lasting 60 minutes.'
                },
                {
                    question: 'What is the student-teacher ratio?',
                    answer: 'We maintain a maximum of 6 students per class to ensure personalized attention for each student.'
                },
                {
                    question: 'Do you offer 1v1 tutoring?',
                    answer: 'Yes, we offer personalized 1v1 tutoring sessions for students who prefer individual coaching or need focused attention on specific areas.'
                }
            ]
        },
        {
            category: 'Enrollment & Payments',
            questions: [
                {
                    question: 'How do I enroll my child?',
                    answer: 'You can enroll by booking a free demo class through our website. After the demo, our team will guide you through the enrollment process.'
                },
                {
                    question: 'What are the payment options?',
                    answer: 'We accept online payments through UPI, credit/debit cards, and net banking. Monthly and quarterly payment plans are available.'
                },
                {
                    question: 'Is there a free trial?',
                    answer: 'Yes! We offer a free demo class so your child can experience our teaching methodology before enrolling.'
                },
                {
                    question: 'What is your refund policy?',
                    answer: 'We offer a 7-day money-back guarantee if you\'re not satisfied with our classes after enrollment.'
                }
            ]
        },
        {
            category: 'Technical Support',
            questions: [
                {
                    question: 'What equipment do I need?',
                    answer: 'You need a computer or tablet with a stable internet connection, a webcam, and a microphone. We recommend using Zoom for the best experience.'
                },
                {
                    question: 'What if I face technical issues during class?',
                    answer: 'Our support team is available during class hours to help resolve any technical issues. You can also contact us via WhatsApp for immediate assistance.'
                },
                {
                    question: 'Are classes recorded?',
                    answer: 'Yes, all classes are recorded and made available to students for review within 24 hours.'
                }
            ]
        }
    ];

    return (
        <div className="faq-page">
            <Navbar />

            <section className="faq-hero">
                <div className="faq-hero-content">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about our chess academy</p>
                </div>
            </section>

            <section className="faq-content">
                <div className="faq-container">
                    {faqs.map((category, catIndex) => (
                        <div key={catIndex} className="faq-category">
                            <h2 className="faq-category-title">{category.category}</h2>
                            <div className="faq-list">
                                {category.questions.map((faq, qIndex) => {
                                    const faqId = `${catIndex}-${qIndex}`;
                                    return (
                                        <div key={qIndex} className={`faq-item ${activeFAQ === faqId ? 'active' : ''}`}>
                                            <button
                                                className="faq-question"
                                                onClick={() => setActiveFAQ(activeFAQ === faqId ? null : faqId)}
                                            >
                                                <span>{faq.question}</span>
                                                <span className="faq-icon">{activeFAQ === faqId ? '−' : '+'}</span>
                                            </button>
                                            <div className="faq-answer">
                                                <p>{faq.answer}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
};

export default FAQ;
