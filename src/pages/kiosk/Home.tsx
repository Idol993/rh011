import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  BookOpen,
  Search,
  CreditCard,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  MapPin,
  Volume2,
  ArrowLeft,
} from 'lucide-react';
import { useAppStore } from '@/store';

export default function KioskHome() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const handleFeatureClick = (title: string) => {
    if (title === '打印证明') {
      navigate('/kiosk/print');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: '打印证明',
      description: '凭身份证自助打印各类证明材料',
      icon: Printer,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/40',
    },
    {
      title: '办事指南',
      description: '查询各类政务服务办理流程',
      icon: BookOpen,
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/40',
    },
    {
      title: '查询办件',
      description: '查询办件进度与办理结果',
      icon: Search,
      gradient: 'from-violet-500 to-purple-500',
      shadow: 'shadow-violet-500/40',
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      navigate('/kiosk/print');
    }, 2500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen p-8 md:p-12 lg:p-16">
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border border-primary-400/30"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                政务服务自助终端
              </h1>
              <p className="text-primary-200/80 text-sm md:text-base mt-0.5">
                Government Service Self-Service Terminal
              </p>
            </div>
          </div>

          <div className="text-right hidden md:block">
            <div className="text-3xl md:text-4xl font-light text-white tabular-nums tracking-wider">
              {formatTime(currentTime)}
            </div>
            <div className="text-primary-200/80 text-sm mt-1">{formatDate(currentTime)}</div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center py-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-primary-100 text-sm">欢迎使用政务服务</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              您好，欢迎光临
            </h2>
            <p className="text-xl md:text-2xl text-primary-100/90 max-w-2xl mx-auto leading-relaxed">
              请将身份证放置在下方读卡区域，或选择以下功能开始办理
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setActiveFeature(index)}
                  onHoverEnd={() => setActiveFeature(null)}
                  onClick={() => handleFeatureClick(feature.title)}
                  className={`group relative overflow-hidden rounded-3xl p-8 md:p-10 text-left transition-all duration-300 ${
                    activeFeature === index ? `shadow-2xl ${feature.shadow}` : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-primary-100/80 text-base md:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 mt-6 text-white/90 group-hover:translate-x-2 transition-transform duration-300">
                      <span className="text-lg font-medium">立即办理</span>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onClick={handleStartScan}
            className="relative cursor-pointer group"
          >
            <div
              className="relative rounded-3xl px-12 md:px-20 py-8 md:py-10 transition-all duration-300 group-hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px dashed rgba(255,255,255,0.3)',
              }}
            >
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                  >
                    <motion.div
                      initial={{ y: '-100%' }}
                      animate={{ y: '100%' }}
                      transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-cyan-400/10 animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10 flex items-center gap-6 md:gap-8">
                <div className="relative">
                  <motion.div
                    animate={isScanning ? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${
                      isScanning
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50'
                        : 'bg-gradient-to-br from-primary-400 to-primary-600'
                    }`}
                  >
                    <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.8} />
                  </motion.div>
                  {isScanning && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400"
                    />
                  )}
                </div>

                <div>
                  <p className="text-2xl md:text-3xl font-semibold text-white mb-1">
                    {isScanning ? '正在读取身份证信息...' : '请放置身份证'}
                  </p>
                  <p className="text-primary-100/80 text-base md:text-lg">
                    {isScanning ? '请稍候，读卡中' : '将身份证放置于感应区'}
                  </p>
                </div>

                {!isScanning && (
                  <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-primary-200/60 ml-4 animate-pulse" />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-between text-primary-200/70 text-sm md:text-base"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>浦东新区政务服务中心</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>服务时间：周一至周六 09:00-17:00</span>
          </div>
          <div className="hidden md:block">
            <span>如需帮助，请咨询现场工作人员</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
