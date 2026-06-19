import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  CreditCard,
  FileCheck,
  Printer,
  CheckCircle2,
  Minus,
  Plus,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  Home,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Certificate, PrintLog } from '@/types';
import { mockPrintLogs } from '@/data/mockData';

export default function KioskPrint() {
  const navigate = useNavigate();
  const certificates = useAppStore((state) => state.certificates);
  const addPrintLog = useAppStore((state) => state.addPrintLog);
  const printLogs = useAppStore((state) => state.printLogs);

  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());
  const [copiesMap, setCopiesMap] = useState<Record<string, number>>({});
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printComplete, setPrintComplete] = useState(false);
  const [currentPrintIndex, setCurrentPrintIndex] = useState(0);
  const [lastPrintLog, setLastPrintLog] = useState<PrintLog | null>(null);

  const userCertificates = useMemo(() => {
    return certificates.filter((c) => c.status === 'valid' && c.isVerified);
  }, [certificates]);

  useEffect(() => {
    const initialCopies: Record<string, number> = {};
    userCertificates.forEach((c) => {
      initialCopies[c.id] = 1;
    });
    setCopiesMap(initialCopies);
  }, [userCertificates]);

  useEffect(() => {
    if (!isPrinting) return;

    const selectedList = Array.from(selectedCerts);
    if (selectedList.length === 0) return;

    const totalItems = selectedList.reduce(
      (sum, id) => sum + (copiesMap[id] || 1),
      0
    );
    const progressPerItem = 100 / totalItems;

    let currentItem = 0;
    let itemProgress = 0;

    const interval = setInterval(() => {
      itemProgress += 2;

      if (itemProgress >= 100) {
        itemProgress = 0;
        currentItem += 1;
        setCurrentPrintIndex(currentItem);
      }

      const overallProgress = Math.min(
        100,
        currentItem * progressPerItem + (itemProgress / 100) * progressPerItem
      );
      setPrintProgress(overallProgress);

      if (overallProgress >= 100) {
        clearInterval(interval);
        setIsPrinting(false);
        setPrintComplete(true);

        const selectedList = Array.from(selectedCerts);
        const certNames = selectedList
          .map((id) => userCertificates.find((c) => c.id === id)?.type)
          .filter(Boolean)
          .join('、');
        const certNos = selectedList
          .map((id) => userCertificates.find((c) => c.id === id)?.certificateNo)
          .filter(Boolean)
          .join(', ');
        const totalCopiesVal = selectedList.reduce(
          (sum, id) => sum + (copiesMap[id] || 1),
          0
        );

        const newLog: PrintLog = {
          id: `pl-${Date.now()}`,
          kioskId: 'K001',
          idCardNo: '310101********4521',
          certificateType: certNames || '证明材料',
          certificateNo: certNos || '',
          printedAt: new Date().toLocaleString('zh-CN'),
          copies: totalCopiesVal,
          status: 'success',
        };
        addPrintLog(newLog);
        setLastPrintLog(newLog);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isPrinting, selectedCerts, copiesMap, printLogs]);

  const toggleCert = (id: string) => {
    if (isPrinting) return;
    setSelectedCerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (isPrinting) return;
    if (selectedCerts.size === userCertificates.length) {
      setSelectedCerts(new Set());
    } else {
      setSelectedCerts(new Set(userCertificates.map((c) => c.id)));
    }
  };

  const updateCopies = (id: string, delta: number) => {
    if (isPrinting) return;
    setCopiesMap((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(9, (prev[id] || 1) + delta)),
    }));
  };

  const totalCopies = useMemo(() => {
    return Array.from(selectedCerts).reduce(
      (sum, id) => sum + (copiesMap[id] || 1),
      0
    );
  }, [selectedCerts, copiesMap]);

  const handlePrint = () => {
    if (selectedCerts.size === 0 || isPrinting) return;
    setIsPrinting(true);
    setPrintProgress(0);
    setPrintComplete(false);
    setCurrentPrintIndex(0);
  };

  const resetPrint = () => {
    setSelectedCerts(new Set());
    setPrintComplete(false);
    setPrintProgress(0);
    setCurrentPrintIndex(0);
    const initialCopies: Record<string, number> = {};
    userCertificates.forEach((c) => {
      initialCopies[c.id] = 1;
    });
    setCopiesMap(initialCopies);
  };

  const selectedList = Array.from(selectedCerts);

  const getCertStatusBadge = (cert: Certificate) => {
    switch (cert.status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            有效
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            已过期
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            已吊销
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-primary-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen p-8 md:p-10 lg:p-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/kiosk')}
            className="flex items-center gap-2 text-white/90 hover:text-white text-lg transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span>返回首页</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">证明打印</h1>
          <div className="w-[140px]" />
        </motion.header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div
              className="rounded-3xl p-7 md:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-6 h-6 text-cyan-300" />
                <h2 className="text-xl md:text-2xl font-semibold text-white">身份信息</h2>
              </div>

              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="w-24 h-28 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl">
                    <User className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-primary-200/70 text-sm mb-0.5">姓名</p>
                    <p className="text-2xl font-semibold text-white">张伟民</p>
                  </div>
                  <div>
                    <p className="text-primary-200/70 text-sm mb-0.5">身份证号</p>
                    <p className="text-lg text-white font-mono tracking-wide">
                      310101********4521
                    </p>
                  </div>
                  <div>
                    <p className="text-primary-200/70 text-sm mb-0.5">核验状态</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      身份证核验通过
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl p-7 md:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-300" />
                  <h3 className="text-lg font-medium text-white">打印须知</h3>
                </div>
              </div>
              <ul className="space-y-2.5 text-primary-100/90 text-base leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  请选择需要打印的证明及份数
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  每份证明最多可打印 9 份
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  打印完成后请及时取走证件
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  如有问题请咨询现场工作人员
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 flex flex-col"
          >
            <AnimatePresence mode="wait">
              {!isPrinting && !printComplete && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col"
                >
                  <div
                    className="flex-1 rounded-3xl p-6 md:p-8 flex flex-col overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-cyan-300" />
                        <h2 className="text-xl md:text-2xl font-semibold text-white">
                          可打印证明（{userCertificates.length}）
                        </h2>
                      </div>
                      <button
                        onClick={selectAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20"
                      >
                        {selectedCerts.size === userCertificates.length ? (
                          <>
                            <CheckSquare className="w-4 h-4 text-cyan-300" />
                            取消全选
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4" />
                            全选
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-2">
                      <AnimatePresence>
                        {userCertificates.map((cert, index) => {
                          const isSelected = selectedCerts.has(cert.id);
                          const copies = copiesMap[cert.id] || 1;
                          return (
                            <motion.div
                              key={cert.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.01 }}
                              onClick={() => toggleCert(cert.id)}
                              className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-cyan-500/20 to-primary-500/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-cyan-500'
                                      : 'bg-white/10 border border-white/30'
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-xl font-medium text-white">
                                      {cert.type}
                                    </h3>
                                    {getCertStatusBadge(cert)}
                                  </div>
                                  <p className="text-primary-100/80 text-sm mt-1.5 font-mono">
                                    证件编号：{cert.certificateNo}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-primary-200/70">
                                    <span>签发机关：{cert.issuer}</span>
                                    {cert.validUntil && cert.validUntil !== '长期' && (
                                      <span>有效期至：{cert.validUntil.split(' ')[0]}</span>
                                    )}
                                    {cert.validUntil === '长期' && <span>长期有效</span>}
                                  </div>
                                </div>

                                <div
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => updateCopies(cert.id, -1)}
                                    disabled={copies <= 1 || !isSelected}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-white/15 hover:bg-white/25 text-white disabled:opacity-30'
                                        : 'bg-white/5 text-white/30'
                                    }`}
                                  >
                                    <Minus className="w-5 h-5" />
                                  </button>
                                  <span
                                    className={`w-12 text-center text-2xl font-semibold ${
                                      isSelected ? 'text-white' : 'text-white/30'
                                    }`}
                                  >
                                    {copies}
                                  </span>
                                  <button
                                    onClick={() => updateCopies(cert.id, 1)}
                                    disabled={copies >= 9 || !isSelected}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-white/15 hover:bg-white/25 text-white disabled:opacity-30'
                                        : 'bg-white/5 text-white/30'
                                    }`}
                                  >
                                    <Plus className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="text-white/90">
                        已选择{' '}
                        <span className="text-3xl font-bold text-cyan-300 mx-1">
                          {selectedCerts.size}
                        </span>{' '}
                        项，共{' '}
                        <span className="text-3xl font-bold text-cyan-300 mx-1">{totalCopies}</span>{' '}
                        份
                      </div>
                      <button
                        onClick={handlePrint}
                        disabled={selectedCerts.size === 0}
                        className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-xl font-semibold transition-all duration-300 ${
                          selectedCerts.size > 0
                            ? 'bg-gradient-to-r from-cyan-500 to-primary-500 text-white shadow-xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-[1.02]'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <Printer className="w-7 h-7" />
                        开始打印
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {(isPrinting || printComplete) && (
                <motion.div
                  key="printing"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1"
                >
                  <div
                    className="h-full rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isPrinting && (
                        <motion.div
                          key="printing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center"
                        >
                          <div className="relative mb-8">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
                              className="w-28 h-28 rounded-full border-4 border-cyan-400/30 border-t-cyan-400"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Printer className="w-12 h-12 text-cyan-300" />
                            </div>
                          </div>

                          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            正在打印中...
                          </h2>
                          <p className="text-primary-100/80 text-lg mb-8">
                            正在打印第 {currentPrintIndex + 1} / {totalCopies} 份
                          </p>

                          <div className="w-full max-w-md space-y-3">
                            <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${printProgress}%` }}
                                className="h-full bg-gradient-to-r from-cyan-400 to-primary-400 rounded-full relative overflow-hidden"
                              >
                                <div className="absolute inset-0 animate-shimmer" />
                              </motion.div>
                            </div>
                            <div className="flex justify-between text-primary-100/80 text-base">
                              <span>打印进度</span>
                              <span className="text-cyan-300 font-semibold text-lg">
                                {Math.round(printProgress)}%
                              </span>
                            </div>
                          </div>

                          {selectedList.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-md">
                              {selectedList.map((certId) => {
                                const cert = userCertificates.find((c) => c.id === certId);
                                return (
                                  <div
                                    key={certId}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-sm"
                                  >
                                    {cert?.type} × {copiesMap[certId]}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {printComplete && (
                        <motion.div
                          key="complete"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                            className="relative mb-8"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                            >
                              <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2} />
                            </motion.div>
                            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-300 animate-pulse" />
                          </motion.div>

                          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            打印完成！
                          </h2>
                          <p className="text-primary-100/80 text-lg mb-8">
                            请在出纸口取走您的证明材料
                          </p>

                          {lastPrintLog && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="w-full max-w-md p-5 rounded-2xl bg-white/5 border border-white/10 text-left"
                            >
                              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-cyan-300" />
                                打印日志
                              </h3>
                              <div className="space-y-2 text-base">
                                <div className="flex justify-between">
                                  <span className="text-primary-200/70">终端编号</span>
                                  <span className="text-white font-mono">{lastPrintLog.kioskId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-primary-200/70">证件类型</span>
                                  <span className="text-white">{lastPrintLog.certificateType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-primary-200/70">打印份数</span>
                                  <span className="text-white">{lastPrintLog.copies} 份</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-primary-200/70">打印时间</span>
                                  <span className="text-white">{lastPrintLog.printedAt}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-primary-200/70">状态</span>
                                  <span className="inline-flex items-center gap-1 text-emerald-300">
                                    <CheckCircle2 className="w-4 h-4" />
                                    打印成功
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <div className="flex items-center gap-4 mt-10">
                            <button
                              onClick={resetPrint}
                              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-lg font-medium transition-colors border border-white/20"
                            >
                              <Printer className="w-5 h-5" />
                              继续打印
                            </button>
                            <button
                              onClick={() => navigate('/kiosk')}
                              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-primary-500 text-white text-lg font-semibold shadow-xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-[1.02] transition-all"
                            >
                              <Home className="w-5 h-5" />
                              返回首页
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
