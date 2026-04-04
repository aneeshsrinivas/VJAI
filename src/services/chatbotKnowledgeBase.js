/**
 * Comprehensive Knowledge Base for Indian Chess Academy Chatbot
 * Contains detailed information about all academy aspects
 */

export const knowledgeBase = {
    // Platform Overview
    platform: {
        name: "Indian Chess Academy",
        tagline: "Premier Online Chess Learning Platform",
        description: "Indian Chess Academy is a comprehensive online chess learning platform offering world-class curriculum and expert coaching for students of all levels.",
        mission: "To make chess education accessible to learners worldwide with personalized coaching and structured curriculum",
        yearEstablished: "Established as a leader in online chess education"
    },

    // Detailed Course Information
    courses: {
        beginner: {
            name: "Beginner Course",
            level: "Level 1 - Complete Beginners",
            description: "Perfect for those starting their chess journey. Learn fundamentals including piece movements, basic tactics, opening principles, and develop a strong foundation.",
            duration: "8-12 weeks",
            lessonsPerWeek: 2,
            focus: [
                "Piece movement and chess board basics",
                "Opening principles and strategy",
                "Basic tactical patterns (forks, pins, skewers)",
                "Endgame fundamentals",
                "Chess notation and game analysis"
            ],
            prerequisites: "None",
            targetAudience: "Ages 6+, complete beginners",
            price: "$49/month",
            includes: [
                "2 live classes per week",
                "Access to course materials",
                "Regular assignments and puzzles",
                "1-on-1 coaching sessions (2 per month)",
                "Recorded class access",
                "Chess engine analysis"
            ]
        },
        intermediate: {
            name: "Intermediate Course",
            level: "Level 2 - Developing Players",
            description: "Build on your foundation with advanced strategy, endgame mastery, complex tactical patterns, and mid-game concepts. Develop a personal playing style.",
            duration: "10-14 weeks",
            lessonsPerWeek: 2,
            focus: [
                "Advanced tactical themes and calculations",
                "Positional play and pawn structures",
                "Opening repertoire development",
                "Endgame techniques and principles",
                "Game analysis and preparation",
                "Time management in chess"
            ],
            prerequisites: "Basic chess knowledge or Beginner course completion",
            targetAudience: "Intermediate players (ELO 1200-1800)",
            price: "$69/month",
            includes: [
                "2-3 live classes per week",
                "Advanced course materials",
                "Personalized game analysis",
                "2 one-on-one sessions per month",
                "Opening preparation sessions",
                "Tournament preparation guidance"
            ]
        },
        advanced: {
            name: "Advanced Course",
            level: "Level 3 - Competitive Players",
            description: "Master-level instruction with deep positional understanding, advanced tactical themes, opening theory, and competitive game analysis.",
            duration: "12-16 weeks",
            lessonsPerWeek: 3,
            focus: [
                "Deep positional mastery",
                "Advanced opening theory (main lines)",
                "Complex endgame study",
                "Psychological aspects of chess",
                "Tournament strategies",
                "Chess engines and preparation tools",
                "World champion style analysis"
            ],
            prerequisites: "Intermediate level or equivalent strength",
            targetAudience: "Advanced players (ELO 1800+)",
            price: "$99/month",
            includes: [
                "3 live classes per week",
                "Personalized coaching (4 sessions/month)",
                "Deep opening preparation",
                "Endgame mastery sessions",
                "Tournament preparation",
                "5-minute instant analysis sessions"
            ]
        }
    },

    // Detailed Coaches
    coaches: [
        {
            name: "Grandmaster Vikram",
            title: "Chief Coach & Founder",
            credential: "International Master (2450 ELO)",
            experience: "20+ years of coaching experience",
            specialization: "Opening theory, tournament preparation",
            bio: "Vikram has coached over 500 students to national and international rankings. His approach focuses on developing chess understanding rather than memorization.",
            achievements: ["Trained 5 national chess champions", "Named Coach of the Year 2022", "Published 3 chess books"]
        },
        {
            name: "FM Aisha Khan",
            title: "Lead Coach",
            credential: "FIDE Master (2250 ELO)",
            experience: "15 years of competitive and coaching experience",
            specialization: "Endgames, strategy, youth coaching",
            bio: "Aisha specializes in teaching young players and has a proven track record of improving student ratings by 300-400 points in 6 months.",
            achievements: ["Coached 20+ players to Master title", "Endgame specialist", "Patient and detailed instructor"]
        },
        {
            name: "CM Rajesh Patel",
            title: "Coach",
            credential: "Candidate Master (2100 ELO)",
            experience: "10 years experience",
            specialization: "Tactics, puzzles, beginner coaching",
            bio: "Rajesh's interactive teaching style makes complex concepts easy to understand. Excellent with beginners and intermediate players.",
            achievements: ["Outstanding student satisfaction", "Puzzle specialty", "Regular livestream instructor"]
        }
    ],

    // Detailed Pricing
    pricing: {
        info: "Flexible subscription plans designed for different learning goals and budgets. All plans include live classes, materials, and support.",
        plans: [
            {
                name: "Monthly Plan",
                frequency: "1 Month",
                price: "$49-99",
                description: "Try classes without long commitment. Best for exploring our platform.",
                advantages: ["Most flexible", "No lock-in", "Full access to selected courses"]
            },
            {
                name: "Quarterly Plan",
                frequency: "3 Months",
                price: "$129-249",
                description: "3-month commitment with 10% discount. Ideal for serious learners.",
                advantages: ["10% savings", "Structured learning timeline", "Progress tracking"]
            },
            {
                name: "Annual Plan",
                frequency: "12 Months",
                price: "$449-899",
                description: "Full-year commitment with 25% discount. Best value.",
                advantages: ["25% savings", "Uninterrupted learning", "Exclusive bonuses", "Priority support"]
            }
        ],
        paymentMethods: ["Credit Card", "Debit Card", "UPI", "Net Banking", "PayPal", "Google Pay"],
        refundPolicy: "30-day money-back guarantee if not satisfied",
        guarantee: "Full refund within 30 days if not satisfied with the course experience"
    },

    // Getting Started Steps
    gettingStarted: [
        "Visit our website and create a free account with email or social login",
        "Complete the chess skill assessment quiz (5 minutes) to determine your level",
        "Choose your learning goal: recreational, competitive, or specialized training",
        "Select a subscription plan (monthly, quarterly, or annual)",
        "Complete secure payment via your preferred method",
        "Access your personalized dashboard with course materials",
        "Join your first live class with an expert coach",
        "Get assigned a progress mentor who tracks your improvement"
    ],

    // Class Schedule Details
    classSchedule: {
        info: "Live classes available 7 days a week at multiple time slots to suit different time zones",
        frequency: "Daily classes from 7 AM to 10 PM (IST) and equivalent UTC times",
        daysOfWeek: "Monday through Sunday",
        classFormats: [
            "Beginner Fundamentals - 1 hour, twice daily",
            "Intermediate Strategy - 1.5 hours, daily",
            "Advanced Mastery - 2 hours, 3 times daily",
            "Puzzle Rush Sessions - 30 minutes, multiple slots",
            "Opening Preparation - 1 hour, weekly",
            "Tournament Prep - 1.5 hours, weekend sessions"
        ],
        features: [
            "Live interaction with expert coaches",
            "Real-time Q&A and doubt clearing",
            "AI-powered game analysis during sessions",
            "Recorded sessions available 48 hours after class",
            "Chat with other students",
            "Screen sharing for detailed explanations",
            "Zoom-based classes for global accessibility"
        ],
        access: "Full schedule visible in student dashboard with calendar view and timezone conversion"
    },

    // Platform Features
    features: {
        liveClasses: "2-3 live classes per week with interactive Q&A, real-time feedback, and personalized guidance",
        studyMaterials: "Comprehensive course materials including videos, PDFs, chess databases, and interactive tutorials",
        zoomIntegration: "All classes via Zoom with HD video, screen sharing, and recording functionality",
        dashboard: "Personalized student dashboard tracking progress, attendance, ratings improvement, and recommendations",
        messaging: "Direct messaging system to communicate with coaches for doubt clearing and personalized advice",
        assignments: "Regular assignments including puzzles, games to analyze, and homework for practice",
        ratingTracking: "Monitor ELO rating improvement with detailed progress graphs",
        pgnAnalysis: "Upload your games for coach analysis and feedback",
        chessEngine: "Integrated chess engine for position evaluation and best move suggestions",
        practiceBoard: "Interactive chess board for practicing positions and studying openings",
        puzzleLibrary: "5000+ chess puzzles organized by difficulty and topic",
        tournamentPrep: "Special sessions on tournament strategy, time management, and psychological preparation"
    },

    // Testimonials
    testimonials: [
        {
            name: "Arjun S.",
            rating: 5,
            text: "Improved from 1200 to 1650 in just 4 months! The personalized coaching and daily practice really helped.",
            course: "Intermediate"
        },
        {
            name: "Priya M.",
            rating: 5,
            text: "Best chess coaching I've experienced. The coaches are patient, knowledgeable, and genuinely care about student progress.",
            course: "Beginner"
        },
        {
            name: "Rohan K.",
            rating: 5,
            text: "Finally understand chess strategy at a deeper level. Highly recommend for serious learners.",
            course: "Advanced"
        }
    ],

    // FAQs
    faqs: [
        {
            question: "What if I've never played chess before?",
            answer: "Our Beginner course is specifically designed for complete beginners. We teach everything from basic piece movements to fundamental strategies. No prior experience needed!"
        },
        {
            question: "How do I know which course is right for me?",
            answer: "Take our free chess assessment quiz when you sign up. It evaluates your current level and recommends the appropriate course. You can also chat with our coaches for personalized guidance."
        },
        {
            question: "Can I attend classes if I'm in a different time zone?",
            answer: "Yes! We offer classes 7 AM to 10 PM IST daily. We also record all sessions and make them available within 48 hours, so you can watch at your convenience."
        },
        {
            question: "What happens after I complete a course?",
            answer: "You can advance to the next level course or specialize in areas like openings, endgames, or tactics. Many students continue with advanced courses or personalized coaching."
        },
        {
            question: "Are there live games or tournaments?",
            answer: "Yes! We organize monthly tournaments for students and provide tournament preparation coaching. Students can also play against each other on our platform."
        },
        {
            question: "Can I get a refund if I'm not satisfied?",
            answer: "Absolutely. We offer a 30-day money-back guarantee with no questions asked. Your satisfaction is our priority."
        },
        {
            question: "How often can I interact with coaches?",
            answer: "Included: 2 live classes per week + group sessions. Premium: 1-on-1 sessions 2-4 times per month depending on your plan. Chat anytime for quick questions."
        },
        {
            question: "Will I improve my rating?",
            answer: "Most students improve 200-400 rating points within 3-6 months with consistent practice. Progress depends on your effort and practice frequency."
        }
    ],

    // Support
    support: {
        email: "support@indianchessacademy.com",
        phone: "+91-XXX-XXX-XXXX",
        responseTime: "Within 2 hours during business hours",
        channels: ["Email", "Live Chat", "WhatsApp", "In-app messaging"],
        helpTopics: [
            "Technical issues with Zoom or platform",
            "Course content explanations",
            "Billing and subscription management",
            "Class scheduling and recordings",
            "Personalized learning recommendations"
        ]
    }
};
