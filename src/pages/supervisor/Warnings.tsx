import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Filter,
  Search,
  X,
  MessageSquare,
  Calendar,
  Building2,
  User,
  ChevronDown,
  Send,
  Clock,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Warning, WarningLevelType, WarningStatus } from '@/types';

export default function Warnings() {
  const warnings = useAppStore((state) => state.warnings);
  const handleWarning = useAppStore((state) => state.handleWarning);
  const applications = useAppStore((state) => state.applications);
  const currentUser = useAppStore((state) => state.currentUser);

  const [levelFilter, setLevelFilter] = useState<'all' | WarningLevelType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | WarningStatus>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [handleComment, setHandleComment] = useState('');

  const departments = useMemo(() => {
    const depts = new Set(warnings.map((w) => w.department));
    return Array.from(depts);
  }, [warnings]);

  const filteredWarnings = useMemo(() => {
    return warnings.filter((w) => {
      if (levelFilter !== 'all' && w.level !== levelFilter) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (deptFilter !== 'all' && w.department !== deptFilter) return false;
      if (searchText && !w.caseNo.toLowerCase().includes(searchText.toLowerCase()) &&
          !w.assigneeName.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [warnings, levelFilter, statusFilter, deptFilter, searchText]);

  const getApplicationForWarning = (warningId: string) => {
    const warning = warnings.find((w) => w.id === warningId);
    if (!warning) return null;
    return applications.find((a) => a.id === warning.applicationId);
  };

  const levelLabel = (level: WarningLevelType | 'all') => {
    if (level === 'all') return '全部级别';
    return level === 'yellow' ? '黄牌' : '红牌';
  };

  const statusLabel = (status: WarningStatus | 'all') => {
    if (status === 'all') return '全部状态';
    if (status === 'pending') return '待处置';
    if (status === 'handled') return '处置中';
    return '已关闭';
  };

  const handleSubmit = () => {
    if (!selectedWarning || !handleComment.trim()) return;
    handleWarning(selectedWarning.id, currentUser?.name || '监察员', handleComment.trim());
    setSelectedWarning(null);
    setHandleComment('');
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">红黄牌预警中心</h1>
          <p className="text-gray-500 mt-1">督办处置办件超时预警</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索办件号、责任人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowLevelDropdown(!showLevelDropdown); setShowStatusDropdown(false); setShowDeptDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              <span>{levelLabel(levelFilter)}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            <AnimatePresence>
              {showLevelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-20"
                >
                  {(['all', 'yellow', 'red'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => { setLevelFilter(level); setShowLevelDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      {level === 'yellow' && <AlertTriangle className="w-4 h-4 text-warning-yellow" />}
                      {level === 'red' && <AlertCircle className="w-4 h-4 text-warning-red" />}
                      {levelLabel(level)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowLevelDropdown(false); setShowDeptDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{statusLabel(statusFilter)}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-20"
                >
                  {(['all', 'pending', 'handled', 'closed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {statusLabel(status)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowDeptDropdown(!showDeptDropdown); setShowLevelDropdown(false); setShowStatusDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Building2 className="w-4 h-4 text-gray-500" />
              <span>{deptFilter === 'all' ? '全部部门' : deptFilter}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            <AnimatePresence>
              {showDeptDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-h-60 overflow-y-auto z-20"
                >
                  <button
                    onClick={() => { setDeptFilter('all'); setShowDeptDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    全部部门
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => { setDeptFilter(dept); setShowDeptDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {dept}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-warning-yellow" />
              黄牌: {warnings.filter((w) => w.level === 'yellow').length}
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-warning-red" />
              红牌: {warnings.filter((w) => w.level === 'red').length}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">办件号</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">事项</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">级别</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">超时天数</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">责任人</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">部门</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredWarnings.map((warning, index) => {
                  const app = getApplicationForWarning(warning.id);
                  return (
                    <motion.tr
                      key={warning.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{warning.caseNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                        {app?.serviceItemName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {warning.level === 'yellow' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-yellow/10 text-warning-yellow text-sm font-medium">
                            <span className="relative flex w-2 h-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-yellow opacity-75" />
                              <span className="relative inline-flex rounded-full w-2 h-2 bg-warning-yellow" />
                            </span>
                            黄牌
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-red/10 text-warning-red text-sm font-medium">
                            <span className="relative flex w-2 h-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-red opacity-75" />
                              <span className="relative inline-flex rounded-full w-2 h-2 bg-warning-red" />
                            </span>
                            红牌
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {warning.overDays > 0 ? (
                          <span className={`text-sm font-semibold ${warning.overDays > 5 ? 'text-warning-red' : 'text-warning-yellow'}`}>
                            {warning.overDays} 天
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">临期</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                            {warning.assigneeName.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{warning.assigneeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{warning.department}</td>
                      <td className="px-6 py-4">
                        {warning.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-yellow/15 text-warning-yellow text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            待处置
                          </span>
                        )}
                        {warning.status === 'handled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-600 text-xs font-medium">
                            <MessageSquare className="w-3 h-3" />
                            处置中
                          </span>
                        )}
                        {warning.status === 'closed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-500/15 text-success-500 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            已关闭
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {warning.status !== 'closed' && (
                          <button
                            onClick={() => setSelectedWarning(warning)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            处置
                          </button>
                        )}
                        {warning.status === 'closed' && warning.handleComment && (
                          <button
                            onClick={() => setSelectedWarning(warning)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            查看
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredWarnings.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Ban className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无符合条件的预警记录</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => { setSelectedWarning(null); setHandleComment(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedWarning.level === 'yellow' ? (
                    <div className="w-10 h-10 rounded-xl bg-warning-yellow/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-warning-yellow" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-warning-red/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-warning-red" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedWarning.level === 'yellow' ? '黄牌' : '红牌'}预警处置
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{selectedWarning.caseNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedWarning(null); setHandleComment(''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> 责任人
                    </p>
                    <p className="text-gray-900 font-medium">{selectedWarning.assigneeName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> 责任部门
                    </p>
                    <p className="text-gray-900 font-medium">{selectedWarning.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> 触发时间
                    </p>
                    <p className="text-gray-900 font-medium">{selectedWarning.triggeredAt}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 截止期限
                    </p>
                    <p className={`font-medium ${selectedWarning.overDays > 0 ? 'text-warning-red' : 'text-gray-900'}`}>
                      {selectedWarning.deadline}
                    </p>
                  </div>
                </div>

                {selectedWarning.handleComment && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedWarning.handler} 于 {selectedWarning.handledAt} 处置：
                    </p>
                    <p className="text-sm text-gray-700">{selectedWarning.handleComment}</p>
                  </div>
                )}

                {selectedWarning.status !== 'closed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      处理意见
                    </label>
                    <textarea
                      value={handleComment}
                      onChange={(e) => setHandleComment(e.target.value)}
                      rows={4}
                      placeholder="请输入督办处置意见..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
                    />
                  </div>
                )}
              </div>

              {selectedWarning.status !== 'closed' && (
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                  <button
                    onClick={() => { setSelectedWarning(null); setHandleComment(''); }}
                    className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!handleComment.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    提交处置
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
