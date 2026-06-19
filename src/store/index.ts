import { create } from 'zustand';
import {
  User,
  Application,
  Warning,
  Certificate,
  Review,
  Notification,
  ApplicationStatus,
  PrintLog,
  BlockchainRecord,
  FlowNode,
} from '@/types';
import { mockData } from '@/data/mockData';

interface AuthState {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: User['role']) => void;
}

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  setCurrentApplication: (application: Application | null) => void;
  addApplication: (application: Omit<Application, 'id' | 'createdAt'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  updateApplicationFlowNode: (appId: string, nodeId: string, updates: Partial<FlowNode>) => void;
}

interface WarningState {
  warnings: Warning[];
  setWarnings: (warnings: Warning[]) => void;
  handleWarning: (id: string, handler: string, comment: string) => void;
}

interface CertificateState {
  certificates: Certificate[];
  setCertificates: (certificates: Certificate[]) => void;
  addCertificate: (certificate: Certificate) => void;
  verifyCertificate: (id: string) => void;
}

interface BlockchainState {
  blockchainRecords: BlockchainRecord[];
  addBlockchainRecord: (record: Omit<BlockchainRecord, 'id' | 'timestamp' | 'hash' | 'previousHash' | 'nodeSignature'>) => void;
}

interface ReviewState {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Omit<Review, 'id'>) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'sentAt' | 'isRead'>) => void;
}

interface PrintLogState {
  printLogs: PrintLog[];
  addPrintLog: (log: PrintLog) => void;
}

type AppStore = AuthState &
  ApplicationState &
  WarningState &
  CertificateState &
  BlockchainState &
  ReviewState &
  NotificationState &
  PrintLogState;

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: mockData.currentUser ?? null,
  applications: mockData.applications ?? [],
  currentApplication: null,
  warnings: mockData.warnings ?? [],
  certificates: mockData.certificates ?? [],
  blockchainRecords: mockData.blockchainRecords ?? [],
  reviews: mockData.reviews ?? [],
  notifications: mockData.notifications ?? [],
  unreadCount: mockData.notifications?.filter((n) => !n.isRead).length ?? 0,
  printLogs: mockData.printLogs ?? [],

  login: (username: string, password: string) => {
    const user = mockData.users?.find(
      (u) => u.username === username && password === '123456'
    );
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null });
  },

  switchRole: (role: User['role']) => {
    const { currentUser } = get();
    if (currentUser) {
      set({ currentUser: { ...currentUser, role } });
    }
  },

  setCurrentApplication: (application: Application | null) => {
    set({ currentApplication: application });
  },

  addApplication: (application: Omit<Application, 'id' | 'createdAt'>) => {
    const newApp: Application = {
      ...application,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      applications: [newApp, ...state.applications],
    }));
  },

  updateApplicationStatus: (id: string, status: ApplicationStatus) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
      currentApplication:
        state.currentApplication?.id === id
          ? { ...state.currentApplication, status }
          : state.currentApplication,
    }));
  },

  updateApplication: (id: string, updates: Partial<Application>) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      ),
      currentApplication:
        state.currentApplication?.id === id
          ? { ...state.currentApplication, ...updates }
          : state.currentApplication,
    }));
  },

  updateApplicationFlowNode: (appId: string, nodeId: string, updates: Partial<FlowNode>) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === appId
          ? {
              ...app,
              flowNodes: app.flowNodes.map((node) =>
                node.id === nodeId ? { ...node, ...updates } : node
              ),
            }
          : app
      ),
      currentApplication:
        state.currentApplication?.id === appId
          ? {
              ...state.currentApplication,
              flowNodes: state.currentApplication.flowNodes.map((node) =>
                node.id === nodeId ? { ...node, ...updates } : node
              ),
            }
          : state.currentApplication,
    }));
  },

  setWarnings: (warnings: Warning[]) => {
    set({ warnings });
  },

  handleWarning: (id: string, handler: string, comment: string) => {
    set((state) => ({
      warnings: state.warnings.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'handled',
              handler,
              handleComment: comment,
              handledAt: new Date().toISOString(),
            }
          : w
      ),
    }));
  },

  setCertificates: (certificates: Certificate[]) => {
    set({ certificates });
  },

  addCertificate: (certificate: Certificate) => {
    set((state) => ({
      certificates: [certificate, ...state.certificates],
    }));
  },

  verifyCertificate: (id: string) => {
    set((state) => ({
      certificates: state.certificates.map((c) =>
        c.id === id ? { ...c, isVerified: true } : c
      ),
    }));
  },

  addBlockchainRecord: (record: Omit<BlockchainRecord, 'id' | 'timestamp' | 'hash' | 'previousHash' | 'nodeSignature'>) => {
    const lastRecord = get().blockchainRecords[get().blockchainRecords.length - 1];
    const previousHash = lastRecord?.hash || '0'.repeat(64);
    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const newRecord: BlockchainRecord = {
      ...record,
      previousHash,
      hash,
      id: `bc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      nodeSignature: `sig-${Date.now()}`,
    };
    set((state) => ({
      blockchainRecords: [...state.blockchainRecords, newRecord],
      certificates: state.certificates.map((c) =>
        c.id === record.dataRef
          ? { ...c, blockchainHash: newRecord.hash, chainTime: newRecord.timestamp }
          : c
      ),
    }));
  },

  setReviews: (reviews: Review[]) => {
    set({ reviews });
  },

  addReview: (review: Omit<Review, 'id'>) => {
    const newReview: Review = {
      ...review,
      id: `r-${Date.now()}`,
    };
    set((state) => ({
      reviews: [newReview, ...state.reviews],
    }));
  },

  markAsRead: (id: string) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      return {
        notifications,
        unreadCount: 0,
      };
    });
  },

  addNotification: (
    notification: Omit<Notification, 'id' | 'sentAt' | 'isRead'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  addPrintLog: (log: PrintLog) => {
    set((state) => ({
      printLogs: [log, ...state.printLogs],
    }));
  },
}));
