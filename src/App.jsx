import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Signup from './Signup';
import ResetPassword from './ResetPassword';
import ConfirmEmail from './ConfirmEmail';
import CreateProject from './createProject';
import StudentDashboard from './student/dashboard';
import TeacherDashboard from './teacher/dashboard';
import AdminDashboard from './admin/dashboard';
import SubmitStep from './student/submitStep';
import StepOneIndex from './student/step1/stepOneIndex';
import StepOneUpload from './student/step1/stepOneUpload';
import StepTwoIndex from './student/step2/stepTwoIndex';
import StepTwoUpload from './student/step2/stepTwoUpload';
import StepThreeIndex from './student/step3/stepThreeIndex';
import StepThreeUpload from './student/step3/stepThreeUpload';
import StepFourIndex from './student/step4/stepFourIndex';
import StepFourUpload from './student/step4/stepFourUpload';
import StepFiveIndex from './student/step5/stepFiveIndex';
import StepFiveUpload from './student/step5/stepFiveUpload';
import StepApproval from './teacher/stepApproval';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/createProject" element={<CreateProject />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/submitStep" element={<SubmitStep />} />
        <Route path="/student/step1/stepOneIndex" element={<StepOneIndex />} />
        <Route path="/student/step1/stepOneUpload" element={<StepOneUpload />} />
        <Route path="/student/step2/stepTwoIndex" element={<StepTwoIndex />} />
        <Route path="/student/step2/stepTwoUpload" element={<StepTwoUpload />} />
        <Route path="/student/step3/stepThreeIndex" element={<StepThreeIndex />} />
        <Route path="/student/step3/stepThreeUpload" element={<StepThreeUpload />} />
        <Route path="/student/step4/stepFourIndex" element={<StepFourIndex />} />
        <Route path="/student/step4/stepFourUpload" element={<StepFourUpload />} />
        <Route path="/student/step5/stepFiveIndex" element={<StepFiveIndex />} />
        <Route path="/student/step5/stepFiveUpload" element={<StepFiveUpload />} />
        <Route path="/teacher/step-approval/:projectId/:stepNumber" element={<StepApproval />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
