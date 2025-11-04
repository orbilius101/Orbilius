import { NavigateFunction } from 'react-router-dom';

export interface SignupData {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  teacherId: string;
  setTeacherId: (value: string) => void;
  adminCode: string;
  setAdminCode: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  navigate: NavigateFunction;
  showAlert: (message: string, title?: string) => void;
}

export interface SignupHandlers {
  handleSignup: (e: React.FormEvent) => Promise<void>;
  handleSignUp: () => Promise<void>;
}

export interface LoginData {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  resetLoading: boolean;
  setResetLoading: (value: boolean) => void;
  navigate: NavigateFunction;
  showAlert: (message: string, title?: string) => void;
}

export interface LoginHandlers {
  handleLogin: (e: React.FormEvent) => Promise<void>;
  signIn: (e: React.FormEvent) => Promise<void>;
  resetPassword: () => Promise<void>;
}

export interface Project {
  project_id: string;
  project_name: string;
  student_id: string;
  teacher_id: string;
  current_step: number;
  step1_status: string;
  step2_status: string;
  step3_status: string;
  step4_status: string;
  step5_status: string;
  submitted_to_orbilius: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  teacher_id?: string;
}

export interface Submission {
  submission_id: string;
  project_id: string;
  step_number: number;
  file_url?: string;
  youtube_link?: string;
  submitted_at: string;
  teacher_comments?: string;
}
