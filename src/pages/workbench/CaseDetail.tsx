import { useAppStore } from '@/store';
import type { MaterialItem, FlowNode, FlowNodeStatus, ParallelGroup, Certificate, BlockchainRecord } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Sparkles,
  ScanLine,
  Users,
  CheckCircle2,
  Loader2,
  Circle,
  MessageSquare,
  Award,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const statusDisplay: Record<string, { label: string; className: string }> = {
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

const nodeStatusConfig: Record<FlowNodeStatus, { icon: typeof Circle; color: string; label: string }> = {
  pending: { icon: Circle, color: 'text-gray-400', label: '待处理' },
  processing: { icon: Loader2, color: 'text-primary-500', label: '处理中' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: '已完成' },
  skipped: { icon: CheckCircle2, color: 'text-gray-400', label: '已跳过' },
};

function WarningBadge({ level }: { level: string }) {
  if (!level || level === 'none') return null;
  const isRed = level === 'red';
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        isRed ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
      )}
    >
      {isRed ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {isRed ? '红牌预警' : '黄牌预警'}
    </motion.div>
  );
}

function MaterialCard({ material }: { material: MaterialItem }) {
  const [showOcr, setShowOcr] = useState(false);

  return (
    <motion.div
      layout
      className="bg-white rounded-lg border border-gray-100 overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              material.isComplete ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            )}
          >
            {material.isComplete ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertOctagon className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{material.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {material.fileName ? (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {material.fileName}
                </span>
              ) : (
                <span className="text-xs text-red-500">未上传</span>
              )}
              {!material.isComplete && material.missingTips && (
                <span className="text-xs text-red-500">· {material.missingTips}</span>
              )}
            </div>
          </div>
        </div>
        {material.ocrResult && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowOcr(!showOcr)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5" />
            {showOcr ? '收起OCR' : '查看OCR'}
          </motion.button>
        )}
      </div>
      <AnimatePresence>
        {showOcr && material.ocrResult && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-50 to-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-medium text-primary-700">OCR 智能识别结果</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{material.ocrResult}</p>
                {material.nlpResult && (
                  <div className="mt-3 pt-3 border-t border-primary-100/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">语义完整性：</span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          material.nlpResult.isSemanticComplete
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {material.nlpResult.isSemanticComplete ? '完整' : '不完整'}
                      </span>
                      <span className="text-xs text-gray-500">置信度：</span>
                      <span className="text-xs text-primary-700 font-medium">
                        {(material.nlpResult.confidence * 100).toFixed(0)}%
                      </span>
                      {material.nlpResult.missingInfo.length > 0 && (
                        <span className="text-xs text-amber-600">
                          缺失：{material.nlpResult.missingInfo.join('、')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TimelineNode({ node, isLast }: { node: FlowNode; isLast: boolean }) {
  const config = nodeStatusConfig[node.status];
  const StatusIcon = config.icon;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'p-1.5 rounded-full bg-white border-2 z-10',
            node.status === 'completed'
              ? 'border-green-400'
              : node.status === 'processing'
              ? 'border-primary-400'
              : 'border-gray-200'
          )}
        >
          <StatusIcon
            className={cn(
              'w-4 h-4',
              config.color,
              node.status === 'processing' && 'animate-spin'
            )}
          />
        </motion.div>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-[40px]',
              node.status === 'completed' ? 'bg-green-200' : 'bg-gray-100'
            )}
          />
        )}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{node.name}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', config.color.replace('text-', 'bg-').replace('500', '100 text-').replace('400', '100 text-'))}>
            {config.label}
          </span>
          {node.type === 'parallel' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
              并联
            </span>
          )}
        </div>
        {node.assigneeName && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <User className="w-3 h-3" />
            经办人：{node.assigneeName}
          </p>
        )}
        {(node.startedAt || node.completedAt) && (
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {node.startedAt && <span>开始：{node.startedAt}</span>}
            {node.completedAt && <span> · 完成：{node.completedAt}</span>}
          </p>
        )}
        {node.comment && (
          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-600 flex items-start gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{node.comment}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ParallelProgressPanel({
  parallelGroups,
  flowNodes,
}: {
  parallelGroups: ParallelGroup[];
  flowNodes: FlowNode[];
}) {
  return (
    <div className="bg-white rounded-xl border border-primary-100 shadow-gov overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-transparent">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">并联审批进度</h3>
        </div>
      </div>
      <div className="p-5 space-y-5">
        {parallelGroups.map((group) => {
          const nodes = flowNodes.filter((n) => n.parallelGroupId === group.id);
          const completed = nodes.filter(
            (n) => n.status === 'completed' || n.status === 'skipped'
          ).length;
          const percent = nodes.length > 0 ? Math.round((completed / nodes.length) * 100) : 0;

          return (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-sm font-medium text-gray-800">{group.name}</span>
                </div>
                <span className="text-sm font-bold gradient-text-blue">{percent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nodes.map((node) => {
                  const cfg = nodeStatusConfig[node.status];
                  const NodeIcon = cfg.icon;
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        'p-3 rounded-lg border flex items-center gap-2',
                        node.status === 'completed'
                          ? 'bg-green-50 border-green-100'
                          : node.status === 'processing'
                          ? 'bg-primary-50 border-primary-100'
                          : 'bg-gray-50 border-gray-100'
                      )}
                    >
                      <NodeIcon
                        className={cn(
                          'w-4 h-4 flex-shrink-0',
                          cfg.color,
                          node.status === 'processing' && 'animate-spin'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{node.name}</p>
                        {node.assigneeName && (
                          <p className="text-xs text-gray-500 mt-0.5">{node.assigneeName}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CaseDetail() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const {
    applications,
    updateApplicationStatus,
    currentUser,
    addNotification,
    addCertificate,
    addBlockchainRecord,
    updateApplicationFlowNode,
  } = useAppStore();

  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const application = applications.find((a) => a.id === id);

  const handleAction = async (action: 'approve' | 'rectify' | 'reject') => {
    if (!application || !currentUser) return;
    setActionLoading(action);

    if (action === 'approve') {
      updateApplicationStatus(application.id, 'making');
      updateApplicationFlowNode(application.id, 'node-review', {
        status: 'completed',
        completedAt: new Date().toISOString(),
        assigneeName: currentUser.name,
        comment: comment || '材料齐全，符合办理条件，准予通过。',
      });

      setTimeout(() => {
        const newCert: Certificate = {
          id: `cert-${Date.now()}`,
          certificateNo: `CERT${Date.now().toString().slice(-10)}`,
          type: application.serviceItemName,
          holderName: application.applicantName,
          applicationId: application.id,
          issuedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          issuer: application.serviceItemName.includes('不动产') ? '自然资源局' : '市场监督管理局',
          isVerified: true,
          status: 'valid',
        };
        addCertificate(newCert);

        addBlockchainRecord({
          dataType: 'certificate',
          dataRef: newCert.id,
          dataHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          operator: currentUser.name,
          operatorId: currentUser.id,
        });

        updateApplicationStatus(application.id, 'completed');
        updateApplicationFlowNode(application.id, 'node-review', {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });

        const nowStr = new Date().toLocaleString('zh-CN');
        addNotification({
          userId: application.applicantId,
          type: 'inapp',
          title: '电子证照已生成',
          content: `您的「${application.serviceItemName}」电子证照已生成并上链存证，存证时间：${nowStr}。可在电子证照中心查看下载。`,
          relatedId: newCert.id,
        });

        addNotification({
          userId: application.applicantId,
          type: 'sms',
          title: '【一网通办】办件已办结',
          content: `您的办件「${application.serviceItemName}」（${application.caseNo}）已办结，电子证照已上链存证，请注意查收。`,
          relatedId: application.id,
        });

        setActionLoading(null);
        setComment('');
      }, 1800);
    } else {
      setTimeout(() => {
        const statusMap: Record<string, 'reviewing' | 'rejected'> = {
          rectify: 'reviewing',
          reject: 'rejected',
        };
        updateApplicationStatus(application.id, statusMap[action]);
        addNotification({
          userId: application.applicantId,
          type: 'inapp',
          title: action === 'rectify' ? '需补正材料' : '审批驳回',
          content: `您的办件「${application.serviceItemName}」${
            action === 'rectify' ? '需要补正材料' : '已被驳回'
          }。${comment ? `意见：${comment}` : ''}`,
          relatedId: application.id,
        });
        if (action === 'rectify') {
          addNotification({
            userId: application.applicantId,
            type: 'sms',
            title: '【一网通办】办件需补正',
            content: `您的办件「${application.serviceItemName}」（${application.caseNo}）需要补充材料，请尽快登录系统补正。`,
            relatedId: application.id,
          });
        }
        setActionLoading(null);
        setComment('');
      }, 600);
    }
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">未找到该办件</p>
          <button
            onClick={() => navigate('/workbench/cases')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            返回办件列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/workbench/cases')}
              className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{application.serviceItemName}</h1>
                <WarningBadge level={application.warningLevel || 'none'} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                办件号：<span className="font-mono">{application.caseNo}</span>
              </p>
            </div>
          </div>
          <span
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium',
              statusDisplay[application.status]?.className
            )}
          >
            {statusDisplay[application.status]?.label}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-transparent">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  办件基本信息
                </h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">事项名称</span>
                  <span className="text-sm text-gray-900">{application.serviceItemName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">办件编号</span>
                  <span className="text-sm font-mono text-gray-900">{application.caseNo}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">申请时间</span>
                  <span className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {application.createdAt}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">办理时限</span>
                  <span className="text-sm text-gray-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {application.deadline || '—'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500 block mb-1">办理部门</span>
                  <div className="flex flex-wrap gap-2">
                    {application.assignees.map((a, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded"
                      >
                        {a.department || '—'} · {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  申请人信息
                </h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">申请人姓名</span>
                  <span className="text-sm text-gray-900">{application.applicantName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">联系电话</span>
                  <span className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {application.applicantPhone}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-transparent">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-cyan-600" />
                  材料清单
                  <span className="text-xs text-gray-500 font-normal">
                    （{application.materials.filter((m) => m.isComplete).length}/
                    {application.materials.length} 项完整）
                  </span>
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {application.materials.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-transparent">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  审批流程
                </h3>
              </div>
              <div className="p-5">
                {application.flowNodes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">暂无审批流程</p>
                ) : (
                  <div>
                    {application.flowNodes.map((node, idx) => (
                      <TimelineNode
                        key={node.id}
                        node={node}
                        isLast={idx === application.flowNodes.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {application.parallelGroups && application.parallelGroups.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ParallelProgressPanel
                  parallelGroups={application.parallelGroups}
                  flowNodes={application.flowNodes}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-gov border border-primary-100 overflow-hidden sticky top-6"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-transparent">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                  审批意见
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请输入审批意见（选填）..."
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                />
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {actionLoading === 'approve' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    通过
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('rectify')}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium shadow-lg hover:shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {actionLoading === 'rectify' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    补正
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium shadow-lg hover:shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {actionLoading === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    驳回
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
