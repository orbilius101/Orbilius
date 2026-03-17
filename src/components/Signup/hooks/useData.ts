import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupData } from '../../../types';
import { useAlert } from '../../../hooks/useAlert';
import { getDocuments, buildConstraints } from '../../../utils/firebaseHelpers';

export function useSignupData(): SignupData & {
  alertState: any;
  closeAlert: () => void;
  invitationData: any;
  loadingInvitation: boolean;
} {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [teacherId, setTeacherId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    const teacherIdParam = params.get('teacherId');
    const roleParam = params.get('role');

    // Handle invitation code
    if (inviteCode) {
      setLoadingInvitation(true);
      // Fetch invitation details from Firestore
      getDocuments(
        'pending_invitations',
        buildConstraints({
          eq: { invitation_code: inviteCode, status: 'pending' },
        })
      ).then(({ data, error }) => {
        setLoadingInvitation(false);
        if (error || !data || data.length === 0) {
          showAlert('Invalid or expired invitation code', 'Error');
          return;
        }

        const invitation = data[0];
        setInvitationData(invitation);
        setEmail(invitation.email || '');
        setRole(invitation.role || 'teacher');
        // Set teacher_id for student invitations
        if (invitation.role === 'student' && invitation.teacher_id) {
          setTeacherId(invitation.teacher_id);
        }
      });
    } else if (teacherIdParam) {
      setTeacherId(teacherIdParam);
      setRole('student');
    } else if (roleParam) {
      setRole(roleParam);
    }
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    teacherId,
    setTeacherId,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading,
    setLoading,
    navigate,
    showAlert,
    alertState,
    closeAlert,
    invitationData,
    loadingInvitation,
  };
}
