// COLLECTION NAMES AND CONSTANTS FOR FIRESTORE

export const COLLECTIONS = {
    DEMOS: 'demos',
    ACCOUNTS: 'accounts',
    STUDENTS: 'students',
    COACHES: 'coaches',
    BATCHES: 'batches',
    CHATS: 'chats',
    MESSAGES: 'messages',
    SUBSCRIPTIONS: 'subscriptions'
};

export const DEMO_STATUS = {
    PENDING: 'PENDING',
    SCHEDULED: 'SCHEDULED',
    ATTENDED: 'ATTENDED',
    NO_SHOW: 'NO_SHOW',
    INTERESTED: 'INTERESTED',
    CONVERTED: 'CONVERTED',
    REJECTED: 'REJECTED'
};

export const CHAT_TYPE = {
    ADMIN_PARENT: 'ADMIN_PARENT',
    ADMIN_COACH: 'ADMIN_COACH',
    BATCH_GROUP: 'BATCH_GROUP'
};

export const USER_ROLE = {
    ADMIN: 'ADMIN',
    COACH: 'COACH',
    CUSTOMER: 'CUSTOMER'
};

export const STUDENT_TYPE = {
    ONE_ON_ONE: '1-1',
    GROUP: 'group'
};

export const LEVEL = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
};

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'ACTIVE',
    PAST_DUE: 'PAST_DUE',
    SUSPENDED: 'SUSPENDED',
    CANCELLED: 'CANCELLED'
};
