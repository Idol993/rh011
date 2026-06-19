import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  FileText,
  Clock,
  User,
  CalendarDays,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Application, ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusFilters: { key: ApplicationStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'prechecking', label: '预审中' },
  { key: 'pending', label: '办理中' },
  { key: 'completed', label: '已办结' },
  { key: 'rejected', label: '已驳回' },
];

const statusLabelMap: Record<ApplicationStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  prechecking: '预审中',
  pending: '办理中',
  reviewing: '审核中',
  approved: '已批准',
  rejected: '已驳回',
  completed: '已办结',
};

const statusColorMap: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-50 text-blue-600',
  prechecking: 'bg-purple-50 text-purple-600',
  pending: 'bg-amber-50 text-amber-600',
  reviewing: 'bg-indigo-50 text-indigo-600',
  approved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getRemainingDays = (deadline: string) => {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function CitizenApplications() {
  const { applications } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | 'all'>('all');

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchStatus = activeFilter === 'all' || app.status === activeFilter;
        const matchSearch =
          !searchText ||
          app.caseNo.toLowerCase().includes(searchText.toLowerCase()) ||
          app.serviceItemName.toLowerCase().includes(searchText.toLowerCase());
        return matchStatus && matchSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [applications, activeFilter, searchText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-primary-700">我的办件</h1>
          <p className="mt-1 text-gray-500">查看您提交的所有政务服务办件进度</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl bg-white p-4 shadow-gov"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索办件号或事项名称..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <motion.button
                    key={filter.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all',
                      activeFilter === filter.key
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredApplications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-white p-16 text-center shadow-gov"
            >
              <ClipboardList className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600">暂无匹配的办件</h3>
              <p className="mt-2 text-sm text-gray-400">
                {searchText || activeFilter !== 'all'
                  ? '请尝试调整搜索条件或筛选状态'
                  : '您还没有提交过办件申请'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredApplications.map((app: Application) => {
                const remainingDays = getRemainingDays(app.deadline);
                return (
                  <motion.div
                    key={app.id}
                    variants={cardVariants}
                    whileHover={{ y: -4, scale: 1.005 }}
                    className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-gov transition-shadow hover:shadow-gov-hover"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={cn(
                              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
                              app.status === 'rejected'
                                ? 'bg-red-100 text-red-600'
                                : app.status === 'completed' || app.status === 'approved'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-primary-100 text-primary-600'
                            )}
                          >
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                              {app.serviceItemName}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FileText className="mr-1 h-4 w-4" />
                                办件号：{app.caseNo}
                              </span>
                              <span className="flex items-center">
                                <User className="mr-1 h-4 w-4" />
                                {app.applicantName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={cn(
                              'rounded-full px-4 py-1.5 text-sm font-medium',
                              statusColorMap[app.status]
                            )}
                          >
                            {statusLabelMap[app.status]}
                          </span>
                          {app.warningLevel && app.warningLevel !== 'none' && (
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [1, 0.8, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className={cn(
                                'flex items-center rounded-full px-3 py-1 text-xs font-medium',
                                app.warningLevel === 'red'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-amber-100 text-amber-600'
                              )}
                            >
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {app.warningLevel === 'red' ? '红牌预警' : '黄牌预警'}
                            </motion.div>
                          )}
                          <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          申请时间：{app.createdAt}
                        </div>
                        {remainingDays !== null && remainingDays > 0 && app.status !== 'completed' && app.status !== 'rejected' && (
                          <div
                            className={cn(
                              'flex items-center',
                              remainingDays <= 1
                                ? 'text-red-600'
                                : remainingDays <= 3
                                ? 'text-amber-600'
                                : 'text-gray-500'
                            )}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            剩余 {remainingDays} 天
                          </div>
                        )}
                        {app.parallelGroups && app.parallelGroups.length > 0 && (
                          <div className="flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                            并联审批 · {app.parallelGroups.length} 组并行
                          </div>
                        )}
                      </div>

                      {app.assignees.length > 0 && (
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <span className="mr-2">办理部门：</span>
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(app.assignees.map((a) => a.department))].map((dept, i) => (
                              <span
                                key={i}
                                className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            共 {filteredApplications.length} 条办件记录
          </motion.div>
        )}
      </div>
    </div>
  );
}
