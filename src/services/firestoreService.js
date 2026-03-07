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

        // 1. Update Demo Document
        await updateDoc(demoRef, {
            assignedCoachId: coachId,
            assignedAdminId: adminId,
            meetingLink: meetingLink,
            scheduledStart: scheduledStart,
            status: DEMO_STATUS.SCHEDULED,
            updatedAt: serverTimestamp()
        });

        // 2. Sync with Student Document (if exists)
        // Fetch demo to get email
        const demoSnap = await getDoc(demoRef);
        if (demoSnap.exists()) {
            const demoData = demoSnap.data();
            if (demoData.parentEmail) {
                const qStudent = query(
                    collection(db, COLLECTIONS.STUDENTS),
                    where('parentEmail', '==', demoData.parentEmail)
                );
                const studentSnap = await getDocs(qStudent);

                if (!studentSnap.empty) {
                    const studentDoc = studentSnap.docs[0];
                    const studentData = studentDoc.data();

                    // Update students collection
                    await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentDoc.id), {
                        assignedCoachId: coachId,
                        updatedAt: serverTimestamp()
                    });

                    // Also update the users document if it exists (for StudentPage.jsx)
                    if (studentData.accountId) {
                        try {
                            await updateDoc(doc(db, 'users', studentData.accountId), {
                                assignedCoachId: coachId,
                                updatedAt: serverTimestamp()
                            });
                        } catch (err) {
                            console.warn('Could not update users document:', err);
                        }
                    }

                    console.log('Synced coach assignment to student profile');
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error assigning coach to demo:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete Demo Request (Admin Action)
 */
export const deleteDemo = async (demoId) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.DEMOS, demoId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting demo:', error);
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

        // 1. Create users document so student can login with AuthContext
        await setDoc(doc(db, 'users', accountId), {
            email: demoData.parentEmail,
            fullName: demoData.parentName,
            role: 'customer',
            studentName: demoData.studentName,
            studentAge: demoData.studentAge || null,
            timezone: demoData.timezone || '',
            country: paymentData.country || '',
            studentType: demoData.recommendedStudentType || 'group',
            learningLevel: demoData.recommendedLevel || 'beginner',
            level: demoData.recommendedLevel || 'beginner',
            phone: demoData.parentPhone || demoData.phone || '',
            status: 'ACTIVE',
            assignedCoachId: demoData.assignedCoachId || null,
            source: 'DEMO_CONVERSION',
            demoId: demoId,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            createdByAdminId: paymentData.adminId,
        });

        // 2. Create student record
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

        // 3. Create subscription record
        await addDoc(collection(db, COLLECTIONS.SUBSCRIPTIONS), {
            accountId: accountId,
            studentId: studentRef.id,
            planId: paymentData.planId,
            amount: paymentData.amount,
            billingCycle: paymentData.billingCycle,
            duration: Number(paymentData.duration) || 1, // months — used for monthly revenue normalization
            status: 'ACTIVE',
            startedAt: serverTimestamp(),
            nextDueAt: paymentData.nextDueAt,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 4. Update demo status to CONVERTED
        const demoRef = doc(db, COLLECTIONS.DEMOS, demoId);
        await updateDoc(demoRef, {
            status: DEMO_STATUS.CONVERTED,
            updatedAt: serverTimestamp()
        });

        // 5. Create chat for admin-parent communication
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

/**
 * Convert Demo to Pending Student (Pre-payment LMS Access)
 */
export const convertDemoToPendingStudent = async (demoId, accountId, paymentData) => {
    try {
        const demoDoc = await getDoc(doc(db, COLLECTIONS.DEMOS, demoId));
        if (!demoDoc.exists()) {
            return { success: false, error: 'Demo not found' };
        }
        const demoData = demoDoc.data();

        // 1. Create users document so student can login with AuthContext
        await setDoc(doc(db, 'users', accountId), {
            email: paymentData.loginEmail || demoData.parentEmail,
            fullName: demoData.parentName,
            role: 'customer',
            studentName: demoData.studentName,
            studentAge: demoData.studentAge || null,
            timezone: demoData.timezone || '',
            studentType: demoData.recommendedStudentType || 'group',
            learningLevel: demoData.recommendedLevel || 'beginner',
            level: demoData.recommendedLevel || 'beginner',
            phone: demoData.parentPhone || demoData.phone || '',
            status: 'PAYMENT_PENDING',
            assignedCoachId: demoData.assignedCoachId || null,
            source: 'DEMO_CONVERSION',
            demoId: demoId,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            createdByAdminId: paymentData.adminId,
        });

        // 2. Create student record
        const studentRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
            accountId: accountId,
            studentName: demoData.studentName,
            studentAge: demoData.studentAge || null,
            parentName: demoData.parentName,
            parentEmail: paymentData.loginEmail || demoData.parentEmail,
            parentPhone: demoData.parentPhone || '',
            timezone: demoData.timezone,
            studentType: demoData.recommendedStudentType || 'group',
            level: demoData.recommendedLevel || 'beginner',
            rating: null,
            assignedCoachId: demoData.assignedCoachId,
            status: 'PAYMENT_PENDING',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // NO SUBSCRIPTION RECORD CREATED YET. THIS HAPPENS AT CHECKOUT.
        // NO MESSAGING CHAT CREATED YET.

        // 3. Update demo status to CONVERTED
        const demoRef = doc(db, COLLECTIONS.DEMOS, demoId);
        await updateDoc(demoRef, {
            status: DEMO_STATUS.CONVERTED,
            updatedAt: serverTimestamp()
        });

        return { success: true, studentId: studentRef.id };
    } catch (error) {
        console.error('Error converting demo to pending student:', error);
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

export const approveCoachApplication = async (applicationId, uid, password, adminId, coachEmail, coachFullName, assignedGroup, assignedBatch) => {
    try {
        // 1. Create users/{uid} doc so the coach can log in via AuthContext
        await setDoc(doc(db, 'users', uid), {
            email: coachEmail || null,
            fullName: coachFullName || null,
            role: 'coach',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            createdByAdminId: adminId,
        });

        // 2. Create Account Record (legacy — keep for backwards compat)
        await setDoc(doc(db, COLLECTIONS.ACCOUNTS, uid), {
            email: coachEmail || null,
            role: 'COACH',
            createdByAdminId: adminId,
            tempPassword: password,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 3. Update Coach Doc to ACTIVE with group/batch assignment
        const coachRef = doc(db, COLLECTIONS.COACHES, applicationId);
        await updateDoc(coachRef, {
            status: 'ACTIVE',
            accountId: uid,
            approvedBy: adminId,
            assignedGroup: assignedGroup || null,
            assignedBatch: assignedBatch || null,
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
        const q = query(collection(db, 'coaches'), where('status', '==', 'ACTIVE'));
        const coachSnapshot = await getDocs(q);
        const coachList = coachSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return { success: true, coaches: coachList };
    } catch (error) {
        console.error('Error fetching coaches:', error);
        return { success: false, error: error.message, coaches: [] };
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
// ==========================================
// ASSIGNMENT OPERATIONS
// ==========================================

export const createAssignment = async (assignmentData) => {
    try {
        await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
            ...assignmentData,
            status: 'Pending',
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating assignment:', error);
        return { success: false, error: error.message };
    }
};

export const getAssignmentsByBatch = async (batchId) => { // Or studentId if handled
    // This is a basic query. In real app, might need complex filtering
    // For now, let's assume assignments are linked to a batch or specific student
    // If linked to batch: where('batchId', '==', batchId)
    // If linked to student: where('studentId', '==', studentId)
    return { success: false, error: "Direct query preferred for real-time" };
};


// ==========================================
// SCHEDULE OPERATIONS
// ==========================================

export const createClass = async (classData) => {
    try {
        await addDoc(collection(db, COLLECTIONS.SCHEDULE), {
            ...classData,
            status: 'SCHEDULED',
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating class:', error);
        return { success: false, error: error.message };
    }
};
