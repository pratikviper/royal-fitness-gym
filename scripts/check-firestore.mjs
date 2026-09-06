import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAp-TiPa6MfGZk-90e2mFjV6p47VV2UD3E",
  authDomain: "gym-management-968eb.firebaseapp.com",
  projectId: "gym-management-968eb",
  storageBucket: "gym-management-968eb.firebasestorage.app",
  messagingSenderId: "275537981662",
  appId: "1:275537981662:web:bb95b6ffa8c4f2b5b3c61d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function check() {
  await signInWithEmailAndPassword(auth, "admin@royalfitness.com", "Admin@123");
  console.log("Logged in as admin successfully!");

  console.log("\n=== USERS IN FIRESTORE ===");
  const usersSnap = await getDocs(collection(db, "users"));
  console.log(`Total users in 'users' collection: ${usersSnap.size}`);
  usersSnap.forEach((doc) => {
    console.log(doc.id, "=>", JSON.stringify(doc.data()));
  });

  console.log("\n=== MEMBERSHIPS IN FIRESTORE ===");
  const membSnap = await getDocs(collection(db, "memberships"));
  console.log(`Total in 'memberships' collection: ${membSnap.size}`);
  membSnap.forEach((doc) => {
    console.log(doc.id, "=>", JSON.stringify(doc.data()));
  });
}

check().catch(console.error);
