import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyADrp7M6ar3VU19SzWf8sKCGzf_V3clF54",
  authDomain: "orbilius-81978.firebaseapp.com",
  projectId: "orbilius-81978",
  storageBucket: "orbilius-81978.firebasestorage.app",
  messagingSenderId: "194907657488",
  appId: "1:194907657488:web:a1cccc2de766b1a7394195"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAndCleanInvitations() {
  try {
    const snapshot = await getDocs(collection(db, 'pending_invitations'));
    
    console.log(`Total pending invitations: ${snapshot.size}\n`);
    
    const studentInvites = [];
    const teacherInvites = [];
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.role === 'student') {
        studentInvites.push({ id: docSnap.id, ...data });
      } else if (data.role === 'teacher') {
        teacherInvites.push({ id: docSnap.id, ...data });
      }
    });
    
    console.log('Teacher invitations:', teacherInvites.length);
    console.log('Student invitations:', studentInvites.length);
    
    const withoutTeacher = studentInvites.filter(inv => !inv.teacher_id);
    console.log('\nStudent invitations WITHOUT teacher_id:', withoutTeacher.length);
    
    if (withoutTeacher.length > 0) {
      console.log('\nOrphaned student invitations:');
      withoutTeacher.forEach(inv => {
        console.log(`  - ${inv.email} (ID: ${inv.id}, Status: ${inv.status})`);
      });
      
      const shouldDelete = process.argv.includes('--delete');
      if (shouldDelete) {
        console.log('\n🗑️  Deleting orphaned student invitations...');
        for (const inv of withoutTeacher) {
          await deleteDoc(doc(db, 'pending_invitations', inv.id));
          console.log(`  ✓ Deleted: ${inv.email}`);
        }
        console.log(`\n✅ Deleted ${withoutTeacher.length} orphaned invitation(s)`);
      } else {
        console.log('\nTo delete these orphaned invitations, run:');
        console.log('  node scripts/check-pending-invitations.mjs --delete');
      }
    } else {
      console.log('\n✅ No orphaned student invitations found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndCleanInvitations();
