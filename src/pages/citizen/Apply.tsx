import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Upload as UploadIcon,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { MaterialItem, NlpAnalysis, PrecheckResult, ServiceItem } from '@/types';
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

const serviceList: ServiceItem[] = [
  { id: 's001', name: '个体工商户营业执照办理', category: '企业登记', department: '市场监督管理局', requiredMaterials: ['身份证原件', '经营场所证明', '个体工商户登记申请书'], isParallel: false, processingDays: 3, description: '' },
  { id: 's002', name: '企业法人营业执照设立登记', category: '企业登记', department: '市场监督管理局', requiredMaterials: ['公司章程', '法人身份证', '验资报告', '住所证明'], isParallel: true, processingDays: 5, description: '' },
  { id: 's003', name: '个人社保缴纳登记', category: '社会保障', department: '人力资源和社会保障局', requiredMaterials: ['身份证', '户口本', '就业登记证'], isParallel: false, processingDays: 2, description: '' },
  { id: 's004', name: '社保卡办理', category: '社会保障', department: '人力资源和社会保障局', requiredMaterials: ['身份证', '一寸照片', '社保登记表'], isParallel: false, processingDays: 15, description: '' },
  { id: 's005', name: '不动产首次登记', category: '不动产', department: '自然资源和规划局', requiredMaterials: ['身份证', '不动产权属来源证明', '契税完税证明', '房屋测绘报告'], isParallel: true, processingDays: 7, description: '' },
  { id: 's006', name: '建设工程规划许可证', category: '工程建设', department: '住房和城乡建设局', requiredMaterials: ['建设项目批准文件', '建设用地规划许可证', '设计方案审查意见', '施工图'], isParallel: true, processingDays: 10, description: '' },
  { id: 's007', name: '医师执业注册', category: '医疗卫生', department: '卫生健康委员会', requiredMaterials: ['身份证', '医师资格证', '健康体检表', '聘用证明'], isParallel: false, processingDays: 5, description: '' },
  { id: 's008', name: '户口迁移审批', category: '户籍管理', department: '公安局', requiredMaterials: ['身份证', '户口本', '迁移申请书', '迁入地同意证明'], isParallel: false, processingDays: 7, description: '' },
  { id: 's009', name: '车辆购置税申报', category: '税务', department: '税务局', requiredMaterials: ['身份证', '车辆合格证', '购车发票', '保险单'], isParallel: false, processingDays: 1, description: '' },
  { id: 's010', name: '适龄儿童入学报名', category: '教育', department: '教育局', requiredMaterials: ['户口本', '房产证', '出生证明', '预防接种证'], isParallel: true, processingDays: 15, description: '' },
];

const steps = [
  { id: 1, name: '选择事项', icon: FolderOpen },
  { id: 2, name: '填写表单', icon: FileText },
  { id: 3, name: '上传材料', icon: Upload },
  { id: 4, name: '智能预审', icon: Brain },
  { id: 5, name: '提交申请', icon: Send },
];

const mockNlpComplete: NlpAnalysis = {
  isSemanticComplete: true,
  missingInfo: [],
  confidence: 0.96,
};

const mockNlpIncomplete: NlpAnalysis = {
  isSemanticComplete: false,
  missingInfo: ['经营者签字'],
  confidence: 0.82,
};

export default function CitizenApply() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addApplication, currentUser, applications } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMaterialId, setUploadingMaterialId] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
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
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const selectedService = useMemo(
    () => serviceList.find((s) => s.id === selectedServiceId) || null,
    [selectedServiceId]
  );

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return serviceList;
    return serviceList.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const serviceName = searchParams.get('service');
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
    if (serviceName) {
      const found = serviceList.find(
        (s) => s.name.includes(serviceName) || s.category === serviceName
      );
      if (found) {
        setSelectedServiceId(found.id);
        setSelectedCategory(found.category);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedService) {
      const newMaterials: MaterialItem[] = selectedService.requiredMaterials.map((name, index) => ({
        id: `mat-${selectedService.id}-${index}`,
        name,
        fileName: '',
        isComplete: false,
        missingTips: `请上传${name}`,
      }));
      setMaterials(newMaterials);
      setShowPrecheckResult(false);
      setOcrProgress(0);
    }
  }, [selectedServiceId, selectedService]);

  const precheckResult: PrecheckResult = useMemo(() => {
    const missingMaterials: string[] = [];
    const missingInfo: string[] = [];
    const suggestions: string[] = [];

    materials.forEach((m) => {
      if (!m.isComplete) {
        if (!m.fileName) {
          missingMaterials.push(m.name);
          suggestions.push(`请上传${m.name}的扫描件或照片`);
        } else if (m.nlpResult && !m.nlpResult.isSemanticComplete) {
          missingInfo.push(`${m.name}：${m.nlpResult.missingInfo.join('、')}`);
          suggestions.push(`请补全${m.name}中的缺失信息后重新上传`);
        }
      }
    });

    return {
      isComplete: missingMaterials.length === 0 && missingInfo.length === 0,
      missingMaterials,
      missingInfo,
      suggestions,
    };
  }, [materials]);

  useEffect(() => {
    if (currentStep === 4 && !showPrecheckResult && !isOcrProcessing) {
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
          return prev + 4;
        });
      }, 80);
      return () => clearInterval(timer);
    }
  }, [currentStep, showPrecheckResult, isOcrProcessing]);

  const simulateUpload = (materialId: string, fileName: string) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === materialId) {
          return {
            ...m,
            fileName,
            isComplete: true,
            missingTips: undefined,
            ocrResult: `识别成功：${fileName} 的内容已通过OCR提取`,
            nlpResult: mockNlpComplete,
          };
        }
        return m;
      })
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const incomplete = materials.find((m) => !m.isComplete);
      if (incomplete) {
        simulateUpload(incomplete.id, file.name);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (uploadingMaterialId) {
        simulateUpload(uploadingMaterialId, file.name);
        setUploadingMaterialId(null);
      } else {
        const incomplete = materials.find((m) => !m.isComplete);
        if (incomplete) {
          simulateUpload(incomplete.id, file.name);
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = (materialId?: string) => {
    if (materialId) {
      setUploadingMaterialId(materialId);
    } else {
      setUploadingMaterialId(null);
    }
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!currentUser || !selectedService) return;

    const caseNo = `YW${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;
    const days = selectedService.processingDays;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);

    const assignees = [
      { id: 'clerk-001', name: '李晓婷', department: selectedService.department, role: 'clerk' as const },
    ];
    if (selectedService.isParallel) {
      assignees.push({ id: 'clerk-002', name: '王建国', department: '住房和城乡建设局', role: 'clerk' as const });
    }

    addApplication({
      caseNo,
      serviceItemId: selectedService.id,
      serviceItemName: selectedService.name,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantPhone: currentUser.phone,
      materials,
      status: precheckResult.isComplete ? 'submitted' : 'draft',
      precheckResult,
      assignees,
      currentStep: 5,
      flowNodes: [
        {
          id: 'node-submit',
          name: '提交申请',
          type: 'serial' as const,
          status: 'completed' as const,
          assignee: currentUser.name,
          assigneeName: currentUser.name,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: 'node-review',
          name: '窗口受理',
          type: 'serial' as const,
          status: 'pending' as const,
          assignee: 'clerk-001',
          assigneeName: '李晓婷',
        },
      ],
      deadline: deadline.toLocaleDateString('zh-CN'),
      warningLevel: 'none' as const,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      navigate('/citizen/applications');
    }, 2000);
  };

  const resetPrecheck = () => {
    setShowPrecheckResult(false);
    setOcrProgress(0);
    setCurrentStep(3);
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedServiceId !== null;
    if (currentStep === 2) return formData.name && formData.idCard && formData.phone;
    if (currentStep === 3) return materials.some((m) => m.isComplete);
    if (currentStep === 4) return showPrecheckResult;
    return true;
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl shadow-green-500/30"
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">提交成功！</h2>
          <p className="text-gray-500">您的{selectedService?.name}申请已提交，即将跳转到我的办件...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileSelect}
      />
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
                      {filteredServices.map((service) => (
                        <motion.div
                          key={service.id}
                          whileHover={{ y: -4, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedServiceId(service.id)}
                          className={cn(
                            'cursor-pointer rounded-xl border-2 p-4 transition-all',
                            selectedServiceId === service.id
                              ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/20'
                              : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{service.name}</h4>
                              <p className="mt-1 text-sm text-gray-500">{service.department}</p>
                            </div>
                            {service.isParallel && (
                              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600">
                                并联审批
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center text-sm text-gray-500">
                            <span>承诺办结：{service.processingDays} 个工作日</span>
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
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                      上传申请材料 <span className="text-sm font-normal text-gray-400">（共 {materials.length} 项）</span>
                    </h3>

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
                      <button
                        onClick={() => openFilePicker()}
                        className="mt-4 rounded-xl bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600"
                      >
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
                              {material.missingTips && !material.isComplete && (
                                <p className="text-sm text-red-500">
                                  <AlertCircle className="mr-1 inline h-3 w-3" />
                                  {material.missingTips}
                                </p>
                              )}
                              {material.ocrResult && material.nlpResult && material.isComplete && (
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
                          <div className="flex items-center gap-2">
                            {!material.isComplete && (
                              <button
                                onClick={() => openFilePicker(material.id)}
                                className="flex items-center gap-1 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600 transition-colors"
                              >
                                <UploadIcon className="h-4 w-4" />
                                上传
                              </button>
                            )}
                            {material.fileName && (
                              <button
                                onClick={() =>
                                  setMaterials((prev) =>
                                    prev.map((m) =>
                                      m.id === material.id
                                        ? { ...m, fileName: '', isComplete: false, missingTips: `请上传${m.name}`, ocrResult: undefined, nlpResult: undefined }
                                        : m
                                    )
                                  )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
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
                            <span className="font-medium text-primary-600">{Math.min(100, ocrProgress)}%</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-primary-100">
                            <motion.div
                              animate={{ width: `${Math.min(100, ocrProgress)}%` }}
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
                          precheckResult.isComplete
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-amber-200 bg-amber-50/50'
                        )}
                      >
                        <div className="mb-6 flex items-center space-x-4">
                          <div
                            className={cn(
                              'flex h-14 w-14 items-center justify-center rounded-full',
                              precheckResult.isComplete
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                : 'bg-gradient-to-br from-amber-500 to-orange-500'
                            )}
                          >
                            {precheckResult.isComplete ? (
                              <FileCheck className="h-7 w-7 text-white" />
                            ) : (
                              <AlertCircle className="h-7 w-7 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">
                              {precheckResult.isComplete ? '预审通过！' : '一次性缺件告知'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {precheckResult.isComplete
                                ? '您的申请材料齐全，可以提交'
                                : '请根据以下提示补正材料后重新提交'}
                            </p>
                          </div>
                        </div>

                        {precheckResult.missingMaterials.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold text-gray-700">缺少的材料：</h5>
                            <ul className="space-y-2">
                              {precheckResult.missingMaterials.map((item, i) => (
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

                        {precheckResult.missingInfo.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold text-gray-700">材料信息不完整：</h5>
                            <ul className="space-y-2">
                              {precheckResult.missingInfo.map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (precheckResult.missingMaterials.length + i) * 0.1 }}
                                  className="flex items-center space-x-2 rounded-lg bg-orange-50 px-4 py-2 text-orange-700"
                                >
                                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                  <span>{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {precheckResult.suggestions.length > 0 && (
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold text-gray-700">补正建议：</h5>
                            <ul className="space-y-2">
                              {precheckResult.suggestions.map((item, i) => (
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

                        {!precheckResult.isComplete && (
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
                            <span className="text-gray-800 font-medium">
                              {selectedService?.name || '未选择'}
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
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  已上传
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-500">
                                  <AlertCircle className="h-4 w-4" />
                                  待补正
                                </span>
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
                    disabled={!precheckResult.isComplete}
                    className={cn(
                      'flex items-center space-x-2 rounded-xl px-8 py-3 shadow-md transition-all',
                      precheckResult.isComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
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
