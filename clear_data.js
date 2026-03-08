import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_CLEAR = [
    'demos',
    'students',
    'coaches',
    'batches',
    'chats',
    'messages',
    'subscriptions',
    'assignments',
    'schedule',
    'attendance',
    'payments',
    'accounts'
];

async function clearCollection(collectionName) {
    console.log(`Cleaning collection: ${collectionName}...`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    let count = 0;
    
    for (const document of querySnapshot.docs) {
        await deleteDoc(doc(db, collectionName, document.id));
        count++;
    }
    console.log(`Cleared ${count} documents from ${collectionName}.`);
}

async function clearUsers() {
    console.log('Cleaning users collection (preserving admin)...');
    const querySnapshot = await getDocs(collection(db, 'users'));
    let count = 0;
    
    for (const document of querySnapshot.docs) {
        const data = document.data();
        if (data.email === 'indianchessacademy@chess.com' || data.role === 'admin') {
            console.log(`Skipping admin user: ${data.email}`);
            continue;
        }
        await deleteDoc(doc(db, 'users', document.id));
        count++;
    }
    console.log(`Cleared ${count} user documents.`);
}

async function runCleanup() {
    try {
        console.log('--- Starting Firestore Cleanup ---');
        
        // Clear general collections
        for (const coll of COLLECTIONS_TO_CLEAR) {
            await clearCollection(coll);
        }
        
        // Clear users specially
        await clearUsers();
        
        console.log('--- Cleanup Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

runCleanup();
