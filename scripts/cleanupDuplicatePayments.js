/**
 * Cleanup Script for Duplicate Payment Records
 *
 * Identifies and removes duplicate payment records from Firestore.
 * A payment is considered a duplicate if:
 * - Same parentId/parentEmail
 * - Same date (within same day)
 * - Same amount
 *
 * Keeps the first payment, deletes subsequent duplicates.
 *
 * Usage: node scripts/cleanupDuplicatePayments.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need this

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project.firebaseio.com'
});

const db = admin.firestore();

async function cleanupDuplicates() {
    try {
        console.log('🔍 Fetching all payment records...');
        const paymentsSnapshot = await db.collection('payments').get();
        const allPayments = [];

        paymentsSnapshot.forEach(doc => {
            allPayments.push({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
            });
        });

        console.log(`✓ Found ${allPayments.length} total payment records`);

        // Group by parentId/parentEmail + date + amount
        const groups = {};
        allPayments.forEach(payment => {
            const key = `${payment.parentId || payment.parentEmail}_${payment.date.toLocaleDateString()}_${payment.amount}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(payment);
        });

        // Find duplicates
        const duplicates = [];
        Object.entries(groups).forEach(([key, payments]) => {
            if (payments.length > 1) {
                console.log(`\n📋 Duplicate Group Found: ${key}`);
                console.log(`   Total records: ${payments.length}`);

                // Keep first, mark rest as duplicates
                const [keep, ...toDelete] = payments.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
                );

                console.log(`   ✓ Keeping: ${keep.id} (${keep.description})`);
                toDelete.forEach(dup => {
                    console.log(`   ✗ Deleting: ${dup.id}`);
                    duplicates.push(dup.id);
                });
            }
        });

        if (duplicates.length === 0) {
            console.log('\n✓ No duplicates found!');
            return;
        }

        // Confirm before deletion
        console.log(`\n⚠️  Will delete ${duplicates.length} duplicate records.`);
        console.log('Proceed with deletion? (Uncomment the deletion code below and re-run)');

        // UNCOMMENT TO ACTUALLY DELETE:
        /*
        console.log('\n🗑️  Deleting duplicate records...');
        for (const docId of duplicates) {
            try {
                await db.collection('payments').doc(docId).delete();
                console.log(`   ✓ Deleted: ${docId}`);
            } catch (error) {
                console.error(`   ✗ Error deleting ${docId}:`, error.message);
            }
        }
        console.log(`\n✓ Cleanup complete! Deleted ${duplicates.length} records.`);
        */

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        process.exit(0);
    }
}

cleanupDuplicates();
