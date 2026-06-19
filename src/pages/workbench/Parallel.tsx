import { useAppStore } from '@/store';
import type { Application, FlowNode, ParallelGroup, FlowNodeStatus } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Circle,
  Bell,
  Clock,
  User,
  FileText,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const nodeStatusConfig: Record<FlowNodeStatus, { icon: typeof Circle; color: string; label: string; bg: string }> = {
  pending: { icon: Circle, color: 'text-gray-400', label: '待处理', bg: 'bg-gray-100' },
  processing: { icon: Loader2, color: 'text-primary-500', label: '处理中', bg: 'bg-primary-100' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: '已完成', bg: 'bg-green-100' },
  skipped: { icon: CheckCircle2, color: 'text-gray-400', label: '已跳过', bg: 'bg-gray-100' },
};

function getParallelNodes(app: Application): { group: ParallelGroup; nodes: FlowNode[]; percent: number; completedCount: number }[] {
  if (!app.parallelGroups) return [];
  return app.parallelGroups.map((group) => {
    const nodes = app.flowNodes.filter((n) => n.parallelGroupId === group.id);
    const completed = nodes.filter((n) => n.status === 'completed' || n.status === 'skipped').length;
    const percent = nodes.length > 0 ? Math.round((completed / nodes.length) * 100) : 0;
    return { group, nodes, percent, completedCount: completed };
  });
}

function getOverallProgress(app: Application): { percent: number; totalDepts: number; completedDepts: number } {
  const groups = getParallelNodes(app);
  if (groups.length === 0) return { percent: 0, totalDepts: 0, completedDepts: 0 };
  let total = 0;
  let completed = 0;
  groups.forEach((g) => {
    total += g.nodes.length;
    completed += g.completedCount;
  });
  return {
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalDepts: total,
    completedDepts: completed,
  };
}

function getPendingNodeIds(app: Application): string[] {
  const ids: string[] = [];
  if (!app.parallelGroups) return ids;
  app.parallelGroups.forEach((group) => {
    app.flowNodes
      .filter((n) => n.parallelGroupId === group.id && n.status === 'pending')
      .forEach((n) => ids.push(n.id));
  });
  return ids;
}

export default function Parallel() {
  const navigate = useNavigate();
  const { applications, addNotification, currentUser } = useAppStore();

  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [urgingIds, setUrgingIds] = useState<Set<string>>(new Set());

  const parallelApps = useMemo(() => {
    return applications.filter((a) => a.parallelGroups && a.parallelGroups.length > 0);
  }, [applications]);

  const toggleExpand = (appId: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const toggleSelectNode = (nodeId: string, appId: string) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      const key = `${appId}:${nodeId}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleSelectAllPending = (app: Application) => {
    const pendingNodeIds = getPendingNodeIds(app);
    const allSelected = pendingNodeIds.every((nid) => selectedNodes.has(`${app.id}:${nid}`));

    setSelectedNodes((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pendingNodeIds.forEach((nid) => next.delete(`${app.id}:${nid}`));
      } else {
        pendingNodeIds.forEach((nid) => next.add(`${app.id}:${nid}`));
      }
      return next;
    });
  };

  const handleUrge = async (appId: string, nodeIds: string[]) => {
    const app = applications.find((a) => a.id === appId);
    if (!app || !currentUser || nodeIds.length === 0) return;

    const keys = nodeIds.map((nid) => `${appId}:${nid}`);
    setUrgingIds((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });

    await new Promise((r) => setTimeout(r, 800));

    nodeIds.forEach((nid) => {
      const node = app.flowNodes.find((n) => n.id === nid);
      if (node && node.assignee) {
        addNotification({
          userId: node.assignee,
          type: 'inapp',
          title: '审批催促',
          content: `您有待处理的并联审批节点「${node.name}」（办件：${app.serviceItemName}），请尽快处理。`,
          relatedId: app.id,
        });
      }
    });

    setUrgingIds((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.delete(k));
      return next;
    });
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.delete(k));
      return next;
    });
  };

  const handleBatchUrge = async () => {
    if (selectedNodes.size === 0) return;
    const grouped = new Map<string, string[]>();
    selectedNodes.forEach((key) => {
      const [appId, nodeId] = key.split(':');
      if (!grouped.has(appId)) grouped.set(appId, []);
      grouped.get(appId)!.push(nodeId);
    });
    for (const [appId, nodeIds] of grouped) {
      await handleUrge(appId, nodeIds);
    }
  };

  const allPendingCount = parallelApps.reduce((sum, app) => sum + getPendingNodeIds(app).length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/workbench')}
              className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary-600" />
                并联审批中心
              </h1>
              <p className="text-gray-500 mt-1">
                共 {parallelApps.length} 个并联事项，{allPendingCount} 个节点待处理
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBatchUrge}
            disabled={selectedNodes.size === 0}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium shadow-lg transition-all',
              selectedNodes.size > 0
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-gov'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Bell className="w-4 h-4" />
            批量催促 ({selectedNodes.size})
          </motion.button>
        </motion.div>

        <div className="space-y-4">
          {parallelApps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-gov border border-primary-100 py-16 text-center"
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">暂无并联审批事项</p>
            </motion.div>
          ) : (
            parallelApps.map((app, appIdx) => {
              const { percent, totalDepts, completedDepts } = getOverallProgress(app);
              const groups = getParallelNodes(app);
              const expanded = expandedApps.has(app.id);
              const pendingNodeIds = getPendingNodeIds(app);
              const allSelectedForApp =
                pendingNodeIds.length > 0 &&
                pendingNodeIds.every((nid) => selectedNodes.has(`${app.id}:${nid}`));
              const selectedForApp = pendingNodeIds.filter((nid) =>
                selectedNodes.has(`${app.id}:${nid}`)
              );

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: appIdx * 0.08 }}
                  className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
                >
                  <div
                    className="p-5 cursor-pointer hover:bg-primary-50/40 transition-colors"
                    onClick={() => toggleExpand(app.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {app.serviceItemName}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            并联审批
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {app.caseNo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            并联部门 {totalDepts} 个
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            已完成 {completedDepts} 个
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {app.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold gradient-text-blue">{percent}%</div>
                          <div className="text-xs text-gray-400">总体进度</div>
                        </div>
                        {expanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.3 + appIdx * 0.05 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-gray-100"
                      >
                        <div className="p-5 bg-gradient-to-br from-gray-50/50 to-primary-50/30">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelectAllPending(app);
                                }}
                                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                              >
                                {allSelectedForApp ? (
                                  <CheckSquare className="w-4 h-4 text-primary-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                                全选待处理 ({pendingNodeIds.length})
                              </button>
                              {selectedForApp.length > 0 && (
                                <span className="text-xs text-primary-600">
                                  已选 {selectedForApp.length} 项
                                </span>
                              )}
                            </div>
                            {selectedForApp.length > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUrge(app.id, selectedForApp);
                                }}
                                disabled={selectedForApp.some((nid) =>
                                  urgingIds.has(`${app.id}:${nid}`)
                                )}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
                              >
                                {selectedForApp.some((nid) => urgingIds.has(`${app.id}:${nid}`)) ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Bell className="w-3.5 h-3.5" />
                                )}
                                催促选中
                              </motion.button>
                            )}
                          </div>

                          <div className="space-y-5">
                            {groups.map((g) => (
                              <div key={g.group.id}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                    <span className="text-sm font-medium text-gray-800">
                                      {g.group.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      ({g.completedCount}/{g.nodes.length})
                                    </span>
                                  </div>
                                  <span className="text-sm font-bold gradient-text-blue">
                                    {g.percent}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${g.percent}%` }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {g.nodes.map((node) => {
                                    const cfg = nodeStatusConfig[node.status];
                                    const NodeIcon = cfg.icon;
                                    const isPending = node.status === 'pending';
                                    const selectKey = `${app.id}:${node.id}`;
                                    const isSelected = selectedNodes.has(selectKey);
                                    const isUrging = urgingIds.has(selectKey);

                                    return (
                                      <motion.div
                                        key={node.id}
                                        whileHover={{ y: -2 }}
                                        className={cn(
                                          'p-3 rounded-lg border transition-all relative overflow-hidden',
                                          isSelected
                                            ? 'border-primary-400 bg-primary-50 shadow-gov'
                                            : 'border-gray-100 bg-white hover:border-primary-200'
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isPending) toggleSelectNode(node.id, app.id);
                                        }}
                                      >
                                        {isPending && (
                                          <div className="absolute top-2 right-2">
                                            {isSelected ? (
                                              <CheckSquare className="w-4 h-4 text-primary-600" />
                                            ) : (
                                              <Square className="w-4 h-4 text-gray-300" />
                                            )}
                                          </div>
                                        )}
                                        <div className="flex items-start gap-2">
                                          <div
                                            className={cn(
                                              'p-1.5 rounded-full mt-0.5 flex-shrink-0',
                                              cfg.bg
                                            )}
                                          >
                                            <NodeIcon
                                              className={cn(
                                                'w-3.5 h-3.5',
                                                cfg.color,
                                                node.status === 'processing' && 'animate-spin'
                                              )}
                                            />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                              {node.name}
                                            </p>
                                            {node.assigneeName && (
                                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {node.assigneeName}
                                              </p>
                                            )}
                                            <div className="mt-1.5 flex items-center gap-1.5">
                                              <span
                                                className={cn(
                                                  'text-xs px-1.5 py-0.5 rounded',
                                                  cfg.bg,
                                                  cfg.color
                                                )}
                                              >
                                                {cfg.label}
                                              </span>
                                              {isPending && (
                                                <motion.button
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUrge(app.id, [node.id]);
                                                  }}
                                                  disabled={isUrging}
                                                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-60"
                                                >
                                                  {isUrging ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                  ) : (
                                                    <Bell className="w-3 h-3" />
                                                  )}
                                                  催促
                                                </motion.button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
