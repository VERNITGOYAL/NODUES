import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './contexts/StudentAuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext'; 
import LoginScreen from './pages/login/loginscreen';
import MainPage from './pages/MainPage';
import StudentEntry from './pages/Student/StudentEntry';
import StudentLogin from './pages/Student/Login';
import StudentRegister from './pages/Student/Register';
import StudentDashboard from './pages/Student/StudentDashboard';

// --- DASHBOARDS ---
import SportsDashboard from './pages/Sports/SportsDashboard';
import CRCDashboard from './pages/CRC/CRCDashboard';
import AccountsDashboard from './pages/Accounts/AccountsDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import HostelsDashboard from './pages/Hostels/HostelsDashboard';
import LabDashboard from './pages/Laboratories/LabDashboard';
import SchoolDashboard from './pages/Schools/SchoolDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

// --- HISTORY PAGES ---
import SportsHistory from './pages/Sports/HistoryPage';
import CRCHistory from './pages/CRC/HistoryPage';
import AccountsHistory from './pages/Accounts/HistoryPage';
import LibraryHistory from './pages/Library/HistoryPage';
import HostelsHistory from './pages/Hostels/HistoryPage';
import LaboratoriesHistory from './pages/Laboratories/HistoryPage';
import SchoolHistory from './pages/Schools/HistoryPage';

import './App.css';
import HomeButton from './components/common/HomeButton';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; 
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Student protected route
const StudentProtectedRoute = ({ children }) => {
  const { student, loading } = useStudentAuth();
  if (loading) return null;
  if (!student) return <Navigate to="/student/login" replace />;
  return children;
};

// Role Routes Helper
const RoleRoutes = ({ Dashboard, HistoryComponent, PendingComponent }) => (
  <ProtectedRoute>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="history" element={HistoryComponent ? <HistoryComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="pending" element={PendingComponent ? <PendingComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />

          {/* Admin */}
          <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Departments - Normalized Paths */}
          <Route path="/sports/*" element={<RoleRoutes Dashboard={SportsDashboard} HistoryComponent={SportsHistory} />} />
          <Route path="/crc/*" element={<RoleRoutes Dashboard={CRCDashboard} HistoryComponent={CRCHistory} />} />
          
          {/* Accounts Redirection Support */}
          <Route path="/accounts/*" element={<RoleRoutes Dashboard={AccountsDashboard} HistoryComponent={AccountsHistory} />} />
          <Route path="/account/*" element={<Navigate to="/accounts/dashboard" replace />} />

          <Route path="/library/*" element={<RoleRoutes Dashboard={LibraryDashboard} HistoryComponent={LibraryHistory} />} />
          
          {/* Hostel Redirection Support */}
          <Route path="/hostels/*" element={<RoleRoutes Dashboard={HostelsDashboard} HistoryComponent={HostelsHistory} />} />
          <Route path="/hostel/*" element={<RoleRoutes Dashboard={HostelsDashboard} HistoryComponent={HostelsHistory} />} />
          
          {/* ✅ FIXED: Laboratory/Lab Redirection Support */}
          <Route path="/laboratories/*" element={<RoleRoutes Dashboard={LabDashboard} HistoryComponent={LaboratoriesHistory} />} />
          <Route path="/laboratory/*" element={<RoleRoutes Dashboard={LabDashboard} HistoryComponent={LaboratoriesHistory} />} />
          <Route path="/lab/*" element={<RoleRoutes Dashboard={LabDashboard} HistoryComponent={LaboratoriesHistory} />} />
          
          {/* School/Dean Route */}
          <Route path="/school/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="dashboard" element={<SchoolDashboard />} />
                <Route path="history" element={<SchoolHistory />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Root and Student Routes */}
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