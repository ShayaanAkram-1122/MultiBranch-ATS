import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Public pages
import Home       from './pages/public/Home';
import Jobs       from './pages/public/Jobs';
import Login      from './pages/public/Login';
import Register   from './pages/public/Register';
import JobDetails from './pages/public/JobDetails';

// Applicant pages
import ApplicantDashboard from './pages/applicant/Dashboard';
import MyApplications     from './pages/applicant/MyApplications';
import Profile            from './pages/applicant/Profile';
import ApplyJob           from './pages/applicant/ApplyJob';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminJobs      from './pages/admin/Jobs';
import AdminApplicants from './pages/admin/Applicants';
import AdminInterviews from './pages/admin/Interviews';
import AdminBranches   from './pages/admin/Branches';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"          element={<Home />} />
          <Route path="/jobs"      element={<Jobs />} />
          <Route path="/jobs/:id"  element={<JobDetails />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />

          {/* ── Applicant (protected) ── */}
          <Route path="/applicant/dashboard"
            element={<ProtectedRoute role="applicant"><ApplicantDashboard /></ProtectedRoute>} />
          <Route path="/applicant/applications"
            element={<ProtectedRoute role="applicant"><MyApplications /></ProtectedRoute>} />
          <Route path="/applicant/profile"
            element={<ProtectedRoute role="applicant"><Profile /></ProtectedRoute>} />
          <Route path="/applicant/apply/:jobId"
            element={<ProtectedRoute role="applicant"><ApplyJob /></ProtectedRoute>} />

          {/* ── Admin (protected) ── */}
          <Route path="/admin/dashboard"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/jobs"
            element={<ProtectedRoute role="admin"><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/applicants"
            element={<ProtectedRoute role="admin"><AdminApplicants /></ProtectedRoute>} />
          <Route path="/admin/interviews"
            element={<ProtectedRoute role="admin"><AdminInterviews /></ProtectedRoute>} />
          <Route path="/admin/branches"
            element={<ProtectedRoute role="admin"><AdminBranches /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
