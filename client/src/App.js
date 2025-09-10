import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingRedirect from './components/OnboardingRedirect';
import Navbar from './components/Navbar';
import OnboardingWizard from './components/OnboardingWizard';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
// Dashboard components removed - redirecting to Profile instead
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import UniversitySearchPage from './pages/UniversitySearchPage';
import UniversityDetails from './components/UniversityDetails';
import ApplicationForm from './components/ApplicationForm';
import ApplicationProgress from './components/ApplicationProgress';
import FinderPage from './pages/FinderPage';
import BudgetPlanner from './components/BudgetPlanner';
import DeadlineTracker from './components/DeadlineTracker';
import ResourceLibrary from './pages/ResourceLibrary';
import Community from './pages/Community';
import DiscussionDetail from './pages/DiscussionDetail';
// Admin Dashboard Components
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UniversityManagement from './pages/UniversityManagement';
import ScholarshipManagement from './pages/ScholarshipManagement';
import ApplicationManagement from './pages/ApplicationManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={<Navigate to="/profile" replace />}
              />
              <Route 
                path="/student-dashboard" 
                element={<Navigate to="/profile" replace />}
              />

              <Route 
                path="/admin-dashboard" 
                element={<Navigate to="/admin" replace />}
              />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <OnboardingWizard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ProfileEdit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/universities" 
                element={<UniversitySearchPage />} 
              />
              <Route 
                path="/universities/:id" 
                element={<UniversityDetails />} 
              />
              <Route 
                path="/apply/:universityId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/application-progress/:applicationId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationProgress />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/finder" 
                element={<FinderPage />} 
              />
              <Route 
                path="/scholarships" 
                element={<FinderPage />} 
              />
              <Route 
                path="/budget" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <BudgetPlanner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deadlines" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DeadlineTracker />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resources" 
                element={<ResourceLibrary />} 
              />
              <Route 
                path="/community" 
                element={<Community />} 
              />
              <Route 
                path="/community/discussion/:topicId" 
                element={<DiscussionDetail />} 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="universities" element={<UniversityManagement />} />
                <Route path="scholarships" element={<ScholarshipManagement />} />
                <Route path="applications" element={<ApplicationManagement />} />
              </Route>
              

              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

// Dashboard components removed - all users now redirect to Profile page

export default App;