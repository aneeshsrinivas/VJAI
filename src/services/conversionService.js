/**
 * Conversion Service - Handles payment submission and admin approval
 * Manages the flow: Demo → Payment Submitted → Admin Approval → Student Created
 */

import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { emailService } from './emailService';

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

            // 2. Create account ID (simplified - in production use Firebase Auth)
            const accountId = `ACC_${Date.now()}`;

            // 3. Create Student Record
            const studentRef = await addDoc(collection(db, 'students'), {
                accountId: accountId,
                studentName: demoData.studentName,
                parentName: demoData.parentName,
                parentEmail: demoData.parentEmail,
                phone: demoData.phone,
                timezone: demoData.timezone,
                level: demoData.level || 'beginner',
                createdAt: serverTimestamp(),
                source: 'DEMO_CONVERSION',
                demoId: demoId,
                assignedCoachId: demoData.assignedCoachId || null,
                status: 'ACTIVE'
            });

            // 4. Create Subscription Record
            const plan = demoData.selectedPlan || {};
            await addDoc(collection(db, 'subscriptions'), {
                accountId: accountId,
                studentId: studentRef.id,
                planId: plan.id || 'default',
                planName: plan.name || 'Standard Plan',
                amount: plan.price || 0,
                billingCycle: plan.billingCycle || 'monthly',
                status: 'ACTIVE',
                startDate: serverTimestamp(),
                createdAt: serverTimestamp()
            });

            // 5. Update Demo Status to CONVERTED
            await updateDoc(demoRef, {
                status: 'CONVERTED',
                convertedStudentId: studentRef.id,
                paymentApprovedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 6. Send Welcome Email
            try {
                await emailService.sendWelcomeEmail({
                    parentEmail: demoData.parentEmail,
                    parentName: demoData.parentName,
                    studentName: demoData.studentName,
                    planName: plan.name || 'Member'
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
