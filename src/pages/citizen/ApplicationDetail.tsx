import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  CircleDot,
  AlertTriangle,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Users,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { FlowNode, FlowNodeStatus, ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusLabelMap: Record<ApplicationStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  prechecking: '预审中',
  pending: '办理中',
  reviewing: '审核中',
  approved: '已批准',
  making: '待制证',
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
  making: 'bg-orange-50 text-orange-600',
  rejected: 'bg-red-50 text-red-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

const nodeStatusConfig: Record<FlowNodeStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'text-gray-400' },
  processing: { label: '办理中', color: 'text-primary-600' },
  completed: { label: '已完成', color: 'text-green-600' },
  skipped: { label: '已跳过', color: 'text-gray-400' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getRemainingDays = (deadline: string) => {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function CitizenApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications } = useAppStore();

  const application = useMemo(() => {
    return applications.find((a) => a.id === id) || applications[0];
  }, [applications, id]);

  if (!application) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-gray-500">未找到该办件信息</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl bg-primary-500 px-6 py-2 text-white"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const remainingDays = getRemainingDays(application.deadline);
  const serialNodes = application.flowNodes.filter((n) => n.type === 'serial');
  const parallelGroups = application.parallelGroups || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <div className="mx-auto max-w-6xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 transition-colors hover:text-primary-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>返回办件列表</span>
        </motion.button>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-2xl bg-white shadow-gov"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold">{application.serviceItemName}</h1>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-medium',
                        application.status === 'completed' || application.status === 'approved'
                          ? 'bg-white/20 text-white'
                          : application.status === 'rejected'
                          ? 'bg-red-400/30 text-white'
                          : 'bg-white/20 text-white'
                      )}
                    >
                      {statusLabelMap[application.status]}
                    </span>
                    {application.warningLevel && application.warningLevel !== 'none' && (
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [1, 0.8, 1],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className={cn(
                          'flex items-center rounded-full px-3 py-1 text-sm font-medium',
                          application.warningLevel === 'red'
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-400 text-white'
                        )}
                      >
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        {application.warningLevel === 'red' ? '红牌预警' : '黄牌预警'}
                      </motion.div>
                    )}
                  </div>
                  <p className="mt-2 text-white/80">办件号：{application.caseNo}</p>
                </div>
                <div className="text-right">
                  {remainingDays !== null && remainingDays > 0 && application.status !== 'completed' && application.status !== 'rejected' && (
                    <div className="text-white/90">
                      <span className="text-3xl font-bold">{remainingDays}</span>
                      <span className="ml-1">天</span>
                      <p className="text-sm text-white/70">剩余办理时间</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">申请人</p>
                  <p className="font-medium text-gray-800">{application.applicantName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">联系电话</p>
                  <p className="font-medium text-gray-800">{application.applicantPhone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">申请时间</p>
                  <p className="font-medium text-gray-800">{application.createdAt}</p>
                </div>
              </div>
              {application.assignees.length > 0 && (
                <div className="flex items-center space-x-3 md:col-span-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">办理部门 / 人员</p>
                    <div className="flex flex-wrap gap-2">
                      {application.assignees.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700"
                        >
                          {a.department} - {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6 shadow-gov">
            <div className="mb-6 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800">办理流程</h2>
            </div>

            <div className="space-y-0">
              {serialNodes.map((node: FlowNode, index: number) => (
                <div key={node.id}>
                  <div className="flex">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.15, type: 'spring' }}
                        className={cn(
                          'relative flex h-10 w-10 items-center justify-center rounded-full',
                          node.status === 'completed'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                            : node.status === 'processing'
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        {node.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : node.status === 'processing' ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <CircleDot className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                        {node.status === 'processing' && (
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-primary-500"
                          />
                        )}
                      </motion.div>
                      {index < serialNodes.length - 1 && (
                        <div
                          className={cn(
                            'my-1 w-0.5 flex-1',
                            node.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                          )}
                          style={{ minHeight: '40px' }}
                        />
                      )}
                    </div>

                    <div className="ml-4 flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{node.name}</h4>
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            node.status === 'completed'
                              ? 'bg-green-50 text-green-600'
                              : node.status === 'processing'
                              ? 'bg-primary-50 text-primary-600'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {nodeStatusConfig[node.status].label}
                        </span>
                      </div>
                      {(node.assigneeName || node.startedAt) && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          {node.assigneeName && (
                            <span>办理人：{node.assigneeName}</span>
                          )}
                          {node.startedAt && node.status !== 'pending' && (
                            <span>开始时间：{node.startedAt}</span>
                          )}
                          {node.completedAt && (
                            <span>完成时间：{node.completedAt}</span>
                          )}
                        </div>
                      )}
                      {node.comment && (
                        <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                          <span className="font-medium text-gray-700">办理意见：</span>
                          {node.comment}
                        </div>
                      )}

                      {node.type === 'parallel' && parallelGroups.length > 0 && (
                        <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                          <div className="mb-3 flex items-center space-x-2 text-sm font-medium text-purple-700">
                            <Layers className="h-4 w-4" />
                            <span>并联审批节点</span>
                          </div>
                          {parallelGroups.map((group) => {
                            const groupNodes = application.flowNodes.filter(
                              (n) => n.parallelGroupId === group.id
                            );
                            const completedCount = groupNodes.filter(
                              (n) => n.status === 'completed'
                            ).length;
                            const progress = (completedCount / groupNodes.length) * 100;
                            return (
                              <div key={group.id} className="mb-3 last:mb-0">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{group.name}</span>
                                  <span className="text-gray-500">
                                    {completedCount}/{groupNodes.length} 已完成
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                  />
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {groupNodes.map((gn) => (
                                    <span
                                      key={gn.id}
                                      className={cn(
                                        'rounded-lg px-2 py-1 text-xs',
                                        gn.status === 'completed'
                                          ? 'bg-green-100 text-green-700'
                                          : gn.status === 'processing'
                                          ? 'bg-primary-100 text-primary-700'
                                          : 'bg-gray-100 text-gray-500'
                                      )}
                                    >
                                      {gn.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6 shadow-gov">
            <div className="mb-6 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800">材料清单</h2>
            </div>
            <div className="space-y-3">
              {application.materials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4 transition-all',
                    material.isComplete
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-red-200 bg-red-50/50'
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        material.isComplete ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      )}
                    >
                      {material.isComplete ? (
                        <FileCheck className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">{material.name}</span>
                        {material.isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {material.fileName && (
                        <p className="text-sm text-gray-500">{material.fileName}</p>
                      )}
                      {material.missingTips && (
                        <p className="text-sm text-red-500">{material.missingTips}</p>
                      )}
                    </div>
                  </div>
                  {material.fileName && (
                    <button className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      查看 <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
