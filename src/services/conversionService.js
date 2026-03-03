/**
 * Conversion Service - Handles payment submission and admin approval
 * Manages the flow: Demo → Payment Submitted → Admin Approval → Student Created
 */

import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { emailService } from './emailService';
import { createParentAuthAccount } from './adminAuthService';

export const conversionService = {
    /**
     * Step 1: User submits payment proof (after selecting UPI)
     * Updates demo status to PAYMENT_PENDING
     */
    submitPaymentProof: async (demoId, planDetails, paymentDetails) => {
        try {
            const demoRef = doc(db, 'demos', demoId);
            const demoSnap = await getDoc(demoRef);

            if (!demoSnap.exists()) {
                throw new Error('Demo not found');
            }

            await updateDoc(demoRef, {
                status: 'PAYMENT_PENDING',
                selectedPlan: planDetails,
                paymentDetails: {
                    ...paymentDetails,
                    submittedAt: new Date().toISOString()
                },
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error submitting payment proof:', error);
            throw error;
        }
    },

    /**
     * Step 2: Admin approves payment → Creates Student & Subscription
     */
    approvePayment: async (demoId) => {
        try {
            // 1. Fetch Demo Data
            const demoRef = doc(db, 'demos', demoId);
            const demoSnap = await getDoc(demoRef);

            if (!demoSnap.exists()) {
                throw new Error('Demo not found');
            }

            const demoData = demoSnap.data();

            if (demoData.status !== 'PAYMENT_PENDING') {
                throw new Error('Demo is not pending payment approval');
            }

            // 2. Create a REAL Firebase Auth account with temporary password
            const tempPassword = `Temp${Date.now().toString().slice(-6)}!`;
            const authResult = await createParentAuthAccount(demoData.parentEmail, tempPassword);

            if (!authResult.success) {
                throw new Error(`Failed to create auth account: ${authResult.error}`);
            }

            const realUid = authResult.uid;

            // 3. Create users document so parent can login via AuthContext
            await setDoc(doc(db, 'users', realUid), {
                email: demoData.parentEmail,
                fullName: demoData.parentName,
                role: 'customer',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                source: 'DEMO_CONVERSION',
                demoId: demoId
            });

            // 4. Create Student Record in 'students' collection
            const studentRef = await addDoc(collection(db, 'students'), {
                accountId: realUid,
                studentName: demoData.studentName,
                parentName: demoData.parentName,
                parentEmail: demoData.parentEmail,
                phone: demoData.phone || '',
                timezone: demoData.timezone,
                level: demoData.level || 'beginner',
                assignedCoachId: demoData.assignedCoachId || null,
                assignedBatchId: null,
                status: 'ACTIVE',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 5. Create Subscription Record
            const plan = demoData.selectedPlan || {};
            await addDoc(collection(db, 'subscriptions'), {
                accountId: realUid,
                studentId: studentRef.id,
                planId: plan.id || 'default',
                planName: plan.name || 'Standard Plan',
                amount: plan.price || 0,
                billingCycle: plan.billingCycle || 'monthly',
                status: 'ACTIVE',
                startedAt: serverTimestamp(),
                nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                createdAt: serverTimestamp()
            });

            // 6. Update Demo Status to CONVERTED
            await updateDoc(demoRef, {
                status: 'CONVERTED',
                convertedStudentId: studentRef.id,
                paymentApprovedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 7. Send Welcome Email with credentials
            try {
                const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';
                await fetch(`${EMAIL_API_URL}/api/email/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: demoData.parentEmail,
                        subject: `Welcome to Indian Chess Academy - Your LMS Access for ${demoData.studentName}`,
                        text: `Dear ${demoData.parentName},

Thank you for your payment! Your account has been created. 🎉

🎓 Your LMS Access:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Parent Email: ${demoData.parentEmail}
• Temporary Password: ${tempPassword}
• Portal URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://app.indianchessacademy.com'}/login

📚 What's Next:
1. Login to your parent dashboard using the credentials above
2. View class schedule (will be updated once coach is assigned)
3. Access lesson materials & resources
4. Chat with coach in batch group chat

Important: Please change your password after first login in Settings.

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Support: indianchessacademy@chess.com`
                    })
                });
            } catch (emailError) {
                console.error('Failed to send welcome email but payment was approved:', emailError);
                // We don't throw here to avoid rolling back the approval if email fails
            }

            return { success: true, studentId: studentRef.id };
        } catch (error) {
            console.error('Error approving payment:', error);
            throw error;
        }
    }
};

export default conversionService;
