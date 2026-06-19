import { motion } from 'framer-motion';
import {
  FileText,
  CreditCard,
  Building2,
  Home as HomeIcon,
  Car,
  GraduationCap,
  Heart,
  Users,
  ClipboardList,
  Clock,
  CheckCircle,
  Award,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Application, ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const quickEntries = [
  { name: '营业执照', icon: Building2, category: '企业登记' },
  { name: '社保登记', icon: Users, category: '社会保障' },
  { name: '社保卡', icon: CreditCard, category: '社会保障' },
  { name: '不动产登记', icon: HomeIcon, category: '不动产' },
  { name: '规划许可', icon: FileText, category: '工程建设' },
  { name: '车辆税务', icon: Car, category: '税务' },
  { name: '入学报名', icon: GraduationCap, category: '教育' },
  { name: '医师注册', icon: Heart, category: '医疗卫生' },
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
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CitizenHome() {
  const { currentUser, applications, certificates, notifications } = useAppStore();

  const totalCount = applications.length;
  const pendingCount = applications.filter(
    (a) => a.status === 'pending' || a.status === 'reviewing' || a.status === 'prechecking'
  ).length;
  const completedCount = applications.filter((a) => a.status === 'completed' || a.status === 'approved').length;
  const certCount = certificates.filter((c) => c.status === 'valid').length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: '办件总数', value: totalCount, icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
    { label: '办理中', value: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: '已完成', value: completedCount, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: '证照数', value: certCount, icon: Award, color: 'from-purple-500 to-indigo-500' },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-700">
                您好，{currentUser?.name || '市民'}
              </h1>
              <p className="mt-2 text-gray-500">
                欢迎使用一网通办政务服务平台，今天是{' '}
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <button className="rounded-full bg-white p-3 shadow-gov transition-shadow hover:shadow-gov-hover">
                <Bell className="h-6 w-6 text-primary-600" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">快捷入口</h2>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
            {quickEntries.map((entry, index) => (
              <motion.div
                key={entry.name}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <div
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-gov transition-all duration-300',
                    'hover:shadow-gov-hover hover:bg-gradient-to-br hover:from-primary-50 hover:to-white'
                  )}
                >
                  <div
                    className={cn(
                      'mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
                      'from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30',
                      'transition-transform duration-300 group-hover:scale-110'
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <entry.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">数据概览</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-gov transition-shadow hover:shadow-gov-hover"
              >
                <div
                  className={cn(
                    'absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10',
                    stat.color
                  )}
                />
                <div className="relative">
                  <div
                    className={cn(
                      'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                      stat.color
                    )}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <motion.p
                    key={stat.value}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                    className="text-3xl font-bold text-gray-800"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">最近办件</h2>
            <button className="flex items-center text-sm text-primary-600 hover:text-primary-700">
              查看全部 <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-gov">
            {recentApplications.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>暂无办件记录</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentApplications.map((app: Application, index: number) => (
                  <motion.div
                    key={app.id}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: 'rgba(30, 90, 168, 0.03)' }}
                    className="flex cursor-pointer items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{app.serviceItemName}</p>
                        <p className="text-sm text-gray-500">
                          办件号：{app.caseNo} · 申请时间：{app.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          statusColorMap[app.status]
                        )}
                      >
                        {statusLabelMap[app.status]}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
