import { useAppStore } from '@/store';
import type { Application, ApplicationStatus, WarningLevel, Department } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Building2,
  ListFilter,
  Clock,
  User,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | ApplicationStatus;

interface StatusFilterOption {
  key: FilterStatus;
  label: string;
  color: string;
  bgColor: string;
}

const statusFilters: StatusFilterOption[] = [
  { key: 'all', label: '全部', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { key: 'submitted', label: '待受理', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { key: 'reviewing', label: '审核中', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  { key: 'pending', label: '待签发', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { key: 'completed', label: '已完成', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  { key: 'rejected', label: '已驳回', color: 'text-red-700', bgColor: 'bg-red-100' },
];

const statusDisplay: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  submitted: { label: '待受理', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  prechecking: { label: '预审中', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  pending: { label: '待签发', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  reviewing: { label: '审核中', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  approved: { label: '已通过', className: 'bg-green-50 text-green-700 border-green-200' },
  making: { label: '待制证', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  rejected: { label: '已驳回', className: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: '已完成', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const mockDepartments: Department[] = [
  { id: 'all', name: '全部部门', code: 'ALL' },
  { id: 'd001', name: '市场监督管理局', code: 'SCJGJ' },
  { id: 'd002', name: '人力资源和社会保障局', code: 'RSJ' },
  { id: 'd003', name: '自然资源和规划局', code: 'ZRZYJ' },
  { id: 'd004', name: '住房和城乡建设局', code: 'ZJJ' },
  { id: 'd005', name: '卫生健康委员会', code: 'WJW' },
  { id: 'd006', name: '公安局', code: 'GAJ' },
  { id: 'd007', name: '税务局', code: 'SWJ' },
  { id: 'd008', name: '教育局', code: 'JYJ' },
];

function WarningIndicator({ level }: { level: WarningLevel }) {
  if (level === 'none') {
    return <span className="text-xs text-gray-400">正常</span>;
  }
  const isRed = level === 'red';
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        isRed
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      )}
    >
      {isRed ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {isRed ? '红牌' : '黄牌'}
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

function getDepartment(app: Application): string {
  if (app.assignees && app.assignees.length > 0 && app.assignees[0].department) {
    return app.assignees[0].department;
  }
  return '其他部门';
}

export default function Cases() {
  const navigate = useNavigate();
  const { applications } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (deptFilter !== 'all') {
        const dept = mockDepartments.find((d) => d.id === deptFilter);
        if (dept && getDepartment(app) !== dept.name) return false;
      }
      if (searchText) {
        const keyword = searchText.toLowerCase();
        const appText = `${app.caseNo} ${app.serviceItemName} ${app.applicantName}`.toLowerCase();
        if (!appText.includes(keyword)) return false;
      }
      return true;
    });
  }, [applications, statusFilter, deptFilter, searchText]);

  const handleViewDetail = (id: string) => {
    navigate(`/workbench/cases/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50">
      <div className="max-w-[1600px] mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">办件列表</h1>
            <p className="text-gray-500 mt-1">共 {filteredApplications.length} 条记录</p>
          </div>
          <button
            onClick={() => navigate('/workbench')}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            返回工作台 <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </motion.div>

        <div className="flex gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-56 flex-shrink-0"
          >
            <div className="bg-white rounded-xl shadow-gov border border-primary-100 p-4 sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <Filter className="w-4 h-4 text-primary-600" />
                <span className="font-semibold text-gray-800">状态筛选</span>
              </div>
              <div className="space-y-1">
                {statusFilters.map((item) => {
                  const count =
                    item.key === 'all'
                      ? applications.length
                      : applications.filter((a) => a.status === item.key).length;
                  const active = statusFilter === item.key;
                  return (
                    <motion.button
                      key={item.key}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStatusFilter(item.key)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all',
                        active
                          ? 'bg-primary-50 text-primary-700 font-medium border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <ListFilter className="w-4 h-4" />
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[280px] max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="搜索办件号、事项名称、申请人..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  />
                </div>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white appearance-none cursor-pointer"
                  >
                    {mockDepartments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-primary-50/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        办件号
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        事项名称
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        申请人
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        申请时间
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        剩余天数
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        预警级别
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400">暂无符合条件的办件</p>
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app, index) => {
                          const remaining = calcRemainingDays(app.deadline);
                          return (
                            <motion.tr
                              key={app.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="hover:bg-primary-50/40 transition-colors"
                            >
                              <td className="px-5 py-4">
                                <span className="text-sm font-mono text-gray-700">{app.caseNo}</span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-900 font-medium truncate max-w-[220px]">
                                    {app.serviceItemName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{app.applicantName}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm text-gray-600">{app.createdAt}</span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1">
                                  <Clock
                                    className={cn(
                                      'w-4 h-4',
                                      remaining <= 0
                                        ? 'text-red-500'
                                        : remaining <= 2
                                        ? 'text-amber-500'
                                        : 'text-gray-400'
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      'text-sm font-medium',
                                      remaining <= 0
                                        ? 'text-red-600'
                                        : remaining <= 2
                                        ? 'text-amber-600'
                                        : 'text-gray-600'
                                    )}
                                  >
                                    {remaining > 0 ? `${remaining} 天` : '已超时'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <WarningIndicator level={app.warningLevel || 'none'} />
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                                    statusDisplay[app.status]?.className
                                  )}
                                >
                                  {statusDisplay[app.status]?.label}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewDetail(app.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  详情
                                </motion.button>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
