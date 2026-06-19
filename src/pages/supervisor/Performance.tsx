import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  Star,
  Clock,
  Users,
  FileCheck,
  Medal,
  Trophy,
  Crown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAppStore } from '@/store';

const COLORS = [
  '#3B82F6',
  '#06B6D4',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#6366F1',
];

export default function Performance() {
  const applications = useAppStore((state) => state.applications);
  const reviews = useAppStore((state) => state.reviews);

  const deptVolumeData = useMemo(() => {
    const deptMap = new Map<string, number>();
    applications.forEach((app) => {
      app.assignees.forEach((assignee) => {
        if (assignee.department) {
          const current = deptMap.get(assignee.department) || 0;
          deptMap.set(assignee.department, current + 1);
        }
      });
    });
    return Array.from(deptMap.entries())
      .map(([name, value]) => ({
        name: name.replace('局', '').replace('委员会', '委').replace('和', ''),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [applications]);

  const satisfactionTrend = useMemo(() => {
    const monthlyData: Record<string, { total: number; count: number }> = {};
    reviews.forEach((review) => {
      const month = review.createdAt.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += review.rating;
      monthlyData[month].count += 1;
    });
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.replace('-', '/'),
        满意度: Math.round((data.total / data.count) * 20) / 10,
      }));
  }, [reviews]);

  const deptRatingData = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number; appCount: number }>();
    reviews.forEach((review) => {
      const app = applications.find((a) => a.id === review.applicationId);
      if (app) {
        app.assignees.forEach((assignee) => {
          if (assignee.department) {
            const current = deptMap.get(assignee.department) || { total: 0, count: 0, appCount: 0 };
            deptMap.set(assignee.department, {
              total: current.total + review.rating,
              count: current.count + 1,
              appCount: current.appCount + 1,
            });
          }
        });
      }
    });
    return Array.from(deptMap.entries())
      .map(([dept, data]) => ({
        dept: dept.replace('局', '').replace('委员会', '委').replace('和', ''),
        好评率: data.count > 0 ? Math.round((data.total / (data.count * 5)) * 100) : 0,
        办件量: data.appCount,
        平均分: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.好评率 - a.好评率);
  }, [reviews, applications]);

  const overallStats = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10 : 0;
    const goodReviews = reviews.filter((r) => r.rating >= 4).length;
    const goodRate = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;
    const completedApps = applications.filter((a) => a.status === 'completed').length;
    return { totalReviews, avgRating, goodRate, completedApps };
  }, [reviews, applications]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 h-4 text-xs text-gray-400 flex items-center justify-center">{index + 1}</span>;
  };

  const statCards = [
    {
      title: '总评价数',
      value: overallStats.totalReviews,
      icon: Star,
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: '平均评分',
      value: overallStats.avgRating.toFixed(1),
      icon: Award,
      color: 'from-primary-500 to-blue-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      title: '好评率',
      value: `${overallStats.goodRate}%`,
      icon: TrendingUp,
      color: 'from-emerald-400 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: '已办结件',
      value: overallStats.completedApps,
      icon: FileCheck,
      color: 'from-cyan-400 to-sky-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">绩效统计</h1>
          <p className="text-gray-500 mt-1">多维度分析各部门绩效与服务质量</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-xl border border-gray-100 ${card.bgColor} p-5 shadow-sm`}
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
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">各部门办件占比</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptVolumeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptVolumeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [`${value} 件`, '办件量']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => <span className="text-sm text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">月度满意度趋势</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={satisfactionTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[3, 5]}
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
                  formatter={(value: number) => [`${value} 分`, '满意度']}
                />
                <Line
                  type="monotone"
                  dataKey="满意度"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">各部门好评率排名</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptRatingData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="dept"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: number) => [`${value}%`, '好评率']}
              />
              <Bar dataKey="好评率" radius={[0, 6, 6, 0]} barSize={24}>
                {deptRatingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.好评率 >= 95 ? '#10B981' : entry.好评率 >= 90 ? '#3B82F6' : '#F59E0B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">绩效考核明细</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-16">排名</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">部门</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">办件量</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">平均分</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">好评率</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">评级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deptRatingData.map((item, index) => (
                <motion.tr
                  key={item.dept}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center w-7 h-7">
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{item.dept}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-700">{item.办件量} 件</td>
                  <td className="px-6 py-3.5 text-sm text-gray-700 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {item.平均分.toFixed(1)}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.好评率}%` }}
                          transition={{ delay: 0.5 + index * 0.05, duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            item.好评率 >= 95 ? 'bg-emerald-500' : item.好评率 >= 90 ? 'bg-primary-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        item.好评率 >= 95 ? 'text-emerald-600' : item.好评率 >= 90 ? 'text-primary-600' : 'text-amber-600'
                      }`}>
                        {item.好评率}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.好评率 >= 95
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.好评率 >= 90
                          ? 'bg-blue-100 text-blue-700'
                          : item.好评率 >= 80
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.好评率 >= 95 ? '优秀' : item.好评率 >= 90 ? '良好' : item.好评率 >= 80 ? '合格' : '待改进'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
