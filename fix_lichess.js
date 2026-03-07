import { db } from './src/lib/firebase.js';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

async function fixData() {
    console.log("Checking users with lichessIntegrationStatus or lichessUsername...");
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    
    snap.forEach(doc => {
        const data = doc.data();
        if (data.lichessUsername || data.lichessIntegrationStatus) {
            console.log(`User ${doc.id} (${data.email}): lichessUsername=${data.lichessUsername}, status=${data.lichessIntegrationStatus}`);
        }
    });

    console.log("Checking chats...");
    const chatsRef = collection(db, 'chats');
    const qChats = query(chatsRef, where('chatType', 'in', ['BATCH_GROUP', 'BATCH']));
    const chatSnap = await getDocs(qChats);

    for (const d of chatSnap.docs) {
        const data = d.data();
        console.log(`Chat ${d.id} (${data.name || data.batchName}): participants=${data.participants}`);
        
        // If it's the specific batch-1, let's update it.
        if (data.name === 'Batch-1' || data.batchName === 'Batch-1') {
            const newName = 'Intermediate-II Batch-1';
            await updateDoc(doc(db, 'chats', d.id), {
                 name: newName,
                 batchName: newName,
                 chatType: 'BATCH_GROUP',
                 // Add duck coach (donald trump accountId) if not there
                 participants: Array.from(new Set([...data.participants, 'H419sL6l0vXpEamONrN7MAMhEsm2']))
            });
            console.log(`Updated Chat ${d.id} to ${newName} and added donald trump (H419sL6l0vXpEamONrN7MAMhEsm2).`);
        }
    }

    process.exit(0);
}

fixData().catch(console.error);
