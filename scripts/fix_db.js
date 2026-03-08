import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
    }
});

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeDuplicateSubscriptions() {
    console.log("Removing Duplicate Subscriptions...");
    const subsSnap = await getDocs(collection(db, 'subscriptions'));
    let emails = {};

    subsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        const email = (data.parentEmail || data.email || '').toLowerCase();
        // Use createdAt if available, else 0
        const created = data.createdAt ? (data.createdAt.toMillis ? data.createdAt.toMillis() : Date.parse(data.createdAt)) : 0;
        
        if (email) {
            if (!emails[email]) emails[email] = [];
            emails[email].push({ id: docSnap.id, created, data });
        }
    });

    let deleteCount = 0;
    for (const [email, subs] of Object.entries(emails)) {
        if (subs.length > 1) {
            console.log(`\nEmail: ${email} has ${subs.length} subscriptions.`);
            
            // Sort by created descending (newest first)
            subs.sort((a, b) => b.created - a.created);
            
            // Keep the one with highest priority status, or if tie, the newest
            const statusPriority = { 'ACTIVE': 3, 'PAYMENT_SUCCESSFUL': 2, 'PAYMENT_PENDING': 1, 'INACTIVE': 0, 'CANCELLED': -1 };
            subs.sort((a, b) => (statusPriority[b.data.status] || 0) - (statusPriority[a.data.status] || 0));
            
            let keepSub = subs[0];
            
            for (const sub of subs) {
                if (sub.id !== keepSub.id) {
                    console.log(`Deleting duplicate sub: ${sub.id} (status: ${sub.data.status}, amount: ${sub.data.amount})`);
                    await deleteDoc(doc(db, 'subscriptions', sub.id));
                    deleteCount++;
                } else {
                    console.log(`Keeping sub: ${sub.id} (status: ${sub.data.status}, amount: ${sub.data.amount})`);
                }
            }
        }
    }
    console.log(`Deleted ${deleteCount} duplicate subscription records.`);
}

async function run() {
    await removeDuplicateSubscriptions();
    console.log("Done");
    process.exit(0);
}

run().catch(console.error);
