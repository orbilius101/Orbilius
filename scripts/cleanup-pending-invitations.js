/**
 * Cleanup script for pending_invitations collection
 * This script checks for and optionally removes orphaned student invitations
 * that don't have a teacher_id set.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../service-account-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanupPendingInvitations() {
  console.log('Checking pending_invitations collection...\n');

  try {
    // Get all pending invitations
    const snapshot = await db.collection('pending_invitations').get();
    
    console.log(`Total pending invitations: ${snapshot.size}`);
    
    const studentInvitesWithoutTeacher = [];
    const studentInvitesWithTeacher = [];
    const teacherInvites = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.role === 'teacher') {
        teacherInvites.push({ id: doc.id, ...data });
      } else if (data.role === 'student') {
        if (!data.teacher_id || data.teacher_id === null) {
          studentInvitesWithoutTeacher.push({ id: doc.id, ...data });
        } else {
          studentInvitesWithTeacher.push({ id: doc.id, ...data });
        }
      }
    });
    
    console.log('\n=== Summary ===');
    console.log(`Teacher invitations: ${teacherInvites.length}`);
    console.log(`Student invitations with teacher_id: ${studentInvitesWithTeacher.length}`);
    console.log(`Student invitations WITHOUT teacher_id: ${studentInvitesWithoutTeacher.length}`);
    
    if (studentInvitesWithoutTeacher.length > 0) {
      console.log('\n=== Student invitations without teacher_id ===');
      studentInvitesWithoutTeacher.forEach(invite => {
        console.log(`  - ${invite.email} (ID: ${invite.id})`);
      });
      
      console.log('\nTo delete these orphaned invitations, run:');
      console.log('node scripts/cleanup-pending-invitations.js --delete');
      
      // Check if --delete flag is provided
      if (process.argv.includes('--delete')) {
        console.log('\nDeleting orphaned student invitations...');
        const batch = db.batch();
        studentInvitesWithoutTeacher.forEach(invite => {
          batch.delete(db.collection('pending_invitations').doc(invite.id));
        });
        await batch.commit();
        console.log(`Deleted ${studentInvitesWithoutTeacher.length} orphaned invitation(s)`);
      }
    } else {
      console.log('\n✓ No orphaned student invitations found');
    }
    
    if (studentInvitesWithTeacher.length > 0) {
      console.log('\n=== Student invitations with teacher_id ===');
      const grouped = {};
      studentInvitesWithTeacher.forEach(invite => {
        if (!grouped[invite.teacher_id]) {
          grouped[invite.teacher_id] = [];
        }
        grouped[invite.teacher_id].push(invite);
      });
      
      for (const [teacherId, invites] of Object.entries(grouped)) {
        console.log(`\n  Teacher ID: ${teacherId}`);
        invites.forEach(invite => {
          console.log(`    - ${invite.email} (Status: ${invite.status})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

cleanupPendingInvitations();
