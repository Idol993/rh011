import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  User,
  Building2,
  CheckCircle2,
  Circle,
  CircleDot,
  SkipForward,
  AlertTriangle,
  AlertCircle,
  FileText,
  CalendarDays,
  ArrowRight,
  Eye,
  X,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Application, FlowNode, FlowNodeStatus, WarningLevel } from '@/types';

export default function Monitor() {
  const applications = useAppStore((state) => state.applications);
  const warnings = useAppStore((state) => state.warnings);

  const [searchText, setSearchText] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filteredApps = useMemo(() => {
    if (!searchText.trim()) return applications.slice(0, 20);
    return applications.filter(
      (app) =>
        app.caseNo.toLowerCase().includes(searchText.toLowerCase()) ||
        app.serviceItemName.toLowerCase().includes(searchText.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchText.toLowerCase())
    ).slice(0, 20);
  }, [applications, searchText]);

  const getNodeStatusInfo = (status: FlowNodeStatus) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-500/10', label: '已完成' };
      case 'processing':
        return { icon: CircleDot, color: 'text-primary-600', bg: 'bg-primary-500/10', label: '处理中' };
      case 'pending':
        return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100', label: '待处理' };
      case 'skipped':
        return { icon: SkipForward, color: 'text-gray-400', bg: 'bg-gray-100', label: '跳过' };
    }
  };

  const getWarningBadge = (level?: WarningLevel) => {
    if (!level || level === 'none') return null;
    if (level === 'yellow') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-yellow/10 text-warning-yellow text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          黄牌
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-red/10 text-warning-red text-xs font-medium">
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-red opacity-75" />
          <span className="relative inline-flex rounded-full w-2 h-2 bg-warning-red" />
        </span>
        红牌
      </span>
    );
  };

  const isNodeAbnormal = (node: FlowNode) => {
    if (node.status === 'processing' && selectedApp) {
      const warning = warnings.find((w) => w.applicationId === selectedApp.id);
      if (warning && (warning.level === 'red' || warning.level === 'yellow')) {
        return true;
      }
    }
    return false;
  };

  const getStatusText = (status: Application['status']) => {
    const map: Record<Application['status'], string> = {
      draft: '草稿',
      submitted: '已提交',
      prechecking: '预审中',
      pending: '待处理',
      reviewing: '审核中',
      approved: '已批准',
      rejected: '已驳回',
      completed: '已完成',
    };
    return map[status];
  };

  const getStatusColor = (status: Application['status']) => {
    const map: Record<Application['status'], string> = {
      draft: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-600',
      prechecking: 'bg-purple-100 text-purple-600',
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-orange-100 text-orange-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
      completed: 'bg-emerald-100 text-emerald-600',
    };
    return map[status];
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">办件全程监控</h1>
          <p className="text-gray-500 mt-1">实时查看办件进度、流程节点与操作日志</p>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索办件号、事项名称、申请人..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">共 {applications.length} 条办件记录</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredApps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedApp?.id === app.id ? 'bg-primary-50/70' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-900 font-medium">{app.caseNo}</span>
                          {getWarningBadge(app.warningLevel)}
                        </div>
                        <p className="text-sm text-gray-700 mt-1 truncate">{app.serviceItemName}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {app.applicantName}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {app.createdAt.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div
                key={selectedApp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50/50 to-transparent">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">{selectedApp.serviceItemName}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedApp.status)}`}>
                          {getStatusText(selectedApp.status)}
                        </span>
                        {getWarningBadge(selectedApp.warningLevel)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1 font-mono">
                          <FileText className="w-4 h-4" />
                          {selectedApp.caseNo}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selectedApp.applicantName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {selectedApp.assignees.map((a) => a.department).filter(Boolean).join(' / ') || '-'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600" />
                        流程时间轴
                      </h3>
                      <div className="relative pl-2">
                        {selectedApp.flowNodes.map((node, index) => {
                          const statusInfo = getNodeStatusInfo(node.status);
                          const abnormal = isNodeAbnormal(node);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <div key={node.id} className="relative pb-8 last:pb-0">
                              {index < selectedApp.flowNodes.length - 1 && (
                                <div
                                  className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-16px)] ${
                                    node.status === 'completed' ? 'bg-success-500' : 'bg-gray-200'
                                  }`}
                                />
                              )}
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative flex gap-4 ${abnormal ? 'animate-pulse-slow' : ''}`}
                              >
                                <div
                                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    abnormal ? 'bg-warning-red/10 ring-4 ring-warning-red/20' : statusInfo.bg
                                  }`}
                                >
                                  <StatusIcon
                                    className={`w-4 h-4 ${abnormal ? 'text-warning-red' : statusInfo.color}`}
                                  />
                                </div>
                                <div className="flex-1 pb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`font-medium ${abnormal ? 'text-warning-red' : 'text-gray-900'}`}>
                                      {node.name}
                                    </h4>
                                    {node.type === 'parallel' && (
                                      <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-[10px] font-medium">
                                        并联
                                      </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${statusInfo.bg} ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                    {abnormal && (
                                      <span className="flex items-center gap-1 text-xs text-warning-red font-medium">
                                        <AlertCircle className="w-3 h-3" />
                                        异常超时
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                    {node.assigneeName && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {node.assigneeName}
                                      </span>
                                    )}
                                    {node.startedAt && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {node.startedAt}
                                        {node.completedAt && (
                                          <>
                                            <ChevronRight className="w-3 h-3" />
                                            {node.completedAt}
                                          </>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  {node.comment && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                      <div className="flex items-start gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">{node.comment}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-600" />
                        节点操作日志
                      </h3>
                      <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                        {selectedApp.flowNodes
                          .filter((n) => n.status === 'completed' || n.status === 'processing')
                          .map((node, index) => (
                            <div key={node.id} className="px-4 py-3 flex items-start gap-3">
                              <div className="flex flex-col items-center pt-1">
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                {index < selectedApp.flowNodes.filter((n) => n.status === 'completed' || n.status === 'processing').length - 1 && (
                                  <div className="w-px flex-1 bg-gray-200 mt-1" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pb-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-800">{node.name}</p>
                                  <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {node.completedAt || node.startedAt}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {node.assigneeName ? `${node.assigneeName} 操作` : '系统自动处理'}
                                </p>
                                {node.comment && (
                                  <p className="text-xs text-gray-600 mt-1 bg-white px-2 py-1.5 rounded border border-gray-100">
                                    {node.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                  <ArrowRight className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">选择办件查看详情</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  在左侧列表中选择一个办件，即可查看完整的流程时间轴与操作日志
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
