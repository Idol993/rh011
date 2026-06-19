import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  FileWarning,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAppStore } from '@/store';
import { Warning } from '@/types';

export default function SupervisorHome() {
  const warnings = useAppStore((state) => state.warnings);
  const applications = useAppStore((state) => state.applications);

  const stats = useMemo(() => {
    const yellowCount = warnings.filter((w) => w.level === 'yellow' && w.status !== 'closed').length;
    const redCount = warnings.filter((w) => w.level === 'red' && w.status !== 'closed').length;
    const handledCount = warnings.filter((w) => w.status === 'handled' || w.status === 'closed').length;
    return { yellowCount, redCount, handledCount };
  }, [warnings]);

  const deptAvgDays = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number }>();
    applications.forEach((app) => {
      if (app.status === 'completed' && app.flowNodes.length > 0) {
        const firstNode = app.flowNodes[0].startedAt;
        const lastNode = app.flowNodes[app.flowNodes.length - 1].completedAt;
        if (firstNode && lastNode) {
          const days = Math.ceil(
            (new Date(lastNode).getTime() - new Date(firstNode).getTime()) / (1000 * 60 * 60 * 24)
          );
          app.assignees.forEach((assignee) => {
            if (assignee.department) {
              const current = deptMap.get(assignee.department) || { total: 0, count: 0 };
              deptMap.set(assignee.department, { total: current.total + days, count: current.count + 1 });
            }
          });
        }
      }
    });
    return Array.from(deptMap.entries())
      .map(([dept, data]) => ({
        dept: dept.replace('局', '').replace('委员会', '委').replace('和', ''),
        avgDays: Math.round((data.total / data.count) * 10) / 10,
      }))
      .slice(0, 8);
  }, [applications]);

  const recentWarnings = useMemo(() => {
    return [...warnings]
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
      .slice(0, 5);
  }, [warnings]);

  const statCards = [
    {
      title: '黄牌预警',
      value: stats.yellowCount,
      icon: AlertTriangle,
      color: 'from-warning-yellow to-orange-400',
      bgColor: 'bg-warning-yellow/10',
      textColor: 'text-warning-yellow',
      borderColor: 'border-warning-yellow/30',
    },
    {
      title: '红牌预警',
      value: stats.redCount,
      icon: AlertCircle,
      color: 'from-warning-red to-rose-500',
      bgColor: 'bg-warning-red/10',
      textColor: 'text-warning-red',
      borderColor: 'border-warning-red/30',
    },
    {
      title: '已处置',
      value: stats.handledCount,
      icon: CheckCircle2,
      color: 'from-success-500 to-emerald-400',
      bgColor: 'bg-success-500/10',
      textColor: 'text-success-500',
      borderColor: 'border-success-500/30',
    },
    {
      title: '办件总数',
      value: applications.length,
      icon: FileWarning,
      color: 'from-primary-500 to-cyan-400',
      bgColor: 'bg-primary-500/10',
      textColor: 'text-primary-600',
      borderColor: 'border-primary-500/30',
    },
  ];

  const getWarningStatusBadge = (warning: Warning) => {
    switch (warning.status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-warning-yellow/20 text-warning-yellow">
            待处置
          </span>
        );
      case 'handled':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-primary-500/20 text-primary-600">
            处置中
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-success-500/20 text-success-500">
            已关闭
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">监察中心</h1>
          <p className="text-gray-500 mt-1">实时监控办件时效与预警处置</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>数据更新于 {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-xl border ${card.borderColor} ${card.bgColor} p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-60`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">各部门平均办结时长</h2>
            </div>
            <span className="text-xs text-gray-400">单位：工作日</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAvgDays} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dept"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [`${value} 天`, '平均时长']}
                />
                <Bar dataKey="avgDays" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {deptAvgDays.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.avgDays > 6 ? '#E53935' : entry.avgDays > 4 ? '#FB8C00' : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">近期预警</h2>
            </div>
            <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentWarnings.map((warning) => (
              <motion.div
                key={warning.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          warning.level === 'red' ? 'bg-warning-red animate-pulse' : 'bg-warning-yellow'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {warning.caseNo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{warning.department}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      责任人：{warning.assigneeName}
                    </p>
                  </div>
                  {getWarningStatusBadge(warning)}
                </div>
                {warning.overDays > 0 && (
                  <div className="mt-2 text-xs text-warning-red font-medium">
                    已超时 {warning.overDays} 天
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
