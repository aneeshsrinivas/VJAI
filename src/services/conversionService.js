/**
 * Conversion Service - Handles payment submission and admin approval
 * Manages the flow: Demo → Payment Submitted → Admin Approval → Student Created
 */

import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';
import { emailService } from './emailService';
import { createParentAuthAccount } from './adminAuthService';

export const conversionService = {
    /**
     * Step 1: User submits payment proof / payment is verified
     * Updates demo status to PAYMENT_COMPLETED (payment verified, waiting for admin to convert)
     * Also updates parent's user status to PENDING_COACH if parent account exists
     */
    submitPaymentProof: async (demoId, planDetails, paymentDetails) => {
        try {
            const demoRef = doc(db, 'demos', demoId);
            const demoSnap = await getDoc(demoRef);

            if (!demoSnap.exists()) {
                throw new Error('Demo not found');
            }

            const demoData = demoSnap.data();

            // Update demo status to PAYMENT_COMPLETED
            await updateDoc(demoRef, {
                status: 'PAYMENT_COMPLETED',
                selectedPlan: planDetails,
                paymentDetails: {
                    ...paymentDetails,
                    submittedAt: new Date().toISOString()
                },
                updatedAt: serverTimestamp()
            });

            // Try to find and update parent's user account if it exists
            if (demoData.parentEmail) {
                try {
                    const parentQuery = query(
                        collection(db, 'users'),
                        where('email', '==', demoData.parentEmail)
                    );
                    const parentSnap = await getDocs(parentQuery);

                    if (!parentSnap.empty) {
                        // Update existing parent user to PENDING_COACH status
                        // (they've paid, waiting for admin coach assignment)
                        const parentUid = parentSnap.docs[0].id;
                        await updateDoc(doc(db, 'users', parentUid), {
                            status: 'PENDING_COACH',
                            updatedAt: serverTimestamp()
                        });
                    }
                } catch (userUpdateError) {
                    // Don't fail demo payment if user update fails
                    console.warn('Could not update parent user status:', userUpdateError);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error submitting payment proof:', error);
            throw error;
        }
    },

    /**
     * Step 2: Admin approves payment → Creates or Updates Student & Subscription
     * Now accepts optional assignmentData to set coach/batch during approval
     */
    approvePayment: async (demoId, assignmentData = {}) => {
        try {
            console.log(`🚀 Starting approval for demo: ${demoId}`, assignmentData);
            
            // 1. Fetch Demo Data
            const demoRef = doc(db, 'demos', demoId);
            const demoSnap = await getDoc(demoRef);

            if (!demoSnap.exists()) {
                throw new Error('Demo not found');
            }

            const demoData = demoSnap.data();
            const currentStatus = (demoData.status || '').toUpperCase();
            
            console.log(`🔍 Current demo status in DB: "${currentStatus}"`);

            const validStatuses = ['PAYMENT_COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESSFUL'];
            if (!validStatuses.includes(currentStatus)) {
                console.error(`❌ Approval rejected. Status "${currentStatus}" not in:`, validStatuses);
                throw new Error(`Demo is not pending payment approval (Current status: ${demoData.status})`);
            }

            // 2. Check if parent user already exists with this demoId or email
            let realUid;
            let existingUserFound = false;

            // Priority 1: Search by demoId link (most robust for conversions)
            const demoIdQuery = query(
                collection(db, 'users'),
                where('demoId', '==', demoId)
            );
            const demoIdSnap = await getDocs(demoIdQuery);

            if (!demoIdSnap.empty) {
                realUid = demoIdSnap.docs[0].id;
                existingUserFound = true;
                console.log(`👤 Found existing user account via demoId: ${realUid}`);
            } else {
                // Priority 2: Fallback to searching by parent email
                const parentEmailQuery = query(
                    collection(db, 'users'),
                    where('email', '==', demoData.parentEmail)
                );
                const existingUserSnap = await getDocs(parentEmailQuery);

                if (!existingUserSnap.empty) {
                    realUid = existingUserSnap.docs[0].id;
                    existingUserFound = true;
                    console.log(`👤 Found existing user account via email: ${realUid}`);
                }
            }

            if (!existingUserFound) {
                console.log('👤 No existing account. Creating new auth account...');
                // Create a REAL Firebase Auth account with temporary password
                const tempPassword = `Temp${Date.now().toString().slice(-6)}!`;
                const authResult = await createParentAuthAccount(demoData.parentEmail, tempPassword);

                if (!authResult.success) {
                    throw new Error(`Failed to create auth account: ${authResult.error}`);
                }

                realUid = authResult.uid;
                console.log(`✅ Created auth account: ${realUid}`);
            }

            // 3. Create or update users document
            //    Include ALL student fields so coach queries, assignments, etc. work
            const userData = {
                email: demoData.parentEmail,
                fullName: demoData.parentName,
                role: 'customer',
                studentName: demoData.studentName || '',
                studentAge: demoData.studentAge || null,
                assignedCoachId: assignmentData.coachId || demoData.assignedCoachId || null,
                assignedBatchId: assignmentData.batchId || demoData.assignedBatchId || null,
                assignedBatchName: assignmentData.batchName || demoData.assignedBatchName || null,
                learningLevel: demoData.recommendedLevel || demoData.level || 'beginner',
                level: demoData.recommendedLevel || demoData.level || 'beginner',
                studentType: demoData.recommendedStudentType || 'group',
                phone: demoData.phone || demoData.parentPhone || '',
                timezone: demoData.timezone || 'IST',
                country: demoData.country || '',
                status: 'ACTIVE',
                source: 'DEMO_CONVERSION',
                demoId: demoId,
                lastLoginAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (!existingUserFound) {
                userData.createdAt = serverTimestamp();
            }

            await setDoc(doc(db, 'users', realUid), userData, { merge: true });
            console.log('✅ Updated users document');

            // 4. Create Student Record in 'students' collection
            const studentData = {
                accountId: realUid,
                studentName: demoData.studentName,
                parentName: demoData.parentName,
                parentEmail: demoData.parentEmail,
                phone: demoData.phone || '',
                timezone: demoData.timezone || 'IST',
                level: demoData.level || 'beginner',
                assignedCoachId: assignmentData.coachId || demoData.assignedCoachId || null,
                assignedBatchId: assignmentData.batchId || demoData.assignedBatchId || null,
                assignedBatchName: assignmentData.batchName || demoData.assignedBatchName || null,
                status: 'ACTIVE',
                updatedAt: serverTimestamp()
            };

            // Check if student doc already exists for this account
            const studentQuery = query(collection(db, 'students'), where('accountId', '==', realUid));
            const studentSnap = await getDocs(studentQuery);
            
            let studentRefId;
            if (!studentSnap.empty) {
                studentRefId = studentSnap.docs[0].id;
                await updateDoc(doc(db, 'students', studentRefId), studentData);
                console.log(`✅ Updated existing student record: ${studentRefId}`);
            } else {
                studentData.createdAt = serverTimestamp();
                const studentRef = await addDoc(collection(db, 'students'), studentData);
                studentRefId = studentRef.id;
                console.log(`✅ Created new student record: ${studentRefId}`);
            }

            // 5. Create Subscription Record
            const plan = demoData.selectedPlan || {};
            await addDoc(collection(db, 'subscriptions'), {
                accountId: realUid,
                studentId: studentRefId,
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
                convertedStudentId: studentRefId,
                paymentApprovedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 7. Send Welcome Email with credentials (only if account was created, not updated)
            if (!existingUserFound) {
                try {
                    const tempPassword = `Temp${Date.now().toString().slice(-6)}!`;
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
• Portal URL: https://vjai.onrender.com/login

📚 What's Next:
1. Login to your parent dashboard using the credentials above
2. View class schedule (will be updated once coach is assigned)
3. Access lesson materials & resources
4. Chat with coach in batch group chat

Important: Please change your password after first login in Settings.

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Support: indianchessacademy@email.com`
                        })
                    });
                } catch (emailError) {
                    console.error('Failed to send welcome email but payment was approved:', emailError);
                    // We don't throw here to avoid rolling back the approval if email fails
                }
            }

            return { success: true, studentId: studentRefId };
        } catch (error) {
            console.error('Error approving payment:', error);
            throw error;
        }
    }
};

export default conversionService;
