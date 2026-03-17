/**
 * Firebase Cloud Functions configuration
 */

// Cloud Function URLs (2nd Gen Cloud Run endpoints)
const CLOUD_RUN_BASE = 'https://vxzm7ahria-uc.a.run.app';

// Firebase project details for emulator
const PROJECT_ID = 'orbilius-81978';
const REGION = 'us-central1';

// Functions base URL - use emulator in dev, Cloud Run in production
// Temporarily using production - uncomment below to use emulator
const FUNCTIONS_BASE_URL = CLOUD_RUN_BASE;
// const FUNCTIONS_BASE_URL = import.meta.env.DEV
//   ? `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}` // Local emulator
//   : CLOUD_RUN_BASE;

// Export function endpoints - using production
export const CLOUD_FUNCTIONS = {
  checkUserEmail: 'https://checkuseremail-vxzm7ahria-uc.a.run.app',
  deleteStudent: 'https://deletestudent-vxzm7ahria-uc.a.run.app',
  deleteTeacher: 'https://deleteteacher-vxzm7ahria-uc.a.run.app',
  sendInvite: 'https://sendinvite-vxzm7ahria-uc.a.run.app',
};
