import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  X,
  CheckCheck,
  FileText,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useAppStore } from '@/store';

const roleLabels: Record<string, string> = {
  citizen: '市民',
  clerk: '窗口工作人员',
  manager: '部门负责人',
  supervisor: '监察人员',
};

export default function TopNav() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const allNotifications = useAppStore((state) => state.notifications);
  const markAsRead = useAppStore((state) => state.markAsRead);
  const markAllAsRead = useAppStore((state) => state.markAllAsRead);
  const logout = useAppStore((state) => state.logout);

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return allNotifications.filter((n) => n.userId === currentUser.id);
  }, [allNotifications, currentUser]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('办件')) return FileText;
    if (type.includes('预警')) return AlertTriangle;
    if (type.includes('证照')) return Award;
    return Bell;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="text-slate-400">
          <div className="text-sm text-slate-500">
        </div>
      </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="
              relative w-10 h-10 rounded-xl flex items-center justify-center
              text-slate-500 hover:text-slate-900 hover:bg-slate-100
              transition-all duration-200
            "
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="
                absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                bg-red-500 text-white text-[10px] font-bold
                rounded-full flex items-center justify-center px-1
                shadow-lg shadow-red-500/30
              "
            >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="
                  absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl
                  border border-slate-200/60 overflow-hidden z-50
                "
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900">消息通知</h3>
                    <p className="text-xs text-slate-500 mt-0.5">共 {notifications.length} 条消息</p>
                  </div>
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      text-blue-600 hover:bg-blue-50
                      disabled:text-slate-400 disabled:hover:bg-transparent
                      transition-colors
                    "
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    全部已读
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">暂无消息</p>
                    </div>
                  ) : (
                      notifications.map((notif, index) => {
                        const Icon = getNotificationIcon(notif.title);
                        const handleNotifClick = () => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                          if (notif.relatedId) {
                            if (notif.type === 'sms' && notif.title.includes('办件')) {
                              if (currentUser?.role === 'citizen') {
                                navigate(`/citizen/applications/${notif.relatedId}`);
                              } else {
                                navigate(`/workbench/cases/${notif.relatedId}`);
                              }
                            } else if (notif.title.includes('证照')) {
                              navigate('/citizen/certificates');
                            } else if (notif.title.includes('补正')) {
                              navigate(`/citizen/applications/${notif.relatedId}`);
                            } else if (notif.title.includes('办件') || notif.title.includes('审批') || notif.title.includes('受理')) {
                              if (currentUser?.role === 'citizen') {
                                navigate(`/citizen/applications/${notif.relatedId}`);
                              } else {
                                navigate(`/workbench/cases/${notif.relatedId}`);
                              }
                            }
                          }
                        };
                        return (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={handleNotifClick}
                            className={`
                              flex gap-3 px-5 py-4 cursor-pointer transition-colors
                              ${notif.isRead ? 'bg-white' : 'bg-blue-50/50'}
                              hover:bg-slate-50 border-b border-slate-100 last:border-0
                            `}
                          >
                            <div className={`
                              w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                              ${notif.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}
                            `}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                                  {notif.title}
                                </p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.content}</p>
                              <p className="text-xs text-slate-400 mt-1.5">{formatTime(notif.sentAt)}</p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="
              flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl
              hover:bg-slate-100 transition-all duration-200
            "
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/20">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-900">{currentUser?.name || '用户'}</div>
              <div className="text-xs text-slate-500">{currentUser?.role ? roleLabels[currentUser.role] : ''}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="
                  absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl
                  border border-slate-200/60 overflow-hidden z-50 py-2
                "
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900">{currentUser?.name}</div>
                  <div className="text-xs text-slate-500">{currentUser?.phone}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    text-red-600 hover:bg-red-50 transition-colors
                  "
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">退出登录</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
