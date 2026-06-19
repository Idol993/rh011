import { useAppStore } from '@/store';
import type { Application, ParallelGroup, FlowNode, WarningLevel } from '@/types';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  Timer,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-600' },
  submitted: { label: '待受理', className: 'bg-blue-100 text-blue-700' },
  prechecking: { label: '预审中', className: 'bg-cyan-100 text-cyan-700' },
  pending: { label: '待签发', className: 'bg-amber-100 text-amber-700' },
  reviewing: { label: '审核中', className: 'bg-indigo-100 text-indigo-700' },
  approved: { label: '已通过', className: 'bg-green-100 text-green-700' },
  making: { label: '待制证', className: 'bg-orange-100 text-orange-700' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-700' },
  completed: { label: '已完成', className: 'bg-emerald-100 text-emerald-700' },
};

function WarningBadge({ level }: { level: WarningLevel }) {
  if (level === 'none') return null;

  const isRed = level === 'red';

  return (
    <motion.div
      animate={{
        opacity: [0.6, 1, 0.6],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        isRed
          ? 'bg-red-100 text-red-700 border border-red-200'
          : 'bg-amber-100 text-amber-700 border border-amber-200'
      )}
    >
      {isRed ? (
        <AlertCircle className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {isRed ? '红牌预警' : '黄牌预警'}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  delay = 0,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden bg-white rounded-xl shadow-gov p-6 card-hover-glow border border-primary-100"
    >
      <div
        className={cn(
          'absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-2xl',
          gradient
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{label}</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
            className="text-3xl font-bold text-gray-900 gradient-text-blue"
          >
            {value}
          </motion.p>
        </div>
        <div
          className={cn(
            'p-3 rounded-xl bg-gradient-to-br',
            gradient,
            'text-white shadow-lg'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

function calcRemainingDays(deadline: string): number {
  if (!deadline) return 0;
  const now = new Date();
  const d = new Date(deadline);
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getParallelProgress(app: Application): { group: ParallelGroup; percent: number }[] {
  if (!app.parallelGroups) return [];
  return app.parallelGroups.map((group) => {
    const nodes = app.flowNodes.filter((n) => n.parallelGroupId === group.id);
    if (nodes.length === 0) return { group, percent: 0 };
    const completed = nodes.filter(
      (n) => n.status === 'completed' || n.status === 'skipped'
    ).length;
    return { group, percent: Math.round((completed / nodes.length) * 100) };
  });
}

export default function Home() {
  const navigate = useNavigate();
  const { applications, currentUser } = useAppStore();

  const pendingCount = applications.filter(
    (a) => a.status === 'reviewing' || a.status === 'pending' || a.status === 'submitted' || a.status === 'prechecking'
  ).length;

  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = applications.filter((a) => {
    if (a.status !== 'completed' && a.status !== 'approved') return false;
    const lastNode = [...a.flowNodes].reverse().find((n) => n.completedAt);
    if (!lastNode) return false;
    return lastNode.completedAt.startsWith(today);
  }).length;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthCompleted = applications.filter((a) => {
    if (a.status !== 'completed' && a.status !== 'approved') return false;
    const lastNode = [...a.flowNodes].reverse().find((n) => n.completedAt);
    if (!lastNode) return false;
    return new Date(lastNode.completedAt) >= thisMonthStart;
  }).length;

  const completedApps = applications.filter(
    (a) => a.status === 'completed' || a.status === 'approved'
  );
  let avgDays = 0;
  if (completedApps.length > 0) {
    const totalDays = completedApps.reduce((sum, a) => {
      const lastNode = [...a.flowNodes].reverse().find((n) => n.completedAt);
      if (!lastNode) return sum;
      const start = new Date(a.createdAt);
      const end = new Date(lastNode.completedAt);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    avgDays = Math.round((totalDays / completedApps.length) * 10) / 10;
  }

  const pendingList = applications
    .filter((a) => a.warningLevel && a.warningLevel !== 'none')
    .sort((a, b) => {
      const order: Record<string, number> = { red: 0, yellow: 1, none: 2 };
      return order[a.warningLevel || 'none'] - order[b.warningLevel || 'none'];
    })
    .slice(0, 6);

  const parallelApps = applications.filter(
    (a) => a.parallelGroups && a.parallelGroups.length > 0 && a.status !== 'completed'
  );

  const handleRowClick = (id: string) => {
    navigate(`/workbench/cases/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              您好，{currentUser?.name || '用户'}
            </h1>
            <p className="text-gray-500 mt-1">
              今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/workbench/cases')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg shadow-lg hover:shadow-gov transition-all"
          >
            <FileText className="w-4 h-4" />
            全部办件
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Clock}
            label="待办办件"
            value={pendingCount}
            gradient="from-blue-500 to-primary-600"
            delay={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="今日已办"
            value={todayCompleted}
            gradient="from-emerald-500 to-green-600"
            delay={0.1}
          />
          <StatCard
            icon={CalendarCheck}
            label="本月办结"
            value={monthCompleted}
            gradient="from-cyan-500 to-teal-600"
            delay={0.2}
          />
          <StatCard
            icon={Timer}
            label="平均办理时长"
            value={`${avgDays} 天`}
            gradient="from-violet-500 to-indigo-600"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-transparent">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">预警办件</h2>
              </div>
              <button
                onClick={() => navigate('/workbench/cases')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingList.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
                  <p>暂无预警办件</p>
                </div>
              ) : (
                pendingList.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.08 }}
                    onClick={() => handleRowClick(app.id)}
                    className="px-6 py-4 hover:bg-primary-50/50 cursor-pointer transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {app.serviceItemName}
                        </span>
                        <WarningBadge level={app.warningLevel || 'none'} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>办件号：{app.caseNo}</span>
                        <span>申请人：{app.applicantName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          statusConfig[app.status]?.className
                        )}
                      >
                        {statusConfig[app.status]?.label}
                      </span>
                      <span
                        className={cn(
                          'text-xs',
                          calcRemainingDays(app.deadline) <= 0
                            ? 'text-red-600 font-medium'
                            : calcRemainingDays(app.deadline) <= 2
                            ? 'text-amber-600'
                            : 'text-gray-500'
                        )}
                      >
                        剩余 {calcRemainingDays(app.deadline)} 天
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-transparent">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">并联审批进度监控</h2>
              </div>
              <button
                onClick={() => navigate('/workbench/parallel')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                审批中心 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin">
              {parallelApps.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无进行中的并联审批</p>
                </div>
              ) : (
                parallelApps.map((app, idx) => {
                  const progressList = getParallelProgress(app);
                  const overallPercent =
                    progressList.length > 0
                      ? Math.round(
                          progressList.reduce((s, p) => s + p.percent, 0) / progressList.length
                        )
                      : 0;

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      onClick={() => handleRowClick(app.id)}
                      className="p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {app.serviceItemName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{app.caseNo}</p>
                        </div>
                        <div className="text-right ml-3">
                          <span className="text-xl font-bold gradient-text-blue">
                            {overallPercent}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallPercent}%` }}
                          transition={{ duration: 1, delay: 0.8 + idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        {progressList.map((p) => (
                          <div key={p.group.id} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                            <span className="text-xs text-gray-600 flex-1 truncate">
                              {p.group.name}
                            </span>
                            <span className="text-xs font-medium text-primary-600">
                              {p.percent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
