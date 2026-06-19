import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import { useAppStore } from '@/store';
import WorkbenchHome from '@/pages/workbench/Home';
import WorkbenchCases from '@/pages/workbench/Cases';
import WorkbenchCaseDetail from '@/pages/workbench/CaseDetail';
import WorkbenchParallel from '@/pages/workbench/Parallel';

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl border border-slate-200/60"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">一网通办</h1>
          <p className="text-slate-500 mt-1">智能审批系统登录</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">用户名</label>
            <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="请输入用户名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
            <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="请输入密码" />
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
            登录
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CitizenHome() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">市民首页</h1><p className="text-slate-500 mt-2">Citizen Home</p></div>;
}

function CitizenApply() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">在线申请</h1><p className="text-slate-500 mt-2">Online Apply</p></div>;
}

function CitizenApplications() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">我的办件</h1><p className="text-slate-500 mt-2">My Applications</p></div>;
}

function CitizenApplicationDetail() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">办件详情</h1><p className="text-slate-500 mt-2">Application Detail</p></div>;
}

function CitizenReview() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">办件评价</h1><p className="text-slate-500 mt-2">Application Review</p></div>;
}

function CitizenCertificates() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">电子证照</h1><p className="text-slate-500 mt-2">Certificates</p></div>;
}

function SupervisorHome() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">监察首页</h1><p className="text-slate-500 mt-2">Supervisor Home</p></div>;
}

function SupervisorWarnings() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">预警中心</h1><p className="text-slate-500 mt-2">Warning Center</p></div>;
}

function SupervisorMonitor() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">全程监控</h1><p className="text-slate-500 mt-2">Process Monitor</p></div>;
}

function SupervisorPerformance() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">绩效统计</h1><p className="text-slate-500 mt-2">Performance Statistics</p></div>;
}

function KioskHome() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">自助终端</h1><p className="text-slate-500 mt-2">Self-Service Kiosk</p></div>;
}

function KioskPrint() {
  return <div className="text-center py-20"><h1 className="text-2xl font-bold text-slate-900">证照打印</h1><p className="text-slate-500 mt-2">Certificate Print</p></div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />

        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/citizen" replace />} />

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

          <Route path="kiosk">
            <Route index element={<KioskHome />} />
            <Route path="print" element={<KioskPrint />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
