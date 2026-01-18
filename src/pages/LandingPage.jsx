import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CoursewareIcon from '../components/icons/CoursewareIcon';
import OnlineClassesIcon from '../components/icons/OnlineClassesIcon';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeFAQ, setActiveFAQ] = React.useState(null);
    const [activeModal, setActiveModal] = React.useState(null);

    // Mock testimonials data
    const testimonials = [
        {
            name: 'Priya Menon',
            role: 'Parent of 8-year-old student',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
            text: 'We honestly can\'t say enough good things about this academy. My son has been taking classes for a while, and his progress has been remarkable. The coaches are patient, knowledgeable, and truly care about each student\'s growth.'
        },
        {
            name: 'Michael D\'Souza',
            role: 'Parent of 10-year-old student',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
            text: 'They took a bunch of classes in the past and got bored after a few weeks. This was been different. She\'s actually excited for every session, and I can see her confidence growing. The personalized attention makes all the difference.'
        },
        {
            name: 'Ayesha Khan',
            role: 'Parent of 12-year-old student',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
            text: 'Zayn is one of those kids who needs a lot of stimulation to stay engaged. The coaches here have been amazing. They make every lesson fun and challenging, and he looks forward to class every week. We couldn\'t be happier!'
        }
    ];

    // FAQs data
    const faqs = [
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
        },
        {
            question: 'How are classes conducted?',
            answer: 'All classes are conducted live on Zoom in small groups to ensure individual attention.'
        },
        {
            question: 'What is the class schedule?',
            answer: 'Classes are held twice a week, each session lasting 60 minutes.'
        }
    ];

    return (
        <div className="landing-page-home">
            {/* Navigation Header */}
            <Navbar />

            {/* Hero Section */}
            <section className="hero-home">
                <div className="hero-background-home">
                    <img
                        src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1920&h=1080&fit=crop"
                        alt="Chess"
                        className="hero-bg-image"
                    />
                    <div className="hero-overlay-home"></div>
                </div>
                <div className="hero-content-home">
                    <h1 className="hero-title-home">
                        Unlock Your Potential<br />
                        With Expert Chess Coaching
                    </h1>
                    <div className="hero-buttons-home">
                        <Button onClick={() => navigate('/select-role')} className="btn-hero-primary">
                            Get Started
                        </Button>
                        <Button onClick={() => navigate('/pricing')} className="btn-hero-secondary">
                            View Pricing
                        </Button>
                    </div>
                </div>
            </section>

            {/* Who We Are Section */}
            <section className="who-we-are-home">
                <div className="section-container-home">
                    <div className="section-header-home">
                        <span className="section-tag-home">Who Are We</span>
                        <h2 className="section-title-home">About Indian Chess Academy</h2>
                    </div>
                    <div className="about-content-home">
                        <p>
                            Indian Chess Academy was founded on a simple idea: chess should be taught in a way that feels engaging, personal, and meaningful.
                            What began as a side project by Viraj Pandit, a computer science engineer with a lifelong passion for the game, soon became a response
                            to the overly generic and impersonal nature of most online chess classes.
                        </p>
                        <p>
                            As the academy grew, Viraj teamed up with Nachiket Chitre, whose structured approach and shared love for chess helped shape the academy's direction.
                            Together, they created an environment where students receive close, thoughtful mentoring. Every session is designed with care, allowing coaches to
                            adapt to each student's pace and style — building not just skill, but confidence.
                        </p>
                    </div>
                    <div className="features-grid-home">
                        <div className="feature-card-home clickable" onClick={() => setActiveModal('courseware')}>
                            <CoursewareIcon size={80} color="#D4AF37" />
                            <h3>Courseware</h3>
                            <p>Explore our comprehensive courseware designed to elevate your chess skills, from basics to advanced strategies.</p>
                        </div>
                        <div className="feature-card-home clickable" onClick={() => setActiveModal('online-classes')}>
                            <OnlineClassesIcon size={80} color="#D4AF37" />
                            <h3>Online Classes</h3>
                            <p>Join our online classes and learn chess from anywhere, with personalized coaching and flexible schedules.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-home">
                <div className="section-container-home">
                    <div className="section-header-home">
                        <span className="section-tag-home">Testimonial</span>
                        <h2 className="section-title-home">What Parents Say About Us</h2>
                        <p className="section-subtitle-home">
                            Discover what our students have to say about their transformative journey and growth at Indian Chess Academy.
                        </p>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-header">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="testimonial-image"
                                    />
                                    <div className="testimonial-info">
                                        <h4>{testimonial.name}</h4>
                                        <p className="testimonial-role">{testimonial.role}</p>
                                        <div className="testimonial-rating">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <span key={i} className="star">⭐</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="testimonial-text">{testimonial.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-home">
                <div className="section-container-home">
                    <div className="section-header-home">
                        <span className="section-tag-home">FAQ's</span>
                        <h2 className="section-title-home">Frequently Asked Questions</h2>
                    </div>
                    <div className="faq-list-home">
                        {faqs.map((faq, index) => (
                            <div key={index} className={`faq-item-home ${activeFAQ === index ? 'active' : ''}`}>
                                <button
                                    className="faq-question-home"
                                    onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                                >
                                    <span>{faq.question}</span>
                                    <span className="faq-icon-home">{activeFAQ === index ? '−' : '+'}</span>
                                </button>
                                <div className="faq-answer-home">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-home">
                <div className="cta-content-home">
                    <h2>Ready to Start Your Chess Journey?</h2>
                    <p>Join 117+ students learning from FIDE Masters in our premium online chess academy</p>
                    <Button onClick={() => navigate('/demo-booking')} className="cta-btn-home">
                        Book a Free Demo Class
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* Courseware Modal */}
            {activeModal === 'courseware' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
                        <h2 className="modal-title">Courseware Details</h2>
                        <div className="modal-body">
                            <div className="course-level">
                                <h3>Intermediate Level</h3>
                                <p className="level-subtitle">Board and Beyond</p>
                                <div className="course-section">
                                    <h4>Key Lessons</h4>
                                    <ul>
                                        <li>Master advanced tactics and combos</li>
                                        <li>Stronger positional planning</li>
                                        <li>Endgame techniques</li>
                                        <li>Exploit and premeditate openings</li>
                                        <li>Analyze and build tournament skills</li>
                                    </ul>
                                </div>
                                <div className="course-section">
                                    <h4>Outcome</h4>
                                    <ul>
                                        <li>Stronger tactical and strategic balance</li>
                                        <li>Improved positional accuracy</li>
                                        <li>Confident in games vs. setting</li>
                                        <li>Calculated, intuitive openings</li>
                                        <li>Stronger awareness and adaptability</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="course-level">
                                <h3>Advanced Level</h3>
                                <p className="level-subtitle">Refine and Perform</p>
                                <div className="course-section">
                                    <h4>Key Lessons</h4>
                                    <ul>
                                        <li>Sharpen advanced strategies</li>
                                        <li>Build elite opening prep</li>
                                        <li>Precision deep calculation/visualization</li>
                                        <li>Play high-intensity matches</li>
                                        <li>Keep a personal chess journal</li>
                                    </ul>
                                </div>
                                <div className="course-section">
                                    <h4>Outcome</h4>
                                    <ul>
                                        <li>Excellent strategy and precision</li>
                                        <li>Refined opening mastery</li>
                                        <li>Well-prepared and versatile openings</li>
                                        <li>Stronger mental toughness</li>
                                        <li>Create improvement plans with coach</li>
                                        <li>Tournament success and achievements</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Online Classes Modal */}
            {activeModal === 'online-classes' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
                        <h2 className="modal-title">Schedule an Evaluation</h2>
                        <form className="evaluation-form" onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); setActiveModal(null); }}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Child's First Name</label>
                                    <input type="text" required placeholder="First Name" />
                                </div>
                                <div className="form-group">
                                    <label>Child's Last Name</label>
                                    <input type="text" required placeholder="Last Name" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" required placeholder="Email" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" required placeholder="Phone" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Zip Code</label>
                                    <input type="text" required placeholder="Zip Code" />
                                </div>
                                <div className="form-group">
                                    <label>Child's Grade</label>
                                    <select required>
                                        <option value="">Please choose an option</option>
                                        <option value="k">Kindergarten</option>
                                        <option value="1">Grade 1</option>
                                        <option value="2">Grade 2</option>
                                        <option value="3">Grade 3</option>
                                        <option value="4">Grade 4</option>
                                        <option value="5">Grade 5</option>
                                        <option value="6">Grade 6</option>
                                        <option value="7">Grade 7</option>
                                        <option value="8">Grade 8</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <select required>
                                    <option value="">Please choose an option</option>
                                    <option value="online">Online</option>
                                    <option value="in-person">In Person</option>
                                </select>
                            </div>
                            <Button type="submit" className="submit-evaluation-btn">
                                SCHEDULE Evaluation
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
