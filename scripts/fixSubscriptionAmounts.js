/**
 * Fix Script: Convert subscription amounts from INR to USD
 *
 * Problem: Subscription records were incorrectly storing amountINR instead of
 * the plan price in USD, causing inflated display values in student dashboard.
 *
 * This script finds subscriptions with amounts > 500 (clearly INR, not USD)
 * and converts them by dividing by the 91.94 exchange rate.
 *
 * Usage: node scripts/fixSubscriptionAmounts.js
 * Requires: serviceAccountKey.json in scripts/ directory
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const EXCHANGE_RATE = 91.94;

async function fixSubscriptionAmounts() {
    try {
        console.log('🔍 Fetching all subscription records...');
        const snapshot = await db.collection('subscriptions').get();

        const toFix = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = data.amount;

            // If amount > 500, it's almost certainly stored in INR (not USD)
            // USD plan prices are typically $50-$200
            if (amount && amount > 500) {
                const correctedAmount = Math.round((amount / EXCHANGE_RATE) * 100) / 100;
                toFix.push({
                    id: doc.id,
                    parentEmail: data.parentEmail,
                    studentName: data.studentName,
                    originalAmount: amount,
                    correctedAmount,
                    planName: data.planName
                });
            }
        });

        if (toFix.length === 0) {
            console.log('✅ No subscriptions need fixing!');
            return;
        }

        console.log(`\n⚠️  Found ${toFix.length} subscription(s) with INR amounts:\n`);
        toFix.forEach(s => {
            console.log(`  - ${s.studentName} (${s.parentEmail})`);
            console.log(`    Plan: ${s.planName}`);
            console.log(`    Amount: ₹${s.originalAmount} → $${s.correctedAmount}`);
            console.log(`    Doc ID: ${s.id}\n`);
        });

        // Apply fixes
        console.log('🔧 Fixing amounts...');
        for (const sub of toFix) {
            await db.collection('subscriptions').doc(sub.id).update({
                amount: sub.correctedAmount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`  ✅ Fixed: ${sub.studentName} → $${sub.correctedAmount}`);
        }

        console.log(`\n✅ Done! Fixed ${toFix.length} subscription record(s).`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

fixSubscriptionAmounts();
