import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Scan,
  Brain,
  FileText,
  ListTodo,
  Send,
  RefreshCw,
  X,
  File,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { MaterialItem, NlpAnalysis, PrecheckResult } from '@/types';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', name: '全部事项', icon: FolderOpen },
  { id: '企业登记', name: '企业登记', icon: FileText },
  { id: '社会保障', name: '社会保障', icon: ListTodo },
  { id: '不动产', name: '不动产', icon: FileText },
  { id: '工程建设', name: '工程建设', icon: FileText },
  { id: '医疗卫生', name: '医疗卫生', icon: FileText },
  { id: '户籍管理', name: '户籍管理', icon: FileText },
  { id: '税务', name: '税务', icon: FileText },
  { id: '教育', name: '教育', icon: FileText },
];

const steps = [
  { id: 1, name: '选择事项', icon: FolderOpen },
  { id: 2, name: '填写表单', icon: FileText },
  { id: 3, name: '上传材料', icon: Upload },
  { id: 4, name: '智能预审', icon: Brain },
  { id: 5, name: '提交申请', icon: Send },
];

const mockNlpResult: NlpAnalysis = {
  isSemanticComplete: true,
  missingInfo: [],
  confidence: 0.96,
};

const mockPrecheckResult: PrecheckResult = {
  isComplete: false,
  missingMaterials: ['契税完税证明'],
  missingInfo: ['个体工商户登记申请书缺少经营者签字'],
  suggestions: [
    '请在登记申请书右下角经营者签名处签字后重新上传',
    '请先前往税务局或通过电子税务局缴纳契税，获取完税证明后上传',
  ],
};

export default function CitizenApply() {
  const { applications, addApplication, currentUser } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [showPrecheckResult, setShowPrecheckResult] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    idCard: currentUser?.idCard || '',
    phone: currentUser?.phone || '',
    address: '',
  });

  const [materials, setMaterials] = useState<MaterialItem[]>([
    {
      id: 'm1',
      name: '身份证原件',
      fileName: '身份证正面.jpg',
      ocrResult: '姓名：张伟民，身份证号：310101198503124521',
      nlpResult: mockNlpResult,
      isComplete: true,
    },
    {
      id: 'm2',
      name: '经营场所证明',
      fileName: '租赁合同.pdf',
      ocrResult: '出租方：上海XX商业管理有限公司，承租方：张伟民',
      nlpResult: mockNlpResult,
      isComplete: true,
    },
    {
      id: 'm3',
      name: '个体工商户登记申请书',
      fileName: '登记申请书.pdf',
      ocrResult: '字号名称：上海民健便民超市，经营场所：浦东新区张江路168号',
      nlpResult: { isSemanticComplete: false, missingInfo: ['经营者签字'], confidence: 0.82 },
      isComplete: false,
      missingTips: '缺少经营者签字栏',
    },
    {
      id: 'm4',
      name: '契税完税证明',
      fileName: '',
      isComplete: false,
      missingTips: '请上传契税完税证明',
    },
  ]);

  useEffect(() => {
    if (currentStep === 4 && !showPrecheckResult) {
      setIsOcrProcessing(true);
      setOcrProgress(0);
      const timer = setInterval(() => {
        setOcrProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsOcrProcessing(false);
            setShowPrecheckResult(true);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [currentStep, showPrecheckResult]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const incompleteMaterial = materials.find((m) => !m.isComplete && !m.fileName);
      if (incompleteMaterial) {
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === incompleteMaterial.id
              ? { ...m, fileName: file.name, isComplete: true, missingTips: undefined }
              : m
          )
        );
      }
    }
  };

  const handleSubmit = () => {
    if (currentUser) {
      addApplication({
        caseNo: `YW${Date.now().toString().slice(-8)}`,
        serviceItemId: 's001',
        serviceItemName: selectedService || '个体工商户营业执照办理',
        applicantId: currentUser.id,
        applicantName: currentUser.name,
        applicantPhone: currentUser.phone,
        materials,
        status: showPrecheckResult && mockPrecheckResult.isComplete ? 'submitted' : 'draft',
        precheckResult: mockPrecheckResult,
        assignees: [],
        currentStep: currentStep,
        flowNodes: [],
        deadline: '',
      });
    }
  };

  const resetPrecheck = () => {
    setShowPrecheckResult(false);
    setOcrProgress(0);
    setCurrentStep(3);
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedService !== null;
    if (currentStep === 2) return formData.name && formData.idCard && formData.phone;
    if (currentStep === 3) return materials.filter((m) => m.isComplete).length >= 2;
    if (currentStep === 4) return showPrecheckResult;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-primary-700">事项申请</h1>
          <p className="mt-1 text-gray-500">在线办理政务服务事项，智能预审让您少跑腿</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl bg-white p-6 shadow-gov"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={currentStep >= step.id ? { scale: 1.1 } : {}}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300',
                      currentStep > step.id
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : currentStep === step.id
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 animate-pulse-slow'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'mt-2 text-sm font-medium',
                      currentStep >= step.id ? 'text-primary-700' : 'text-gray-400'
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-2 mb-6 h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl bg-white p-4 shadow-gov">
              <h3 className="mb-4 px-2 text-lg font-semibold text-gray-800">事项分类</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'flex w-full items-center space-x-3 rounded-xl px-3 py-3 text-left transition-all',
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'text-gray-600 hover:bg-primary-50'
                    )}
                  >
                    <cat.icon className="h-5 w-5" />
                    <span className="font-medium">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl bg-white p-6 shadow-gov">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">请选择办理事项</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { id: 's001', name: '个体工商户营业执照办理', dept: '市场监督管理局', days: 3 },
                        { id: 's002', name: '企业法人营业执照设立登记', dept: '市场监督管理局', days: 5, parallel: true },
                        { id: 's003', name: '个人社保缴纳登记', dept: '人力资源和社会保障局', days: 2 },
                        { id: 's004', name: '社保卡办理', dept: '人力资源和社会保障局', days: 15 },
                      ].map((service) => (
                        <motion.div
                          key={service.id}
                          whileHover={{ y: -4, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedService(service.id)}
                          className={cn(
                            'cursor-pointer rounded-xl border-2 p-4 transition-all',
                            selectedService === service.id
                              ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/20'
                              : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{service.name}</h4>
                              <p className="mt-1 text-sm text-gray-500">{service.dept}</p>
                            </div>
                            {service.parallel && (
                              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600">
                                并联审批
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center text-sm text-gray-500">
                            <span>承诺办结：{service.days} 个工作日</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">填写申请信息</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'name', label: '申请人姓名', placeholder: '请输入姓名' },
                        { key: 'idCard', label: '身份证号', placeholder: '请输入18位身份证号' },
                        { key: 'phone', label: '联系电话', placeholder: '请输入手机号' },
                        { key: 'address', label: '联系地址', placeholder: '请输入详细地址' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            {field.label}
                            <span className="ml-1 text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={(formData as Record<string, string>)[field.key]}
                            onChange={(e) =>
                              setFormData({ ...formData, [field.key]: e.target.value })
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">上传申请材料</h3>

                    <motion.div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      whileHover={{ scale: 1.01 }}
                      animate={isDragging ? { scale: 1.02, borderColor: '#3B82F6' } : {}}
                      className={cn(
                        'mb-6 rounded-2xl border-2 border-dashed p-8 text-center transition-all',
                        isDragging
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      )}
                    >
                      <Upload className="mx-auto mb-3 h-12 w-12 text-primary-500" />
                      <p className="font-medium text-gray-700">拖拽文件到此处上传</p>
                      <p className="mt-1 text-sm text-gray-500">支持 PDF、JPG、PNG 格式，单个文件不超过 10MB</p>
                      <button className="mt-4 rounded-xl bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600">
                        选择文件
                      </button>
                    </motion.div>

                    <div className="space-y-3">
                      {materials.map((material, index) => (
                        <motion.div
                          key={material.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            'flex items-center justify-between rounded-xl border p-4 transition-all',
                            material.isComplete
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-red-200 bg-red-50/50'
                          )}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg',
                                material.isComplete ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              )}
                            >
                              {material.isComplete ? (
                                <File className="h-5 w-5" />
                              ) : (
                                <AlertCircle className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-800">{material.name}</span>
                                {material.isComplete ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              {material.fileName && (
                                <p className="text-sm text-gray-500">已上传：{material.fileName}</p>
                              )}
                              {material.missingTips && (
                                <p className="text-sm text-red-500">
                                  <AlertCircle className="mr-1 inline h-3 w-3" />
                                  {material.missingTips}
                                </p>
                              )}
                              {material.ocrResult && material.nlpResult && (
                                <div className="mt-2 flex items-center space-x-3 text-xs">
                                  <span className="flex items-center text-blue-600">
                                    <Scan className="mr-1 h-3 w-3" />
                                    OCR已识别
                                  </span>
                                  <span className="flex items-center text-purple-600">
                                    <Brain className="mr-1 h-3 w-3" />
                                    NLP置信度 {Math.round(material.nlpResult.confidence * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {material.fileName && (
                            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">智能预审</h3>

                    {!showPrecheckResult ? (
                      <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-8">
                        <div className="flex items-center justify-center space-x-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="rounded-full bg-gradient-to-br from-primary-500 to-purple-500 p-3"
                          >
                            <Sparkles className="h-8 w-8 text-white" />
                          </motion.div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">AI 正在智能审核您的材料...</h4>
                            <p className="text-sm text-gray-500">OCR识别 + NLP语义分析 + 材料完整性校验</p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="text-gray-600">预审进度</span>
                            <span className="font-medium text-primary-600">{ocrProgress}%</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-primary-100">
                            <motion.div
                              animate={{ width: `${ocrProgress}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                            />
                          </div>
                          <div className="mt-4 flex justify-between text-xs text-gray-500">
                            <span className={ocrProgress >= 30 ? 'text-primary-600' : ''}>图像OCR识别</span>
                            <span className={ocrProgress >= 60 ? 'text-primary-600' : ''}>NLP语义分析</span>
                            <span className={ocrProgress >= 90 ? 'text-primary-600' : ''}>完整性校验</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          'rounded-2xl border p-6',
                          mockPrecheckResult.isComplete
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-amber-200 bg-amber-50/50'
                        )}
                      >
                        <div className="mb-6 flex items-center space-x-4">
                          <div
                            className={cn(
                              'flex h-14 w-14 items-center justify-center rounded-full',
                              mockPrecheckResult.isComplete
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                : 'bg-gradient-to-br from-amber-500 to-orange-500'
                            )}
                          >
                            {mockPrecheckResult.isComplete ? (
                              <FileCheck className="h-7 w-7 text-white" />
                            ) : (
                              <AlertCircle className="h-7 w-7 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">
                              {mockPrecheckResult.isComplete ? '预审通过！' : '一次性缺件告知'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {mockPrecheckResult.isComplete
                                ? '您的申请材料齐全，可以提交'
                                : '请根据以下提示补正材料后重新提交'}
                            </p>
                          </div>
                        </div>

                        {mockPrecheckResult.missingMaterials.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold text-gray-700">缺少的材料：</h5>
                            <ul className="space-y-2">
                              {mockPrecheckResult.missingMaterials.map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-center space-x-2 rounded-lg bg-red-50 px-4 py-2 text-red-700"
                                >
                                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                  <span>{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {mockPrecheckResult.missingInfo.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold text-gray-700">材料信息不完整：</h5>
                            <ul className="space-y-2">
                              {mockPrecheckResult.missingInfo.map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (mockPrecheckResult.missingMaterials.length + i) * 0.1 }}
                                  className="flex items-center space-x-2 rounded-lg bg-orange-50 px-4 py-2 text-orange-700"
                                >
                                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                  <span>{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {mockPrecheckResult.suggestions.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold text-gray-700">补正建议：</h5>
                            <ul className="space-y-2">
                              {mockPrecheckResult.suggestions.map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-700"
                                >
                                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                  <span>{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!mockPrecheckResult.isComplete && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={resetPrecheck}
                            className="mt-4 flex items-center space-x-2 rounded-xl bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600"
                          >
                            <RefreshCw className="h-5 w-5" />
                            <span>补正后重新预审</span>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">确认提交</h3>
                    <div className="space-y-4">
                      <div className="rounded-xl bg-gray-50 p-4">
                        <h4 className="mb-2 font-semibold text-gray-700">申请信息</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">申请人：</span>
                            <span className="text-gray-800">{formData.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">联系电话：</span>
                            <span className="text-gray-800">{formData.phone}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">申请事项：</span>
                            <span className="text-gray-800">
                              {selectedService || '个体工商户营业执照办理'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-4">
                        <h4 className="mb-2 font-semibold text-gray-700">材料清单</h4>
                        <div className="space-y-2">
                          {materials.map((m) => (
                            <div key={m.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{m.name}</span>
                              {m.isComplete ? (
                                <span className="text-green-600">已上传</span>
                              ) : (
                                <span className="text-red-500">待补正</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <p>
                          请确认所填信息和上传材料真实有效，提交后将进入正式审批流程。如有虚假信息，将承担相应法律责任。
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
                <motion.button
                  whileHover={currentStep > 1 ? { x: -4 } : {}}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={cn(
                    'flex items-center space-x-2 rounded-xl px-6 py-3 transition-all',
                    currentStep === 1
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>上一步</span>
                </motion.button>

                {currentStep < 5 ? (
                  <motion.button
                    whileHover={canProceed() ? { x: 4 } : {}}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className={cn(
                      'flex items-center space-x-2 rounded-xl px-6 py-3 transition-all',
                      canProceed()
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40'
                        : 'cursor-not-allowed bg-gray-200 text-gray-400'
                    )}
                  >
                    <span>下一步</span>
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3 text-white shadow-md shadow-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/40"
                  >
                    <Send className="h-5 w-5" />
                    <span>提交申请</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
