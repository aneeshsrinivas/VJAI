// Mock data for the chess academy platform
// This will be replaced with actual API calls

export const mockPlans = [
  {
    id: 'one-on-one-beginner',
    type: '1-on-1',
    level: 'Beginner',
    name: 'Personal Beginner Training',
    price: 60,
    billingCycle: 'month',
    features: [
      'Dedicated coach assignment',
      'Personalized lesson plans',
      'Flexible scheduling',
      '4 sessions per month',
      'Progress tracking dashboard',
      'Direct coach messaging'
    ],
    recommended: false,
    color: 'var(--color-olive-green)'
  },
  {
    id: 'one-on-one-intermediate',
    type: '1-on-1',
    level: 'Intermediate',
    name: 'Personal Intermediate Training',
    price: 70,
    billingCycle: 'month',
    features: [
      'Expert FIDE Master coach',
      'Advanced tactics training',
      'Tournament preparation',
      '4 sessions per month',
      'Game analysis included',
      'Opening repertoire building'
    ],
    recommended: true,
    color: 'var(--color-warm-orange)'
  },
  {
    id: 'group-beginner',
    type: 'Group',
    level: 'Beginner',
    name: 'Group Beginner Class',
    price: 40,
    billingCycle: 'month',
    features: [
      'Small batch (max 8 students)',
      'Peer learning environment',
      'Fixed schedule (3x/week)',
      '12 sessions per month',
      'Batch group chat access',
      'Shared learning materials'
    ],
    recommended: false,
    color: 'var(--color-deep-blue)'
  },
  {
    id: 'group-intermediate',
    type: 'Group',
    level: 'Intermediate',
    name: 'Group Intermediate Class',
    price: 50,
    billingCycle: 'month',
    features: [
      'Skill-matched batches',
      'Competitive practice games',
      'Fixed schedule (3x/week)',
      '12 sessions per month',
      'Tournament opportunities',
      'Rating improvement focus'
    ],
    recommended: false,
    color: 'var(--color-deep-blue)'
  }
];

export const mockStudents = [
  {
    id: 'student-1',
    name: 'Arjun Sharma',
    age: 12,
    level: 'Intermediate',
    rating: 1450,
    parentName: 'Rajesh Sharma',
    parentEmail: 'rajesh@example.com',
    timezone: 'IST',
    country: 'India',
    studentType: 'Group',
    assignedCoach: 'coach-1',
    assignedBatch: 'batch-intermediate-b2',
    status: 'ACTIVE'
  },
  {
    id: 'student-2',
    name: 'Priya Patel',
    age: 10,
    level: 'Beginner',
    rating: 800,
    parentName: 'Amit Patel',
    parentEmail: 'amit@example.com',
    timezone: 'IST',
    country: 'India',
    studentType: '1-1',
    assignedCoach: 'coach-2',
    assignedBatch: null,
    status: 'ACTIVE'
  }
];

export const mockCoaches = [
  {
    id: 'coach-1',
    name: 'Coach Ramesh Kumar',
    title: 'FIDE Master',
    rating: 2350,
    experience: 8,
    specialties: ['Intermediate', 'Advanced'],
    email: 'ramesh@vjai.com',
    assignedBatches: ['batch-intermediate-b2', 'batch-advanced-a1']
  },
  {
    id: 'coach-2',
    name: 'Coach Suhani Verma',
    title: 'International Master',
    rating: 2450,
    experience: 12,
    specialties: ['Beginner', 'Intermediate'],
    email: 'suhani@vjai.com',
    assignedBatches: ['batch-beginner-b1']
  }
];

export const mockDemos = [
  {
    id: 'demo-1',
    studentName: 'Ananya Singh',
    parentName: 'Vikram Singh',
    parentEmail: 'vikram@example.com',
    timezone: 'IST',
    scheduledStart: '2026-01-20T17:00:00',
    scheduledEnd: '2026-01-20T17:45:00',
    coachId: 'coach-1',
    adminId: 'admin-1',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'BOOKED',
    recommendedStudentType: null,
    recommendedLevel: null,
    adminNotes: ''
  },
  {
    id: 'demo-2',
    studentName: 'Rohan Gupta',
    parentName: 'Neha Gupta',
    parentEmail: 'neha@example.com',
    timezone: 'EST',
    scheduledStart: '2026-01-18T10:00:00',
    scheduledEnd: '2026-01-18T10:45:00',
    coachId: 'coach-2',
    adminId: 'admin-1',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    status: 'ATTENDED',
    recommendedStudentType: '1-1',
    recommendedLevel: 'Beginner',
    adminNotes: 'Very engaged student, parent interested in 1-on-1'
  }
];

export const mockPayments = [
  {
    id: 'payment-1',
    accountId: 'account-1',
    planId: 'group-intermediate',
    amount: 50,
    billingCycle: 'month',
    status: 'ACTIVE',
    startedAt: '2025-12-01',
    nextDueAt: '2026-02-01',
    paymentMethod: 'card',
    invoices: [
      {
        id: 'inv-1',
        date: '2025-12-01',
        amount: 50,
        status: 'paid'
      },
      {
        id: 'inv-2',
        date: '2026-01-01',
        amount: 50,
        status: 'paid'
      }
    ]
  }
];

// API endpoint placeholders for backend integration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Students
  GET_STUDENTS: '/api/students',
  GET_STUDENT: '/api/students/:id',
  CREATE_STUDENT: '/api/students',
  UPDATE_STUDENT: '/api/students/:id',
  
  // Coaches
  GET_COACHES: '/api/coaches',
  GET_COACH: '/api/coaches/:id',
  
  // Demos
  GET_DEMOS: '/api/demos',
  CREATE_DEMO: '/api/demos',
  UPDATE_DEMO: '/api/demos/:id',
  SUBMIT_DEMO_OUTCOME: '/api/demos/:id/outcome',
  
  // Subscriptions & Payments
  GET_PLANS: '/api/plans',
  GET_PLAN_RECOMMENDATIONS: '/api/plans/recommendations',
  CREATE_SUBSCRIPTION: '/api/subscriptions/create',
  PROCESS_PAYMENT: '/api/payments/process',
  GET_PAYMENT_HISTORY: '/api/payments/history',
  CANCEL_SUBSCRIPTION: '/api/subscriptions/:id/cancel',
  
  // Communication
  GET_BATCH_MESSAGES: '/api/batches/:id/messages',
  SEND_MESSAGE: '/api/messages/send',
  UPLOAD_DOCUMENT: '/api/documents/upload'
};
