import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyADrp7M6ar3VU19SzWf8sKCGzf_V3clF54',
  authDomain: 'orbilius-81978.firebaseapp.com',
  projectId: 'orbilius-81978',
  storageBucket: 'orbilius-81978.firebasestorage.app',
  messagingSenderId: '194907657488',
  appId: '1:194907657488:web:a1cccc2de766b1a7394195',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkInvitations() {
  console.log('Checking pending_invitations collection...\n');
  
  const snapshot = await getDocs(collection(db, 'pending_invitations'));
  
  console.log(`Found ${snapshot.size} pending invitations:\n`);
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`ID: ${doc.id}`);
    console.log(`Email: ${data.email}`);
    console.log(`Role: ${data.role}`);
    console.log(`Status: ${data.status}`);
    console.log(`Invitation Code: ${data.invitation_code}`);
    console.log(`Invited At: ${data.invited_at?.toDate?.() || data.invited_at}`);
    console.log(`Teacher ID: ${data.teacher_id || 'N/A'}`);
    console.log('---\n');
  });
  
  process.exit(0);
}

checkInvitations().catch(console.error);
