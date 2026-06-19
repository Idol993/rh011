import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  FileText,
  TrendingUp,
  Clock,
  ThumbsUp,
  Building2,
  ChevronDown,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  XCircle,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats, Department } from "@/types";
import { mockData } from "@/data/mockData";

const dashboardStats: DashboardStats = mockData.dashboardStats;
const departments: Department[] = mockData.departments;

const CHART_COLORS = [
  "#3B82F6",
  "#06B6D4",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
];

const STATUS_COLORS = {
  completed: "#10B981",
  processing: "#3B82F6",
  pending: "#F59E0B",
  warning: "#EF4444",
  rejected: "#6B7280",
};

function useCountUp(target: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(target * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const count = useCountUp(value);
  return (
    <span className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function CornerDecoration({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const positionClass = {
    tl: "top-0 left-0",
    tr: "top-0 right-0 rotate-90",
    bl: "bottom-0 left-0 -rotate-90",
    br: "bottom-0 right-0 rotate-180",
  }[position];

  return (
    <div className={cn("absolute w-6 h-6 pointer-events-none z-10", positionClass)}>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
      <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-cyan-400 to-transparent" />
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("data-panel relative p-4 overflow-hidden", className)}
    >
      <CornerDecoration position="tl" />
      <CornerDecoration position="tr" />
      <CornerDecoration position="bl" />
      <CornerDecoration position="br" />

      <div className="scan-line absolute inset-0 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-500/20">
          {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
          <h3 className="text-sm font-medium text-cyan-100 tracking-wider">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  suffix = "",
  decimals = 0,
  prefix = "",
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  decimals?: number;
  prefix?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${color}40` }}
      className="relative p-4 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-slate-900/50 backdrop-blur-sm overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}20 0%, transparent 60%)`,
        }}
      />

      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-200/70 tracking-wide">{label}</span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        </div>

        <div
          className="text-3xl font-bold tracking-tight glow-text"
          style={{ color }}
        >
          <AnimatedNumber
            value={value}
            decimals={decimals}
            suffix={suffix}
            prefix={prefix}
          />
        </div>

        <div className="mt-2 h-1 rounded-full bg-slate-700/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}, ${color}80)`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function DepartmentFilter({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const options = [
    { value: "all", label: "全部部门" },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const current = options.find((o) => o.value === selected);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-900/20 hover:bg-cyan-800/30 transition-colors text-sm text-cyan-100 backdrop-blur-sm"
      >
        <Building2 className="w-4 h-4" />
        <span>{current?.label || "全部部门"}</span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-cyan-500/30 bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-cyan-500/10 overflow-hidden z-50"
          >
            {options.map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-cyan-800/30 transition-colors",
                  selected === opt.value
                    ? "text-cyan-300 bg-cyan-900/40"
                    : "text-blue-100/80"
                )}
              >
                {selected === opt.value && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                )}
                <span className={selected === opt.value ? "" : "ml-6"}>
                  {opt.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TrendChart({ data }: { data: DashboardStats["trendData"] }) {
  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#60a5fa", fontSize: 11 }}
            axisLine={{ stroke: "#1e3a5f" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#60a5fa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              color: "#e0f2fe",
              fontSize: 12,
            }}
            labelStyle={{ color: "#22d3ee", marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#06B6D4"
            strokeWidth={3}
            dot={{ fill: "#06B6D4", r: 4, strokeWidth: 2, stroke: "#0a0f1f" }}
            activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="url(#trendGradient)"
            strokeWidth={0}
            dot={false}
            fill="url(#trendGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function HotServicesChart({ data }: { data: DashboardStats["hotServices"] }) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => a.count - b.count).slice(-10),
    [data]
  );

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#60a5fa", fontSize: 11 }}
            axisLine={{ stroke: "#1e3a5f" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#93c5fd", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              color: "#e0f2fe",
              fontSize: 12,
            }}
            labelStyle={{ color: "#22d3ee", marginBottom: 4 }}
          />
          <Bar
            dataKey="count"
            fill="url(#barGradient)"
            radius={[0, 4, 4, 0]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DepartmentPieChart({ data }: { data: DashboardStats["byDepartment"] }) {
  const pieData = data.map((d) => ({ name: d.dept, value: d.count }));

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {CHART_COLORS.map((color, i) => (
              <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
            animationDuration={1500}
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#pieGrad${index % CHART_COLORS.length})`}
                stroke="#0a0f1f"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              color: "#e0f2fe",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [`${value} 件`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => (
              <span className="text-blue-200/80 text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function DepartmentCards({ data }: { data: DashboardStats["byDepartment"] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {data.map((dept, i) => (
        <motion.div
          key={dept.dept}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" }}
          className="relative p-3 rounded-md border border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-slate-900/40 overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 w-1 h-full"
            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <div className="ml-2">
            <div className="text-xs text-blue-200/90 font-medium truncate mb-1">
              {dept.dept}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span
                className="text-lg font-bold"
                style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
              >
                {dept.count.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-300/60">件</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-cyan-300/80 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {dept.avgDays}天
              </span>
              <span className="text-emerald-300/80 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {dept.rate}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusPieChart({ stats }: { stats: DashboardStats }) {
  const data = [
    { name: "已办结", value: Math.floor(stats.totalCount * 0.72), color: STATUS_COLORS.completed },
    { name: "办理中", value: stats.pendingCount, color: STATUS_COLORS.processing },
    { name: "待受理", value: Math.floor(stats.totalCount * 0.08), color: STATUS_COLORS.pending },
    { name: "预警办件", value: stats.warningCount, color: STATUS_COLORS.warning },
    { name: "已驳回", value: Math.floor(stats.totalCount * 0.03), color: STATUS_COLORS.rejected },
  ];

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#0a0f1f"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              color: "#e0f2fe",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 px-2 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-blue-200/80">{item.name}</span>
            <span className="ml-auto font-medium" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SatisfactionGauge({ rate }: { rate: number }) {
  const data = [
    { subject: "服务态度", A: 98, fullMark: 100 },
    { subject: "办理效率", A: 96, fullMark: 100 },
    { subject: "流程便利", A: 95, fullMark: 100 },
    { subject: "一次办好", A: 97, fullMark: 100 },
    { subject: "整体满意", A: rate, fullMark: 100 },
  ];

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#1e3a5f" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#93c5fd", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#60a5fa", fontSize: 9 }}
            stroke="#1e3a5f"
          />
          <defs>
            <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <Radar
            name="满意度"
            dataKey="A"
            stroke="#06B6D4"
            fill="url(#radarGrad)"
            fillOpacity={0.5}
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MarqueeTicker() {
  const items = mockData.applications.slice(0, 15).map((app) => ({
    id: app.id,
    caseNo: app.caseNo,
    name: app.serviceItemName,
    applicant: app.applicantName,
    status: app.status,
    time: app.createdAt,
    dept: app.assignees[0]?.department || "市民服务中心",
  }));

  const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    completed: { label: "已办结", color: "#10B981", icon: CheckCircle2 },
    approved: { label: "已审批", color: "#10B981", icon: CheckCircle2 },
    reviewing: { label: "审核中", color: "#3B82F6", icon: Loader2 },
    processing: { label: "办理中", color: "#3B82F6", icon: Loader2 },
    pending: { label: "待处理", color: "#F59E0B", icon: Clock },
    submitted: { label: "已提交", color: "#06B6D4", icon: FileText },
    prechecking: { label: "预审中", color: "#8B5CF6", icon: Activity },
    rejected: { label: "已驳回", color: "#EF4444", icon: XCircle },
    draft: { label: "草稿", color: "#6B7280", icon: FileText },
  };

  return (
    <div className="relative overflow-hidden py-2 bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-blue-900/40 border-y border-cyan-500/20">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-2 px-4 mr-4 border-r border-cyan-500/30">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs text-cyan-300 font-medium tracking-wider">实时办件</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 60, ease: "linear", repeat: Infinity }}
          >
            {[...items, ...items].map((item, i) => {
              const s = statusMap[item.status] || statusMap.pending;
              const StatusIcon = s.icon;
              return (
                <div
                  key={`${item.id}-${i}`}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-blue-300/60 font-mono text-xs">
                    {item.time.slice(5, 16)}
                  </span>
                  <span className="text-cyan-300 font-mono">{item.caseNo}</span>
                  <span className="text-blue-100/90">{item.name}</span>
                  <span className="text-blue-200/60">- {item.applicant}</span>
                  <span className="text-blue-200/60">[{item.dept}]</span>
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${s.color}20`,
                      color: s.color,
                    }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {s.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function RealtimeClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2 text-blue-200/70">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <span>
          {now.getFullYear()}年{pad(now.getMonth() + 1)}月{pad(now.getDate())}日
        </span>
        <span className="text-cyan-300">{weekdays[now.getDay()]}</span>
      </div>
      <div className="flex items-center gap-2 text-cyan-300 font-mono text-lg tracking-wider">
        <Clock className="w-4 h-4 text-cyan-400" />
        <span className="glow-text">
          {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedDept, setSelectedDept] = useState("all");

  const filteredStats = useMemo(() => {
    if (selectedDept === "all") return dashboardStats;
    const deptName = departments.find((d) => d.id === selectedDept)?.name;
    const deptStat = dashboardStats.byDepartment.find((d) => d.dept === deptName);
    if (!deptStat) return dashboardStats;
    return {
      ...dashboardStats,
      todayCount: Math.floor(dashboardStats.todayCount * (deptStat.count / dashboardStats.totalCount) * 8),
      totalCount: deptStat.count,
      avgProcessingDays: deptStat.avgDays,
      satisfactionRate: deptStat.rate,
    };
  }, [selectedDept]);

  return (
    <div className="data-screen-bg min-h-screen w-full flex flex-col">
      <header className="relative z-10 px-8 pt-6 pb-4">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-4 w-[340px]">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-cyan">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-cyan-400/20 animate-ping-slow" />
              </motion.div>
              <div>
                <div className="text-xs text-blue-300/70 tracking-widest">CITIZEN SERVICE</div>
                <div className="text-sm text-cyan-200/90">政务服务平台</div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative flex items-center gap-6">
              <div className="w-40 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-cyan-400" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rotate-45" />
                <h1 className="text-3xl font-bold tracking-[0.3em] gradient-text-cyan glow-text px-2">
                  市民服务中心一网通办数据中心
                </h1>
                <div className="w-2 h-2 bg-cyan-400 rotate-45" />
              </div>
              <div className="w-40 h-[2px] bg-gradient-to-l from-transparent via-cyan-400 to-cyan-400" />
            </div>
            <div className="mt-2 text-xs text-blue-300/60 tracking-[0.5em]">
              CITIZEN SERVICE ONLINE PLATFORM DATA CENTER
            </div>
          </motion.div>

          <div className="w-[340px] flex items-center justify-end gap-4">
            <RealtimeClock />
            <DepartmentFilter selected={selectedDept} onChange={setSelectedDept} />
          </div>
        </div>
      </header>

      <div className="relative z-10 px-6 pb-4">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="今日办件"
            value={filteredStats.todayCount}
            icon={FileText}
            color="#06B6D4"
          />
          <StatCard
            label="累计办件"
            value={filteredStats.totalCount}
            icon={BarChart3}
            color="#3B82F6"
          />
          <StatCard
            label="平均办结时长"
            value={filteredStats.avgProcessingDays}
            icon={Clock}
            suffix=" 天"
            decimals={1}
            color="#8B5CF6"
          />
          <StatCard
            label="群众好评率"
            value={filteredStats.satisfactionRate}
            icon={ThumbsUp}
            suffix="%"
            decimals={1}
            color="#10B981"
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 px-6 pb-4">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-3 flex flex-col gap-4">
            <Panel title="近7天办件趋势" icon={TrendingUp}>
              <TrendChart data={dashboardStats.trendData} />
            </Panel>
            <Panel title="热门办事事项 TOP10" icon={Users} className="flex-1">
              <HotServicesChart data={dashboardStats.hotServices} />
            </Panel>
          </div>

          <div className="col-span-6 flex flex-col gap-4">
            <Panel title="各部门办件分布" icon={Building2}>
              <DepartmentPieChart data={dashboardStats.byDepartment} />
            </Panel>
            <Panel title="部门办件详情" icon={Activity} className="flex-1">
              <DepartmentCards data={dashboardStats.byDepartment} />
            </Panel>
          </div>

          <div className="col-span-3 flex flex-col gap-4">
            <Panel title="办件状态分布" icon={Activity}>
              <StatusPieChart stats={dashboardStats} />
            </Panel>
            <Panel title="群众满意度分析" icon={ThumbsUp} className="flex-1">
              <SatisfactionGauge rate={dashboardStats.satisfactionRate} />
            </Panel>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <MarqueeTicker />
      </div>

      <div className="fixed top-8 left-8 pointer-events-none opacity-30 animate-float">
        <div className="w-32 h-32 rounded-full border border-cyan-500/20" />
      </div>
      <div className="fixed bottom-20 right-8 pointer-events-none opacity-20 animate-float" style={{ animationDelay: "2s" }}>
        <div className="w-48 h-48 rounded-full border border-blue-500/20" />
      </div>
      <div className="fixed top-1/2 right-20 pointer-events-none opacity-15 animate-spin-slow">
        <div className="w-64 h-64 rounded-full border border-dashed border-cyan-500/30" />
      </div>
    </div>
  );
}
