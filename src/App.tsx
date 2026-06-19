import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import { useAppStore } from '@/store';

import CitizenHome from '@/pages/citizen/Home';
import CitizenApply from '@/pages/citizen/Apply';
import CitizenApplications from '@/pages/citizen/Applications';
import CitizenApplicationDetail from '@/pages/citizen/ApplicationDetail';
import CitizenReview from '@/pages/citizen/Review';
import CitizenCertificates from '@/pages/citizen/Certificates';

import WorkbenchHome from '@/pages/workbench/Home';
import WorkbenchCases from '@/pages/workbench/Cases';
import WorkbenchCaseDetail from '@/pages/workbench/CaseDetail';
import WorkbenchParallel from '@/pages/workbench/Parallel';

import SupervisorHome from '@/pages/supervisor/Home';
import SupervisorWarnings from '@/pages/supervisor/Warnings';
import SupervisorMonitor from '@/pages/supervisor/Monitor';
import SupervisorPerformance from '@/pages/supervisor/Performance';

import KioskHome from '@/pages/kiosk/Home';
import KioskPrint from '@/pages/kiosk/Print';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const currentUser = useAppStore((state) => state.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'citizen':
          navigate('/citizen', { replace: true });
          break;
        case 'clerk':
        case 'manager':
          navigate('/workbench', { replace: true });
          break;
        case 'supervisor':
          navigate('/supervisor', { replace: true });
          break;
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/kiosk" element={<KioskHome />} />
        <Route path="/kiosk/print" element={<KioskPrint />} />

        <Route path="/app/citizen" element={<Navigate to="/citizen" replace />} />
        <Route path="/app/citizen/apply" element={<Navigate to="/citizen/apply" replace />} />
        <Route path="/app/citizen/applications" element={<Navigate to="/citizen/applications" replace />} />
        <Route path="/app/citizen/applications/:id" element={<Navigate to="/citizen/applications/:id" replace />} />
        <Route path="/app/citizen/review/:id" element={<Navigate to="/citizen/review/:id" replace />} />
        <Route path="/app/citizen/certificates" element={<Navigate to="/citizen/certificates" replace />} />
        <Route path="/app/workbench" element={<Navigate to="/workbench" replace />} />
        <Route path="/app/workbench/cases" element={<Navigate to="/workbench/cases" replace />} />
        <Route path="/app/workbench/cases/:id" element={<Navigate to="/workbench/cases/:id" replace />} />
        <Route path="/app/workbench/parallel" element={<Navigate to="/workbench/parallel" replace />} />
        <Route path="/app/supervisor" element={<Navigate to="/supervisor" replace />} />
        <Route path="/app/supervisor/warnings" element={<Navigate to="/supervisor/warnings" replace />} />
        <Route path="/app/supervisor/monitor" element={<Navigate to="/supervisor/monitor" replace />} />
        <Route path="/app/supervisor/performance" element={<Navigate to="/supervisor/performance" replace />} />
        <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/app/kiosk" element={<Navigate to="/kiosk" replace />} />
        <Route path="/app/kiosk/print" element={<Navigate to="/kiosk/print" replace />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<RoleRedirect />} />

          <Route path="citizen">
            <Route index element={<CitizenHome />} />
            <Route path="apply" element={<CitizenApply />} />
            <Route path="applications">
              <Route index element={<CitizenApplications />} />
              <Route path=":id" element={<CitizenApplicationDetail />} />
            </Route>
            <Route path="review/:id" element={<CitizenReview />} />
            <Route path="certificates" element={<CitizenCertificates />} />
          </Route>

          <Route path="workbench">
            <Route index element={<WorkbenchHome />} />
            <Route path="cases">
              <Route index element={<WorkbenchCases />} />
              <Route path=":id" element={<WorkbenchCaseDetail />} />
            </Route>
            <Route path="parallel" element={<WorkbenchParallel />} />
          </Route>

          <Route path="supervisor">
            <Route index element={<SupervisorHome />} />
            <Route path="warnings" element={<SupervisorWarnings />} />
            <Route path="monitor" element={<SupervisorMonitor />} />
            <Route path="performance" element={<SupervisorPerformance />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
