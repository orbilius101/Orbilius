/**
 * Firebase Cloud Functions configuration
 */

// Cloud Function URLs (2nd Gen Cloud Run endpoints)
const CLOUD_RUN_BASE = 'https://vxzm7ahria-uc.a.run.app';

// Functions base URL - use emulator in dev, Cloud Run in production
const FUNCTIONS_BASE_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:5001' // Local emulator
  : CLOUD_RUN_BASE;

// Export function endpoints
export const CLOUD_FUNCTIONS = import.meta.env.DEV
  ? {
      checkUserEmail: `${FUNCTIONS_BASE_URL}/checkUserEmail`,
      deleteStudent: `${FUNCTIONS_BASE_URL}/deleteStudent`,
      deleteTeacher: `${FUNCTIONS_BASE_URL}/deleteTeacher`,
      sendInvite: `${FUNCTIONS_BASE_URL}/sendInvite`,
    }
  : {
      checkUserEmail: 'https://checkuseremail-vxzm7ahria-uc.a.run.app',
      deleteStudent: 'https://deletestudent-vxzm7ahria-uc.a.run.app',
      deleteTeacher: 'https://deleteteacher-vxzm7ahria-uc.a.run.app',
      sendInvite: 'https://sendinvite-vxzm7ahria-uc.a.run.app',
    };
