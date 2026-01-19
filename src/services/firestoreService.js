import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, DEMO_STATUS, CHAT_TYPE } from '../config/firestoreCollections';

// ==========================================
// DEMO OPERATIONS (No Auth Required)
// ==========================================

/**
 * Create Demo Request from Landing Page
 * PUBLIC ENDPOINT - No authentication required
 */
export const createDemoRequest = async (demoData) => {
    try {
        const demoRef = await addDoc(collection(db, COLLECTIONS.DEMOS), {
            studentName: demoData.studentName,
            studentAge: demoData.studentAge, // Added
            parentName: demoData.parentName,
            parentEmail: demoData.parentEmail,
            parentPhone: demoData.parentPhone || '',
            timezone: demoData.timezone || 'IST',
            preferredDate: demoData.preferredDate,
            preferredTime: demoData.preferredTime,
            preferredDateTime: `${demoData.preferredDate} ${demoData.preferredTime}`,
            chessExperience: demoData.chessExperience || 'beginner',
            message: demoData.message || '', // Added
            status: DEMO_STATUS.PENDING,
            assignedCoachId: null,
            assignedAdminId: null,
            meetingLink: null,
            scheduledStart: null,
            scheduledEnd: null,
            recommendedLevel: null,
            recommendedStudentType: null,
            adminNotes: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true, demoId: demoRef.id };
    } catch (error) {
        console.error('Error creating demo request:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get All Demos (Admin Only)
 */
export const getAllDemos = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.DEMOS), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const demos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, demos };
    } catch (error) {
        console.error('Error fetching demos:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get Demos by Status (Admin Dashboard Filtering)
 */
export const getDemosByStatus = async (status) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.DEMOS),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const demos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, demos };
    } catch (error) {
        console.error('Error fetching demos by status:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Assign Coach to Demo (Admin Action)
 */
export const assignCoachToDemo = async (demoId, coachId, adminId, meetingLink, scheduledStart) => {
    try {
        const demoRef = doc(db, COLLECTIONS.DEMOS, demoId);
        await updateDoc(demoRef, {
            assignedCoachId: coachId,
            assignedAdminId: adminId,
            meetingLink: meetingLink,
            scheduledStart: scheduledStart,
            status: DEMO_STATUS.SCHEDULED,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error assigning coach to demo:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Submit Demo Outcome (Admin - MANDATORY after demo)
 */
export const submitDemoOutcome = async (demoId, outcomeData) => {
    try {
        const demoRef = doc(db, COLLECTIONS.DEMOS, demoId);
        await updateDoc(demoRef, {
            status: outcomeData.demoOutcome,
            recommendedLevel: outcomeData.recommendedLevel || null,
            recommendedStudentType: outcomeData.recommendedStudentType || null,
            adminNotes: outcomeData.adminNotes || '',
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error submitting demo outcome:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Convert Demo to Student (After Payment Success)
 */
export const convertDemoToStudent = async (demoId, accountId, paymentData) => {
    try {
        const demoDoc = await getDoc(doc(db, COLLECTIONS.DEMOS, demoId));
        if (!demoDoc.exists()) {
            return { success: false, error: 'Demo not found' };
        }
        const demoData = demoDoc.data();

        const studentRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
            accountId: accountId,
            studentName: demoData.studentName,
            studentAge: paymentData.studentAge || null,
            parentName: demoData.parentName,
            parentEmail: demoData.parentEmail,
            parentPhone: demoData.parentPhone || '',
            timezone: demoData.timezone,
            country: paymentData.country || '',
            studentType: demoData.recommendedStudentType || 'group',
            level: demoData.recommendedLevel || 'beginner',
            rating: null,
            assignedCoachId: demoData.assignedCoachId,
            assignedBatchId: paymentData.batchId || null,
            status: 'ACTIVE',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, COLLECTIONS.SUBSCRIPTIONS), {
            accountId: accountId,
            studentId: studentRef.id,
            planId: paymentData.planId,
            amount: paymentData.amount,
            billingCycle: paymentData.billingCycle,
            status: 'ACTIVE',
            startedAt: serverTimestamp(),
            nextDueAt: paymentData.nextDueAt,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const demoRef = doc(db, COLLECTIONS.DEMOS, demoId);
        await updateDoc(demoRef, {
            status: DEMO_STATUS.CONVERTED,
            updatedAt: serverTimestamp()
        });

        await createChat({
            chatType: CHAT_TYPE.ADMIN_PARENT,
            participants: [accountId, paymentData.adminId],
            batchId: null
        });

        return { success: true, studentId: studentRef.id };
    } catch (error) {
        console.error('Error converting demo to student:', error);
        return { success: false, error: error.message };
    }
};

// ==========================================
// ACCOUNT OPERATIONS
// ==========================================

export const createParentAccount = async (uid, email, adminId) => {
    try {
        await setDoc(doc(db, COLLECTIONS.ACCOUNTS, uid), {
            email: email,
            role: 'CUSTOMER',
            createdByAdminId: adminId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true, accountId: uid };
    } catch (error) {
        console.error('Error creating parent account:', error);
        return { success: false, error: error.message };
    }
};

// ==========================================
// STUDENT OPERATIONS
// ==========================================

export const getAllStudents = async (userRole, userId) => {
    try {
        let q;

        if (userRole === 'COACH') {
            q = query(
                collection(db, COLLECTIONS.STUDENTS),
                where('assignedCoachId', '==', userId)
            );
        } else {
            q = query(collection(db, COLLECTIONS.STUDENTS));
        }

        const snapshot = await getDocs(q);
        const students = snapshot.docs.map(doc => {
            const data = doc.data();

            if (userRole === 'COACH') {
                delete data.parentEmail;
                delete data.parentPhone;
            }

            return { id: doc.id, ...data };
        });

        return { success: true, students };
    } catch (error) {
        console.error('Error fetching students:', error);
        return { success: false, error: error.message };
    }
};

export const getStudentByAccountId = async (accountId) => {
    try {
        const q = query(collection(db, COLLECTIONS.STUDENTS), where('accountId', '==', accountId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: 'No student found' };
        }

        const studentDoc = snapshot.docs[0];
        return { success: true, student: { id: studentDoc.id, ...studentDoc.data() } };
    } catch (error) {
        console.error('Error fetching student:', error);
        return { success: false, error: error.message };
    }
};

export const updateStudent = async (studentId, updateData) => {
    try {
        const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
        await updateDoc(studentRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating student:', error);
        return { success: false, error: error.message };
    }
};

// ==========================================
// COACH OPERATIONS
// ==========================================

export const createCoachApplication = async (applicationData) => {
    try {
        await addDoc(collection(db, COLLECTIONS.COACHES), {
            ...applicationData,
            status: 'PENDING',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error submitting coach application:', error);
        return { success: false, error: error.message };
    }
};

export const getCoachApplications = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.COACHES), where('status', '==', 'PENDING'));
        const snapshot = await getDocs(q);
        const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, applications };
    } catch (error) {
        console.error('Error fetching applications:', error);
        return { success: false, error: error.message };
    }
};

export const approveCoachApplication = async (applicationId, uid, password, adminId) => {
    try {
        // 1. Create Account Record
        // Note: Password saved only for MVP demonstration as requested
        await setDoc(doc(db, COLLECTIONS.ACCOUNTS, uid), {
            email: null, // Will be updated or fetched from coach doc if needed, but usually account links to profile
            role: 'COACH',
            createdByAdminId: adminId,
            tempPassword: password,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 2. Update Coach Doc
        const coachRef = doc(db, COLLECTIONS.COACHES, applicationId);
        await updateDoc(coachRef, {
            status: 'ACTIVE',
            accountId: uid,
            approvedBy: adminId,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error approving coach:', error);
        return { success: false, error: error.message };
    }
};

export const getAllCoaches = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.COACHES), where('status', '==', 'ACTIVE'));
        const snapshot = await getDocs(q);
        const coaches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, coaches };
    } catch (error) {
        console.error('Error fetching coaches:', error);
        return { success: false, error: error.message };
    }
};

export const getCoachByAccountId = async (accountId) => {
    try {
        const q = query(collection(db, COLLECTIONS.COACHES), where('accountId', '==', accountId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: 'Coach not found' };
        }

        const coachDoc = snapshot.docs[0];
        return { success: true, coach: { id: coachDoc.id, ...coachDoc.data() } };
    } catch (error) {
        console.error('Error fetching coach:', error);
        return { success: false, error: error.message };
    }
};

// ==========================================
// BATCH OPERATIONS
// ==========================================

export const getAllBatches = async () => {
    try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.BATCHES));
        const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, batches };
    } catch (error) {
        console.error('Error fetching batches:', error);
        return { success: false, error: error.message };
    }
};

export const getBatchById = async (batchId) => {
    try {
        const batchDoc = await getDoc(doc(db, COLLECTIONS.BATCHES, batchId));
        if (batchDoc.exists()) {
            return { success: true, batch: { id: batchDoc.id, ...batchDoc.data() } };
        }
        return { success: false, error: 'Batch not found' };
    } catch (error) {
        console.error('Error fetching batch:', error);
        return { success: false, error: error.message };
    }
};

// ==========================================
// CHAT OPERATIONS (WebSocket Real-time)
// ==========================================

export const createChat = async (chatData) => {
    try {
        const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), {
            chatType: chatData.chatType,
            participants: chatData.participants,
            batchId: chatData.batchId || null,
            lastMessage: '',
            lastMessageAt: serverTimestamp(),
            createdAt: serverTimestamp()
        });
        return { success: true, chatId: chatRef.id };
    } catch (error) {
        console.error('Error creating chat:', error);
        return { success: false, error: error.message };
    }
};

export const listenToUserChats = (userId, callback) => {
    const q = query(
        collection(db, COLLECTIONS.CHATS),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(chats);
    });
};

export const sendMessage = async (chatId, senderId, senderName, senderRole, content, fileUrl = null, fileName = null) => {
    try {
        await addDoc(collection(db, COLLECTIONS.MESSAGES), {
            chatId: chatId,
            senderId: senderId,
            senderName: senderName,
            senderRole: senderRole,
            content: content,
            fileUrl: fileUrl,
            fileName: fileName,
            createdAt: serverTimestamp()
        });

        const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
        await updateDoc(chatRef, {
            lastMessage: fileUrl ? `[File] ${fileName}` : content,
            lastMessageAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
    }
};

export const listenToMessages = (chatId, callback) => {
    const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    });
};

// ==========================================
// SUBSCRIPTION OPERATIONS
// ==========================================

export const getSubscriptionByAccountId = async (accountId) => {
    try {
        const q = query(collection(db, COLLECTIONS.SUBSCRIPTIONS), where('accountId', '==', accountId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: 'No subscription found' };
        }

        const subDoc = snapshot.docs[0];
        return { success: true, subscription: { id: subDoc.id, ...subDoc.data() } };
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return { success: false, error: error.message };
    }
};

export const updateSubscriptionStatus = async (subscriptionId, newStatus) => {
    try {
        const subRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId);
        await updateDoc(subRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating subscription:', error);
        return { success: false, error: error.message };
    }
};
