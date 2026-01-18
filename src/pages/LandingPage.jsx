import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Trophy, Users, TrendingUp, ShieldCheck, Gamepad2, GraduationCap } from 'lucide-react';
import Button from '../components/ui/Button';
import '../index.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('beginner');
    const [showModal, setShowModal] = React.useState(false);

    return (
        <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'var(--font-primary)' }}>
            {/* Header - Exclusive Logo Usage */}
            <header style={{ backgroundColor: 'var(--color-deep-blue)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* CSS-only representation of the provided logo */}
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid var(--color-warm-orange)',
                        backgroundColor: 'var(--color-olive-green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: '0 0 0 2px var(--color-deep-blue)'
                    }}>
                        <Crown color="white" size={28} style={{ zIndex: 2 }} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#fff', margin: 0, lineHeight: 1, letterSpacing: '0.5px' }}>INDIAN CHESS ACADEMY</h1>
                        <p style={{ margin: '4px 0 0', color: 'var(--color-neutral-brown)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '500' }}>Think • Plan • Triumph</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={() => navigate('/login')} style={{ borderColor: 'var(--color-warm-orange)', color: 'var(--color-warm-orange)' }}>Login</Button>
            </header>

            {/* Hero Section with Pawn Animation */}
            <section className="bg-chess-pattern" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px' }}>

                    {/* Pawn Army Visual - "Gif like thing" */}
                    <div className="pawn-grid" style={{ marginBottom: '48px', height: '100px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        {/* 8 Pawns for the "Pawn Army" effect */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="pawn-item" style={{
                                background: i % 2 === 0 ? 'var(--color-deep-blue)' : 'var(--color-warm-orange)',
                                opacity: 0.9
                            }}></div>
                        ))}
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '72px', color: 'var(--color-deep-blue)', marginBottom: '24px', lineHeight: '1.2' }}>
                        Where Grandmasters Are Made
                    </h1>
                    <p style={{ fontSize: '22px', color: 'var(--color-dark-brown)', maxWidth: '700px', margin: '0 auto 48px', lineHeight: '1.6', fontWeight: '400' }}>
                        Foster chess skills and life values through engaging, high-quality education.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Button onClick={() => navigate('/select-role')} style={{ backgroundColor: 'var(--color-warm-orange)', color: '#fff', padding: '16px 48px', fontSize: '18px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(252, 138, 36, 0.4)' }}>
                            Join the Academy
                        </Button>
                    </div>
                </div>
            </section>

            {/* About Section - Founders Story */}
            <section style={{ padding: '100px 24px', backgroundColor: '#fff', position: 'relative' }}>
                <div className="rangoli-border-top" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px' }}></div>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '48px', color: 'var(--color-deep-blue)', marginBottom: '48px' }}>About Indian Chess Academy</h2>

                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '32px', textAlign: 'left' }}>
                        Indian Chess Academy was founded on a simple idea: chess should be taught in a way that feels engaging, personal, and meaningful. What began as a side project by <strong>Viraj Pandit</strong>, a computer science engineer with a lifelong passion for the game, soon became a response to the overly generic and impersonal nature of most online chess classes.
                    </p>
                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '64px', textAlign: 'left' }}>
                        As the academy grew, Viraj teamed up with <strong>Nachiket Chitre</strong>, whose structured approach and shared love for chess helped shape the academy’s direction. Together, they created an environment where students receive close, thoughtful mentoring. Every session is designed with care, allowing coaches to adapt to each student’s pace and style — building not just skill, but confidence.
                    </p>

                    {/* Features Icons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', border: '2px solid var(--color-warm-orange)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Gamepad2 size={40} color="var(--color-warm-orange)" />
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>Courseware</h3>
                            <p style={{ maxWidth: '250px', margin: '0 auto', color: '#666' }}>Comprehensive design to elevate skills from basics to advanced.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', border: '2px solid var(--color-olive-green)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={40} color="var(--color-olive-green)" />
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>Online Classes</h3>
                            <p style={{ maxWidth: '250px', margin: '0 auto', color: '#666' }}>Learn from anywhere with personalized coaching and flexible schedules.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section - "Unleash Your Chess Potential" */}
            <section style={{ backgroundColor: '#000', padding: '100px 24px', color: '#fff' }}>
                <div className="container" style={{ maxWidth: '1200px', textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--color-warm-orange)', letterSpacing: '1px', marginBottom: '16px' }}>Our Services</h4>
                    <h2 style={{ fontSize: '48px', color: '#fff', marginBottom: '64px' }}>Unleash Your Chess Potential</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {[
                            { title: "Online Training (1-On-1 And Group)", icon: "💻", text: "Whether you prefer personalized one-on-one sessions or the dynamic interaction of group classes, our online training offers flexible learning to suit your pace and style." },
                            { title: "Fun With Math", icon: "➗", text: "Experience hands-on coaching with our offline training, designed to provide direct, in-person guidance for more focused and interactive learning." },
                            { title: "Corporate Events / Corporate Training", icon: "♟️", text: "Boost teamwork and strategic thinking with our corporate events and training, where chess becomes a fun and engaging way to enhance professional skills." },
                            { title: "Social Programs", icon: "🤝", text: "Join our social programs to connect with fellow chess enthusiasts, participate in friendly matches, and engage in community-building activities." },
                            { title: "Merchandise (E.G., T-Shirts, Chess Gear)", icon: "👕", text: "Show your chess passion with our exclusive merchandise, including t-shirts, chess gear, and accessories that keep you motivated and stylish." },
                            { title: "Books & Materials", icon: "📚", text: "Access a curated selection of books and materials that support your chess journey, providing valuable resources for players of all levels." }
                        ].map((service, i) => (
                            <div key={i} className="service-card">
                                <div style={{ fontSize: '40px', marginBottom: '24px' }}>{service.icon}</div>
                                <h3>{service.title}</h3>
                                <p>{service.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Curriculum/Levels Section - REMOVED Adv. Beginner */}
            <section style={{ padding: '100px 24px', backgroundColor: 'var(--color-ivory)' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <h2 style={{ fontSize: '48px', color: 'var(--color-deep-blue)', textAlign: 'center', marginBottom: '64px' }}>Our Curriculum</h2>

                    {/* Tabs */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                            const key = level.toLowerCase();
                            return (
                                <button
                                    key={level}
                                    onClick={() => setActiveTab(key)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '30px',
                                        backgroundColor: activeTab === key ? 'var(--color-deep-blue)' : '#fff',
                                        color: activeTab === key ? '#fff' : 'var(--color-deep-blue)',
                                        border: '1px solid var(--color-deep-blue)',
                                        fontWeight: '600',
                                        fontSize: '16px'
                                    }}
                                >
                                    {level} Level
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Display */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '48px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                        {activeTab === 'beginner' && (
                            <LevelContent
                                title="Beginner Level"
                                subtitle="Build The Base"
                                lessons={[
                                    "Learn board, pieces, and moves", "Understand checkmate and game goals", "Practice basic tactics and defense",
                                    "Follow opening principles", "Play supervised games", "Build focus and patience"
                                ]}
                                outcomes={[
                                    "Strong grasp of rules and gameplay", "Sharper thinking skills", "Tactical awareness", "Positive mindset and discipline"
                                ]}
                            />
                        )}
                        {activeTab === 'intermediate' && (
                            <LevelContent
                                title="Intermediate Level"
                                subtitle="Blend and Elevate"
                                lessons={[
                                    "Master advanced tactics and combos", "Deepen positional planning", "Strengthen endgame skills",
                                    "Expand and personalize openings", "Play and review simulated matches", "Reflect on games in writing"
                                ]}
                                outcomes={[
                                    "Stronger tactical and strategic balance", "Confident endgame execution", "Customized, reliable openings", "Sharper awareness and adaptability"
                                ]}
                            />
                        )}
                        {activeTab === 'advanced' && (
                            <LevelContent
                                title="Advanced Level"
                                subtitle="Refine and Perform"
                                lessons={[
                                    "Master complex positional ideas", "Sharpen advanced endgames", "Build elite opening prep",
                                    "Study grandmaster games", "Practice deep calculation", "Play high-intensity matches"
                                ]}
                                outcomes={[
                                    "Expert-level strategy and precision", "Advanced endgame mastery", "Well-prepared and versatile openings", "Stronger mental resilience"
                                ]}
                            />
                        )}
                    </div>

                </div>
            </section>

            {/* Pricing Section - "Choose Your Class" */}
            <section style={{ padding: '100px 24px', backgroundColor: '#fff' }}>
                <div className="container text-center" style={{ maxWidth: '1000px' }}>
                    <h4 style={{ color: 'var(--color-warm-orange)', textTransform: 'uppercase', letterSpacing: '1px' }}>Group Classes</h4>
                    <h2 style={{ fontSize: '48px', color: 'var(--color-deep-blue)', marginBottom: '64px' }}>Choose Your Class</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Beginner Card */}
                        <div style={{ padding: '48px', border: '1px solid #eee', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Beginner</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>$</span>
                                <span style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: 1 }}>60</span>
                                <span style={{ color: '#666' }}>/ Month</span>
                            </div>
                            <div style={{ marginBottom: '32px', color: '#555', fontSize: '14px', lineHeight: '2' }}>
                                <div>1 Month: $60</div>
                                <div>3 Months: $160</div>
                                <div>4 Months: $200</div>
                            </div>
                            <Button onClick={() => setShowModal(true)} style={{ width: '100%', backgroundColor: 'var(--color-deep-blue)', color: '#fff', padding: '16px' }}>Join This Class</Button>
                        </div>

                        {/* Intermediate Card */}
                        <div style={{ padding: '48px', border: '1px solid #eee', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Intermediate</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>$</span>
                                <span style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: 1 }}>70</span>
                                <span style={{ color: '#666' }}>/ Month</span>
                            </div>
                            <div style={{ marginBottom: '32px', color: '#555', fontSize: '14px', lineHeight: '2' }}>
                                <div>1 Month: $70</div>
                                <div>3 Months: $187</div>
                                <div>4 Months: $233</div>
                            </div>
                            <Button onClick={() => setShowModal(true)} style={{ width: '100%', backgroundColor: 'var(--color-deep-blue)', color: '#fff', padding: '16px' }}>Join This Class</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '100px 24px', backgroundColor: '#FFF8E1' }}>
                <div className="container" style={{ maxWidth: '1200px', textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--color-warm-orange)', marginBottom: '16px' }}>Testimonial</h4>
                    <h2 style={{ fontSize: '36px', color: 'var(--color-deep-blue)', marginBottom: '64px' }}>Discover what our students have to say</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <TestimonialCard
                            name="Priya Menon"
                            relation="mother of Aarav"
                            age="9 years old"
                            text="We honestly just signed Aarav up to get him off screens for a while, nothing serious. But he actually took to it really well. Now he keeps setting up the board at home and asking us to play with him."
                        />
                        <TestimonialCard
                            name="Michael D'Souza"
                            relation="father of Tia"
                            age="11 years old"
                            text="Tia's tried a bunch of classes in the past but got bored after a few weeks. This one's been different. She's actually sticking to it and seems genuinely interested. She even paused her cartoons to finish a puzzle."
                        />
                        <TestimonialCard
                            name="Ayesha Khan"
                            relation="mother of Zayan"
                            age="7 years old"
                            text="Zayan is one of those kids who's always jumping around, so we weren't sure chess would be his thing. But weirdly enough, he's super calm during class. It's the one time in the day he sits still and focuses."
                        />
                    </div>
                </div>
            </section>

            {/* Evaluation Banner */}
            <section style={{ backgroundColor: '#fff', padding: '60px 24px' }}>
                <div className="container" style={{ maxWidth: '1000px', backgroundColor: '#4E342E', borderRadius: '16px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ zIndex: 2 }}>
                        <h2 style={{ color: '#fff', fontSize: '28px', margin: 0 }}>Learn More About Our Program</h2>
                    </div>
                    <div style={{ zIndex: 2 }}>
                        <Button onClick={() => setShowModal(true)} style={{ backgroundColor: 'var(--color-warm-orange)', color: '#fff', padding: '12px 24px' }}>Schedule An Evaluation</Button>
                    </div>
                    {/* Decorative Pieces background - abstract */}
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '150px', opacity: 0.1 }}>♟️</div>
                    <div style={{ position: 'absolute', left: '20px', top: '-40px', fontSize: '100px', opacity: 0.1 }}>♜</div>
                </div>
            </section>

            {/* FAQ Section - Expanded */}
            <section style={{ padding: '100px 24px', backgroundColor: '#000', color: '#fff' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <h2 style={{ fontSize: '48px', color: 'var(--color-warm-orange)', textAlign: 'center', marginBottom: '48px' }}>FAQ's</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FAQItem question="What is Indian Chess Academy?" answer="We are a specialized academy focused on holistic chess education, blending technical skills with life values." isOpen={true} />
                        <FAQItem question="Who are the coaches?" answer="Our coaches are FIDE rated players and experienced mentors like Coach Ramesh and our founders Viraj & Nachiket." />
                        <FAQItem question="What age group do you cater to?" answer="We cater to students from age 5 to 18, with levels ranging from absolute beginner to advanced competitive players." />
                        <FAQItem question="How are classes conducted?" answer="Classes are conducted online via Zoom/Google Meet with interactive board tools and small batch sizes for personal attention." />
                        <FAQItem question="What is the class frequency and duration?" answer="Typically 2 sessions per week, each lasting 60 minutes, plus weekend tournaments." />
                        <FAQItem question="Do you offer a free trial class?" answer="Yes! We offer a free evaluation and intro session to assess the student's level and recommend the right course." />
                        <FAQItem question="Can adults join the academy?" answer="While our primary focus is on young learners (5-18), we do offer specialized 1-on-1 programs for adults interested in improving their game." />
                        <FAQItem question="What language are the classes conducted in?" answer="Our primary instruction language is English, but our coaches are proficient in Hindi, Marathi, and other regional languages to help students feel comfortable." />
                    </div>
                </div>
            </section>

            {/* Contact / How Can We Assist Section */}
            <section style={{ padding: '100px 24px', backgroundColor: '#fff' }}>
                <div className="container" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '64px' }}>
                    {/* Text Side */}
                    <div>
                        <h2 style={{ fontSize: '42px', color: 'var(--color-warm-orange)', marginBottom: '16px', lineHeight: '1.2' }}>How Can<br />We Assist?</h2>
                        <p style={{ color: '#666', marginBottom: '32px' }}>Thank you for your interest in INDIAN CHESS ACADEMY. Please use this form to contact us. We will get back to you as soon as we can.</p>

                    </div>

                    {/* Form Side */}
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>First Name</label>
                                <input type="text" className="contact-input" placeholder="Peter" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Last Name</label>
                                <input type="text" className="contact-input" placeholder="Lambert" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Mobile Number</label>
                            <input type="tel" className="contact-input" placeholder="+91 1234567890" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Your email</label>
                            <input type="email" className="contact-input" placeholder="peter@abc.com" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Where did you here about us?</label>
                            <input type="text" className="contact-input" placeholder="Tell me about us" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Your message (optional)</label>
                            <textarea className="contact-input" rows="4" placeholder="Your message" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}></textarea>
                        </div>

                        <button type="button" onClick={() => alert('Message Sent!')} style={{ backgroundColor: '#000', color: '#fff', padding: '16px 32px', borderRadius: '8px', fontWeight: 'bold', width: 'fit-content', border: 'none', cursor: 'pointer' }}>
                            Submit
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ backgroundColor: '#000', padding: '80px 24px', color: '#fff', borderTop: '1px solid #111' }}>
                <div className="container" style={{ maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '40px' }}>
                    {/* Brand & Logo */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            {/* Logo - Green Circle Crown */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '2px solid var(--color-warm-orange)',
                                backgroundColor: 'var(--color-olive-green)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                boxShadow: '0 0 0 2px var(--color-deep-blue)'
                            }}>
                                <Crown color="white" size={32} />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0, lineHeight: '1.2' }}>INDIAN CHESS<br />ACADEMY</h3>
                        </div>
                    </div>
                    {/* Courses */}
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '16px' }}>Our Courses</h4>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#ccc', lineHeight: '2.5', fontSize: '14px' }}>
                            <li>All Courses</li>
                            <li>Beginner</li>
                            <li>Intermediate</li>
                            <li>Advanced</li>
                            <li>1v1 Tutoring</li>
                            <li>Certification Programs</li>
                        </ul>
                    </div>
                    {/* Academy */}
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '16px' }}>Academy</h4>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#ccc', lineHeight: '2.5', fontSize: '14px' }}>
                            <li>Home</li>
                            <li>About Us</li>
                            <li>Services</li>
                            <li>Contact Us</li>
                            <li>Terms & Conditions</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                    {/* Connect */}
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '16px' }}>Connect With Us</h4>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#ccc', lineHeight: '2.5' }}>
                            <li><a href="https://www.linkedin.com/company/indian-chess-academy/" target="_blank" style={{ color: '#ccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <LinkedinIcon /> LinkedIn
                            </a></li>
                            <li><a href="https://www.instagram.com/indianchessacademy/" target="_blank" style={{ color: '#ccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <InstagramIcon /> Instagram
                            </a></li>
                            <li><a href="https://www.facebook.com/people/Indian-Chess-Academy/61555847004612/" target="_blank" style={{ color: '#ccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FacebookIcon /> Facebook
                            </a></li>
                            <li><a href="https://api.whatsapp.com/send/?phone=917738173864" target="_blank" style={{ color: '#ccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <WhatsappIcon /> Whatsapp
                            </a></li>
                        </ul>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #222', marginTop: '60px', paddingTop: '24px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                    Copyright 2026 © Indian Chess Academy | Powered By Vjai
                </div>
            </footer>


            {/* Registration Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                    <div className="animate-fade-in" style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '100%', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', fontSize: '24px', color: '#999', border: 'none', cursor: 'pointer' }}>×</button>
                        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Start Your Journey</h2>
                        <p style={{ color: '#666', marginBottom: '24px' }}>Fill out this form and our admin team will contact you shortly.</p>

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input type="text" placeholder="Parent Name" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            <input type="email" placeholder="Email Address" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            <input type="tel" placeholder="Phone Number" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}>
                                <option>Select Level</option>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                            <Button onClick={(e) => { e.preventDefault(); alert('Request Sent! Admin will contact you.'); setShowModal(false); }} style={{ backgroundColor: 'var(--color-warm-orange)', color: '#fff', marginTop: '8px' }}>Submit Request</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const LevelContent = ({ title, subtitle, lessons, outcomes }) => (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        <div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--color-deep-blue)' }}>{title}</h2>
            <p style={{ fontSize: '18px', color: '#666', fontStyle: 'italic', marginBottom: '32px' }}>{subtitle}</p>

            <h4 style={{ fontSize: '18px', color: 'var(--color-olive-green)', marginBottom: '16px' }}>Key Lessons</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {lessons.map((lesson, i) => (
                    <li key={i} style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '16px', color: '#444' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-warm-orange)', borderRadius: '50%' }}></div>
                        {lesson}
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <h4 style={{ fontSize: '18px', color: 'var(--color-deep-blue)', marginBottom: '16px', marginTop: '64px' }}>Outcome</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {outcomes.map((outcome, i) => (
                    <li key={i} style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '16px', color: '#444' }}>
                        <ShieldCheck size={18} color="var(--color-success)" />
                        {outcome}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const FAQItem = ({ question, answer, isOpen = false }) => (
    <details open={isOpen} style={{ borderBottom: '1px solid #333' }}>
        <summary style={{ color: 'var(--color-deep-blue)', fontWeight: 'bold' }}>{question}</summary>
        <div style={{ color: '#333', lineHeight: '1.6' }}>{answer}</div>
    </details>
);

const TestimonialCard = ({ name, relation, age, text }) => (
    <div className="testimonial-card">
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eee', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Placeholder avatar */}
            <span style={{ fontSize: '24px', color: '#999' }}>👤</span>
        </div>
        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{name} | <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>{relation}</span></h3>
        <div style={{ color: '#FFD700', marginBottom: '8px' }}>★★★★★</div>
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>{age}</div>
        <p style={{ fontStyle: 'italic', color: '#555', fontSize: '14px', lineHeight: '1.6' }}>"{text}"</p>
    </div>
);

const LinkedinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 7.5H7.5V22.5H2.5V7.5ZM5 2C6.38 2 7.5 3.12 7.5 4.5C7.5 5.88 6.38 7 5 7C3.62 7 2.5 5.88 2.5 4.5C2.5 3.12 3.62 2 5 2ZM10 7.5H15V9.74C15.7 8.53 17.31 7.23 19.66 7.23C24.49 7.23 25.5 10.42 25.5 14.56V22.5H20.5V15.17C20.5 13.23 20.46 10.74 17.78 10.74C15.06 10.74 14.64 12.87 14.64 15.06V22.5H9.64V7.5H10Z" fill="#0A66C2" />
        <rect width="24" height="24" fill="white" fillOpacity="0.01" />
    </svg>
);

const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 2C4.24 2 2 4.24 2 7V17C2 19.76 4.24 22 7 22H17C19.76 22 22 19.76 22 17V7C22 4.24 19.76 2 17 2H7ZM12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9ZM17.5 5C18.33 5 19 5.67 19 6.5C19 7.33 18.33 8 17.5 8C16.67 8 16 7.33 16 6.5C16 5.67 16.67 5 17.5 5Z" fill="#E4405F" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H13.5C13.06 9 12.72 9.4 12.72 9.88V12H16L15.2 15H12.72V21.97C17.96 21.49 22 17.18 22 12Z" fill="#1877F2" />
    </svg>
);

const WhatsappIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382C17.158 14.225 15.613 13.465 15.326 13.364C15.038 13.262 14.829 13.212 14.619 13.516C14.41 13.82 13.813 14.516 13.633 14.717C13.453 14.921 13.272 14.946 12.959 14.789C12.645 14.632 11.636 14.3 10.439 13.235C9.497 12.395 8.86 11.358 8.678 11.042C8.497 10.725 8.658 10.556 8.816 10.4C8.958 10.259 9.13 10.035 9.294 9.842C9.467 9.636 9.522 9.5 9.633 9.278C9.743 9.055 9.689 8.863 9.605 8.696C9.521 8.529 8.924 7.062 8.675 6.471C8.432 5.894 8.188 5.972 8.01 5.972H7.474C7.265 5.972 6.925 6.05 6.638 6.365C6.351 6.681 5.541 7.441 5.541 8.987C5.541 10.533 6.666 12.028 6.823 12.239C6.98 12.449 9.054 15.65 12.32 17.06C15.586 18.47 15.586 17.886 16.162 17.835C16.738 17.784 18.02 17.1 18.286 16.34C18.552 15.58 18.552 14.946 18.473 14.814C18.395 14.682 18.185 14.611 17.872 14.434H17.472V14.382ZM11.996 21.848C10.213 21.848 8.544 21.371 7.094 20.511L6.786 20.327L3 21.321L4.015 17.618L3.814 17.299C2.868 15.797 2.37 14.053 2.37 12.26C2.37 6.958 6.685 2.643 11.999 2.643C14.57 2.643 16.985 3.645 18.804 5.463C20.622 7.281 21.625 9.699 21.625 12.263C21.625 17.568 17.307 21.848 11.996 21.848Z" fill="#25D366" />
        <path d="M19.765 4.542C17.696 2.473 14.946 1.332 12.005 1.332C5.962 1.332 1.049 6.248 1.049 12.29C1.049 14.221 1.551 16.108 2.503 17.759L1 23.25L6.619 21.777C8.197 22.637 9.975 23.09 12.002 23.09H12.006C18.046 23.09 22.959 18.177 22.959 12.131C22.956 9.248 21.834 6.611 19.765 4.542Z" stroke="white" strokeWidth="0.5" />
    </svg>
);

const TrophiesIcon = () => (
    <div style={{ display: 'flex', gap: '-8px' }}>
        <Trophy size={48} />
    </div>
);

export default LandingPage;
