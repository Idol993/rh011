import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  ClipboardList,
  Award,
  LayoutDashboard,
  Clock,
  CheckSquare,
  GitBranch,
  Shield,
  AlertTriangle,
  Monitor,
  BarChart3,
  Presentation,
  MonitorPlay,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const citizenMenus: MenuItem[] = [
  { path: '/citizen', label: '首页', icon: Home, roles: ['citizen'] },
  { path: '/citizen/apply', label: '在线申请', icon: FileText, roles: ['citizen'] },
  { path: '/citizen/applications', label: '我的办件', icon: ClipboardList, roles: ['citizen'] },
  { path: '/citizen/certificates', label: '电子证照', icon: Award, roles: ['citizen'] },
];

const workbenchMenus: MenuItem[] = [
  { path: '/workbench', label: '工作台首页', icon: LayoutDashboard, roles: ['clerk', 'manager'] },
  { path: '/workbench/cases', label: '待办办件', icon: Clock, roles: ['clerk', 'manager'] },
  { path: '/workbench/cases', label: '已办办件', icon: CheckSquare, roles: ['clerk', 'manager'] },
  { path: '/workbench/parallel', label: '并联审批中心', icon: GitBranch, roles: ['clerk', 'manager'] },
];

const supervisorMenus: MenuItem[] = [
  { path: '/supervisor', label: '监察首页', icon: Shield, roles: ['supervisor'] },
  { path: '/supervisor/warnings', label: '预警中心', icon: AlertTriangle, roles: ['supervisor'] },
  { path: '/supervisor/monitor', label: '全程监控', icon: Monitor, roles: ['supervisor'] },
  { path: '/supervisor/performance', label: '绩效统计', icon: BarChart3, roles: ['supervisor'] },
];

const shortcutMenus: { label: string; icon: React.ComponentType<{ className?: string }>; roles: UserRole[]; onClick: () => void }[] = [
  { label: '数据大屏', icon: Presentation, roles: ['citizen', 'clerk', 'manager', 'supervisor'], onClick: () => window.open('/dashboard', '_blank') },
  { label: '自助终端', icon: MonitorPlay, roles: ['citizen', 'clerk', 'manager', 'supervisor'], onClick: () => window.open('/kiosk', '_blank') },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const currentUser = useAppStore((state) => state.currentUser);
  const location = useLocation();

  const role = currentUser?.role;

  const getRoleMenus = (): MenuItem[] => {
    if (!role) return [];
    const menus: MenuItem[] = [];
    if (role === 'citizen') menus.push(...citizenMenus);
    if (role === 'clerk' || role === 'manager') menus.push(...workbenchMenus);
    if (role === 'supervisor') menus.push(...supervisorMenus);
    return menus;
  };

  const roleMenus = getRoleMenus();

  const isActive = (path: string) => {
    if (path === '/citizen' || path === '/workbench' || path === '/supervisor' || path === '/dashboard' || path === '/kiosk') {
      return location.pathname === path || location.pathname.startsWith(path + '/');
    }
    return location.pathname === path;
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  const renderMenuItem = (item: MenuItem, index: number, sectionKey: string) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <motion.div
        key={`${sectionKey}-${item.path}`}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={menuItemVariants}
      >
        <NavLink
          to={item.path}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl mb-1
            transition-all duration-200 group
            ${active
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }
            ${collapsed ? 'justify-center px-2' : ''}
          `}
        >
          {active && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
            />
          )}
          <Icon className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </motion.div>
    );
  };

  const renderShortcutItem = (
    item: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void },
    index: number,
    sectionKey: string,
  ) => {
    const Icon = item.icon;
    return (
      <motion.div
        key={`${sectionKey}-${item.label}`}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={menuItemVariants}
      >
        <button
          onClick={item.onClick}
          className={`
            relative w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1
            transition-all duration-200 group text-slate-600 hover:bg-slate-100 hover:text-slate-900
            ${collapsed ? 'justify-center px-2' : ''}
          `}
        >
          <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
                <span className="ml-1 text-xs text-slate-400">↗</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-screen bg-white border-r border-slate-200/60 flex flex-col shadow-sm"
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-200/60 px-4">
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">一网通办</div>
              <div className="text-xs text-slate-500">智能审批系统</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {roleMenus.length > 0 && (
          <div>
            {!collapsed && (
              <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                功能菜单
              </div>
            )}
            <nav className="space-y-1">
              {roleMenus.map((item, i) => renderMenuItem(item, i, 'role'))}
            </nav>
          </div>
        )}

        <div>
          {!collapsed && (
            <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              快捷入口
            </div>
          )}
          <nav className="space-y-1">
            {shortcutMenus.map((item, i) => renderShortcutItem(item, i, 'shortcut'))}
          </nav>
        </div>
      </div>

      <div className="p-3 border-t border-slate-200/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
            text-slate-500 hover:text-slate-900 hover:bg-slate-100
            transition-all duration-200 group
          "
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
