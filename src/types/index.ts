export type UserRole = 'citizen' | 'clerk' | 'manager' | 'supervisor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  idCard?: string;
  department?: string;
  avatar?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  department: string;
  requiredMaterials: string[];
  isParallel: boolean;
  processingDays: number;
  description: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'prechecking'
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'completed';

export type WarningLevel = 'none' | 'yellow' | 'red';

export interface Assignee {
  id: string;
  name: string;
  department?: string;
  role?: UserRole;
}

export interface NlpAnalysis {
  isSemanticComplete: boolean;
  missingInfo: string[];
  confidence: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  fileName: string;
  ocrResult?: string;
  nlpResult?: NlpAnalysis;
  isComplete: boolean;
  missingTips?: string;
}

export interface PrecheckResult {
  isComplete: boolean;
  missingMaterials: string[];
  missingInfo: string[];
  suggestions: string[];
}

export type FlowNodeStatus = 'pending' | 'processing' | 'completed' | 'skipped';

export type FlowNodeType = 'serial' | 'parallel';

export interface FlowNode {
  id: string;
  name: string;
  type: FlowNodeType;
  assignee?: string;
  assigneeName?: string;
  status: FlowNodeStatus;
  startedAt?: string;
  completedAt?: string;
  comment?: string;
  parallelGroupId?: string;
}

export interface ParallelGroup {
  id: string;
  name: string;
  nodeIds: string[];
}

export interface Application {
  id: string;
  caseNo: string;
  serviceItemId: string;
  serviceItemName: string;
  applicantId: string;
  applicantName: string;
  applicantPhone: string;
  materials: MaterialItem[];
  status: ApplicationStatus;
  precheckResult?: PrecheckResult;
  assignees: Assignee[];
  currentStep: number;
  flowNodes: FlowNode[];
  createdAt: string;
  deadline: string;
  warningLevel?: WarningLevel;
  parallelGroups?: ParallelGroup[];
}

export type CertificateStatus = 'valid' | 'expired' | 'revoked';

export interface Certificate {
  id: string;
  certificateNo: string;
  type: string;
  holderName: string;
  applicationId: string;
  issuedAt: string;
  validUntil: string;
  issuer: string;
  blockchainTx?: string;
  blockchainHash?: string;
  isVerified: boolean;
  status: CertificateStatus;
}

export type BlockchainDataType = 'certificate' | 'application' | 'operation';

export interface BlockchainRecord {
  id: string;
  hash: string;
  previousHash: string;
  dataType: BlockchainDataType;
  dataRef: string;
  timestamp: string;
  nodeSignature: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  applicationId: string;
  rating: Rating;
  tags: string[];
  comment: string;
  createdAt: string;
  isBadReview: boolean;
  ticketId?: string;
}

export type TicketStatus = 'pending' | 'processing' | 'verified' | 'closed';

export interface RectificationTicket {
  id: string;
  reviewId: string;
  applicationId: string;
  status: TicketStatus;
  assignee: string;
  assigneeName: string;
  measures: string;
  callbackRecord?: string;
  createdAt: string;
  closedAt?: string;
}

export type WarningLevelType = 'yellow' | 'red';

export type WarningStatus = 'pending' | 'handled' | 'closed';

export interface Warning {
  id: string;
  applicationId: string;
  caseNo: string;
  level: WarningLevelType;
  triggeredAt: string;
  deadline: string;
  overDays: number;
  assignee: string;
  assigneeName: string;
  department: string;
  status: WarningStatus;
  handler?: string;
  handleComment?: string;
  handledAt?: string;
}

export type NotificationType = 'sms' | 'inapp' | 'push';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  isRead: boolean;
  sentAt: string;
}

export type PrintStatus = 'success' | 'failed';

export interface PrintLog {
  id: string;
  kioskId: string;
  idCardNo: string;
  certificateType: string;
  certificateNo: string;
  printedAt: string;
  copies: number;
  status: PrintStatus;
  failureReason?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface HotServiceItem {
  name: string;
  count: number;
}

export interface DepartmentStat {
  dept: string;
  count: number;
  avgDays: number;
  rate: number;
}

export interface TrendDataItem {
  date: string;
  count: number;
}

export interface DashboardStats {
  todayCount: number;
  totalCount: number;
  avgProcessingDays: number;
  satisfactionRate: number;
  pendingCount: number;
  warningCount: number;
  hotServices: HotServiceItem[];
  byDepartment: DepartmentStat[];
  trendData: TrendDataItem[];
}
