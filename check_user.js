import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCrlgrGTEzG44CEY030F2B6NGJ3yewA0OA",
    authDomain: "vjai-9461b.firebaseapp.com",
    projectId: "vjai-9461b",
    storageBucket: "vjai-9461b.firebasestorage.app",
    messagingSenderId: "218573723475",
    appId: "1:218573723475:web:9db44a72518507eeadb3a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkKarthik() {
    console.log("Fetching 'karthik@student.com' from 'users' collection...");
    const q1 = query(collection(db, "users"), where("email", "==", "karthik@student.com"), limit(1));
    const snapshot1 = await getDocs(q1);
    snapshot1.forEach(doc => {
        console.log("----");
        console.log("User ID:", doc.id);
        console.log("Data:", doc.data());
    });

    console.log("\nFetching 'karthik@student.com' from 'students' collection (parentEmail)...");
    const q2 = query(collection(db, "students"), where("parentEmail", "==", "karthik@student.com"), limit(1));
    const snapshot2 = await getDocs(q2);
    snapshot2.forEach(doc => {
        console.log("----");
        console.log("Student Doc ID:", doc.id);
        console.log("Data:", doc.data());
    });
    
    process.exit(0);
}

checkKarthik();
