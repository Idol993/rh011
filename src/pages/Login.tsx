import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, LogIn } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAppStore((state) => state.login);
  const currentUser = useAppStore((state) => state.currentUser);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from || null;

  useEffect(() => {
    if (currentUser) {
      let targetPath = '/citizen';
      switch (currentUser.role) {
        case 'citizen':
          targetPath = '/citizen';
          break;
        case 'clerk':
        case 'manager':
          targetPath = '/workbench';
          break;
        case 'supervisor':
          targetPath = '/supervisor';
          break;
      }
      navigate(from?.pathname || targetPath, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    const success = login(username.trim(), password);
    if (!success) {
      setError('用户名或密码错误，请重试');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/30 mb-5">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">一网通办审批系统</h1>
          <p className="text-primary-200/70">请登录您的账户</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-8 space-y-6"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div>
            <label className="block text-sm font-medium text-primary-100 mb-2">用户名</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-primary-300/50 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-100 mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（默认：123456）"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-primary-300/50 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/40 transition-all"
          >
            <LogIn className="w-5 h-5" />
            登录
          </button>

          <div className="text-center text-xs text-primary-200/60">
            <p>测试账号：citizen01 / clerk01 / manager01 / supervisor01</p>
            <p className="mt-1">统一密码：123456</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
