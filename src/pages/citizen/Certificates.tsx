import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  ShieldCheck,
  Download,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCheck,
  AlertCircle,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Certificate } from '@/types';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function CitizenCertificates() {
  const { certificates, verifyCertificate } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      verifyCertificate(id);
      setVerifyingId(null);
    }, 1500);
  };

  const validCertificates = certificates.filter((c) => c.status === 'valid');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">电子证照中心</h1>
              <p className="mt-1 text-gray-500">
                您的电子证照已在区块链存证，安全可信，可随时查验下载
              </p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-3 shadow-gov">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-gray-500">有效证照</span>
                <span className="text-2xl font-bold text-primary-700">{validCertificates.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {validCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white p-16 text-center shadow-gov"
          >
            <Award className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600">暂无电子证照</h3>
            <p className="mt-2 text-sm text-gray-400">
              办理政务服务事项后，相关证照将在此处展示
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {certificates.map((cert: Certificate, index: number) => (
              <motion.div
                key={cert.id}
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div
                  className={cn(
                    'relative overflow-hidden rounded-3xl shadow-gov transition-all duration-500',
                    'hover:shadow-gov-hover hover:-translate-y-1'
                  )}
                >
                  <div
                    className={cn(
                      'relative p-6',
                      'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800'
                    )}
                  >
                    <div className="absolute inset-0 opacity-5">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                    </div>

                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="h-12 w-12 rounded-full border border-white/30 flex items-center justify-center"
                      >
                        <div className="h-8 w-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-yellow-400" />
                        </div>
                      </motion.div>
                    </div>

                    <div className="relative">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                          <Award className="h-6 w-6 text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{cert.type}</h3>
                          {cert.status === 'valid' ? (
                            <span className="inline-flex items-center text-xs text-green-300">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              有效
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs text-red-300">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {cert.status === 'expired' ? '已过期' : '已撤销'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-white/90">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">持有人</span>
                          <span className="font-medium">{cert.holderName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">证照编号</span>
                          <span className="font-mono text-sm">{cert.certificateNo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">签发机关</span>
                          <span className="text-right text-sm">{cert.issuer}</span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/20 pt-4">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-white/60">签发日期</span>
                            <p className="text-white/90">{cert.issuedAt || '制证中'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-white/60">有效期至</span>
                            <p className="text-white/90">{cert.validUntil || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4">
                    {cert.blockchainHash ? (
                      <div
                        onClick={() => toggleExpand(cert.id)}
                        className="flex cursor-pointer items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trust-500/10 text-trust-500">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-800">区块链存证</span>
                            <p className="text-xs text-gray-500">
                              哈希: ...{cert.blockchainHash.slice(-8)}
                            </p>
                          </div>
                        </div>
                        {expandedId === cert.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">待上链存证</span>
                          <p className="text-xs text-gray-400">证照制发后将自动上链</p>
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {expandedId === cert.id && cert.blockchainHash && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                            {cert.chainTime && (
                              <div>
                                <p className="mb-1 text-xs text-gray-500">上链存证时间</p>
                                <div className="flex items-center space-x-2 rounded-lg bg-gray-50 px-3 py-2">
                                  <Clock className="h-4 w-4 text-primary-500" />
                                  <code className="font-mono text-xs text-gray-700">
                                    {new Date(cert.chainTime).toLocaleString('zh-CN')}
                                  </code>
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="mb-1 text-xs text-gray-500">交易哈希</p>
                              <div className="flex items-center space-x-2 rounded-lg bg-gray-50 px-3 py-2">
                                <code className="flex-1 truncate font-mono text-xs text-gray-700">
                                  {cert.blockchainHash}
                                </code>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleCopyHash(cert.id, cert.blockchainHash)}
                                  className="text-gray-400 hover:text-primary-600"
                                >
                                  {copiedId === cert.id ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            {cert.isVerified ? (
                              <div className="flex items-center space-x-2 rounded-lg bg-green-50 px-3 py-2">
                                <FileCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">已通过区块链验证，证照真实有效</span>
                              </div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleVerify(cert.id)}
                                disabled={verifyingId === cert.id}
                                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-trust-500/10 px-4 py-2 text-trust-500 hover:bg-trust-500/20"
                              >
                                {verifyingId === cert.id ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                      <Sparkles className="h-4 w-4" />
                                    </motion.div>
                                    <span className="text-sm">验证中...</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-sm">点击区块链验证</span>
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-primary-50 px-4 py-2.5 text-primary-600 hover:bg-primary-100"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm font-medium">下载证照</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-gray-50 px-4 py-2.5 text-gray-600 hover:bg-gray-100"
                      >
                        <FileCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">查看详情</span>
                      </motion.button>
                    </div>
                  </div>

                  {cert.isVerified && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>已核验</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
