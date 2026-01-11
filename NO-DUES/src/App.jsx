import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './contexts/StudentAuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext'; // ✅ Import ApplicationsProvider
import LoginScreen from './pages/login/loginscreen';
import MainPage from './pages/MainPage';
import StudentEntry from './pages/Student/StudentEntry';
import StudentLogin from './pages/Student/Login';
import StudentRegister from './pages/Student/Register';
import StudentDashboard from './pages/Student/StudentDashboard';

// Dashboards
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateUser from './pages/Admin/CreateUser';
import SportsDashboard from './pages/Sports/SportsDashboard';
import ExamDashboard from './pages/Exam/ExamDashboard';
import AccountsDashboard from './pages/Accounts/AccountsDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import HostelsDashboard from './pages/Hostels/HostelsDashboard';
import LaboratoriesDashboard from './pages/Laboratories/LaboratoriesDashboard';

// Admin Pages
import AdminPending from './pages/Admin/PendingPage';
import AdminHistory from './pages/Admin/HistoryPage';

// Sports Pages
import SportsPending from './pages/Sports/PendingPage';
import SportsHistory from './pages/Sports/HistoryPage';

// Exam Pages
import ExamPending from './pages/Exam/PendingPage';
import ExamHistory from './pages/Exam/HistoryPage';

// Accounts Pages
import AccountsPending from './pages/Accounts/PendingPage';
import AccountsHistory from './pages/Accounts/HistoryPage';

// Library Pages
import LibraryPending from './pages/Library/PendingPage';
import LibraryHistory from './pages/Library/HistoryPage';

// Hostels Pages
import HostelsPending from './pages/Hostels/PendingPage';
import HostelsHistory from './pages/Hostels/HistoryPage';

// Laboratories Pages
import LaboratoriesPending from './pages/Laboratories/PendingPage';
import LaboratoriesHistory from './pages/Laboratories/HistoryPage';

// Department Pages
import DepartmentDashboard from './pages/Department/SchoolDashboard';
import DepartmentPending from './pages/Department/PendingPage';
import DepartmentHistory from './pages/Department/HistoryPage';
import DepartmentRejected from './pages/Department/RejectedPage';

// Rejected Pages (importing for all roles)
import AdminRejected from './pages/Admin/RejectedPage';
import SportsRejected from './pages/Sports/RejectedPage';
import ExamRejected from './pages/Exam/RejectedPage';
import AccountsRejected from './pages/Accounts/RejectedPage';
import LibraryRejected from './pages/Library/RejectedPage';
import HostelsRejected from './pages/Hostels/RejectedPage';
import LaboratoriesRejected from './pages/Laboratories/RejectedPage';

import './App.css';
import HomeButton from './components/common/HomeButton';

// ✅ Protected Route Component (role checks removed)
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const user = auth && auth.user ? auth.user : null;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Student protected route (uses StudentAuthContext)
const StudentProtectedRoute = ({ children }) => {
  const studentCtx = useStudentAuth();
  const student = studentCtx && studentCtx.student ? studentCtx.student : null;
  if (!student) return <Navigate to="/student/login" replace />;
  return children;
};

// ✅ Role Routes (Keeps all pages for a role together)
// Accepts optional PendingComponent, HistoryComponent, and RejectedComponent to avoid referencing undefined placeholders
const RoleRoutes = ({ role, Dashboard, PendingComponent, HistoryComponent, RejectedComponent, CreateComponent }) => (
  <ProtectedRoute>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="pending" element={PendingComponent ? <PendingComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="rejected" element={RejectedComponent ? <RejectedComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="history" element={HistoryComponent ? <HistoryComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="create-user" element={CreateComponent ? <CreateComponent /> : <Navigate to="dashboard" replace />} />
      {/* Unknown subroutes go back to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      {/* ✅ Wrap with ApplicationsProvider */}
      <ApplicationProvider>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Role Routes */}
          <Route path="/admin/*" element={<RoleRoutes role="admin" Dashboard={AdminDashboard} PendingComponent={AdminPending} HistoryComponent={AdminHistory} RejectedComponent={AdminRejected} CreateComponent={CreateUser} />} />
          <Route path="/sports/*" element={<RoleRoutes role="sports" Dashboard={SportsDashboard} PendingComponent={SportsPending} HistoryComponent={SportsHistory} RejectedComponent={SportsRejected} />} />
          <Route path="/exam/*" element={<RoleRoutes role="exam" Dashboard={ExamDashboard} PendingComponent={ExamPending} HistoryComponent={ExamHistory} RejectedComponent={ExamRejected} />} />
          <Route path="/accounts/*" element={<RoleRoutes role="accounts" Dashboard={AccountsDashboard} PendingComponent={AccountsPending} HistoryComponent={AccountsHistory} RejectedComponent={AccountsRejected} />} />
          <Route path="/library/*" element={<RoleRoutes role="library" Dashboard={LibraryDashboard} PendingComponent={LibraryPending} HistoryComponent={LibraryHistory} RejectedComponent={LibraryRejected} />} />
          <Route path="/hostels/*" element={<RoleRoutes role="hostels" Dashboard={HostelsDashboard} PendingComponent={HostelsPending} HistoryComponent={HostelsHistory} RejectedComponent={HostelsRejected} />} />
          <Route path="/laboratories/*" element={<RoleRoutes role="laboratories" Dashboard={LaboratoriesDashboard} PendingComponent={LaboratoriesPending} HistoryComponent={LaboratoriesHistory} RejectedComponent={LaboratoriesRejected} />} />
          <Route path="/department/*" element={<RoleRoutes role="department" Dashboard={DepartmentDashboard} PendingComponent={DepartmentPending} HistoryComponent={DepartmentHistory} RejectedComponent={DepartmentRejected} />} />

          {/* Generic routes (role-agnostic) */}
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          {/* Root and fallback */}
          <Route path="/" element={<MainPage />} />
          <Route path="/student" element={<StudentAuthProvider><StudentEntry /></StudentAuthProvider>} />
          <Route path="/student/login" element={<StudentAuthProvider><StudentLogin /></StudentAuthProvider>} />
          <Route path="/student/register" element={<StudentAuthProvider><StudentRegister /></StudentAuthProvider>} />
          <Route path="/student/dashboard" element={<StudentAuthProvider><StudentProtectedRoute><StudentDashboard /></StudentProtectedRoute></StudentAuthProvider>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <HomeButton />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;