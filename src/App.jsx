import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ResetPassword from './components/ResetPassword/ResetPassword';
import ConfirmEmail from './components/ConfirmEmail/ConfirmEmail';
import CreateProject from './components/CreateProject/CreateProject';
import StudentDashboard from './student/components/Dashboard/Dashboard';
import TeacherDashboard from './teacher/components/Dashboard/Dashboard';
import AdminDashboard from './admin/dashboard';
import StepOneIndex from './student/components/Step1Index/Step1Index';
import StepOneUpload from './student/components/Step1Upload/Step1Upload';
import StepTwoIndex from './student/components/Step2Index/Step2Index';
import StepTwoUpload from './student/components/Step2Upload/Step2Upload';
import StepThreeIndex from './student/components/Step3Index/Step3Index';
import StepThreeUpload from './student/components/Step3Upload/Step3Upload';
import StepFourIndex from './student/components/Step4Index/Step4Index';
import StepFourUpload from './student/components/Step4Upload/Step4Upload';
import StepFiveIndex from './student/components/Step5Index/Step5Index';
import StepFiveUpload from './student/components/Step5Upload/Step5Upload';
import StepApproval from './teacher/components/StepApproval/StepApproval';

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
