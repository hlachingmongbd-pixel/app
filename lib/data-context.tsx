import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Platform } from 'react-native';

// Types matching backend schema (using string IDs)
export interface Member {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  nid: string;
  photo: string | null;
  joinDate: string;
  shares: number;
  savings: number;
  loanBalance: number;
  dividend: number;
  isActive: boolean;
  role?: 'admin' | 'user'; // Optional, added from User when flattened
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface Transaction {
  id: string;
  memberId: string;
  type: 'deposit' | 'withdrawal' | 'share' | 'loan_disbursement' | 'loan_repayment' | 'dividend';
  amount: number;
  date: string;
  description: string;
}

export interface LoanApplication {
  id: string;
  memberId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedDate?: string | null;
  monthlyInstallment?: number | null;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isUrgent: boolean;
}

export interface MeetingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  type: 'meeting' | 'event';
}

export interface Settings {
  interestRate: number;
  sharePrice: number;
  maxLoanAmount: number;
  loanInterestRate: number;
}

import { translations, Language, TranslationKeys } from '@/constants/translations';

interface DataContextValue {
  currentUser: Member | null;
  isAdmin: boolean;
  members: Member[];
  transactions: Transaction[];
  loanApplications: LoanApplication[];
  notices: Notice[];
  events: MeetingEvent[];
  settings: Settings;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  addMember: (member: any) => Promise<void>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  toggleMemberStatus: (id: string) => Promise<void>;
  addTransaction: (tx: any) => Promise<void>;
  applyForLoan: (loan: any) => Promise<void>;
  approveLoan: (id: string) => Promise<void>;
  rejectLoan: (id: string) => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
  addEvent: (event: any) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
  // Language support
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const DataContext = createContext<DataContextValue | null>(null);

const BASE_URL = 'http://localhost:5001/api';

const DEFAULT_SETTINGS: Settings = {
  interestRate: 6,
  sharePrice: 100,
  maxLoanAmount: 500000,
  loanInterestRate: 12,
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('bn');

  const t = (key: TranslationKeys) => {
    return translations[language][key] || key;
  };

  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const config: RequestInit = { method, headers };
      if (body) config.body = JSON.stringify(body);

      const url = `${BASE_URL}${endpoint}`;

      const res = await fetch(url, config);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API Request Failed: ${res.status} ${txt}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const [m, t, l, n, e] = await Promise.all([
        apiCall('/members'),
        apiCall('/transactions'),
        apiCall('/loans'),
        apiCall('/notices'),
        apiCall('/events')
      ]);
      setMembers(m);
      setTransactions(t);
      setLoanApplications(l);
      setNotices(n);
      setEvents(e);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const res = await apiCall('/auth/login', 'POST', { username: phone, password });
      if (res.user) {
        // Flatten user and member
        const flattened: Member = {
          ...(res.member || {}), // Member data
          role: res.user.role, // User data
          userId: res.user.id, // User ID reference
          // Note: if member is undefined (e.g. pure admin without member profile?), handle gracefully
          // But our seed creates both.
        };
        // If member is partial, we might miss fields. 
        // But for "admin", we created a member profile.

        setCurrentUser(flattened);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setMembers([]);
    setTransactions([]);
  };

  const addMember = async (memberData: any) => {
    await apiCall('/members', 'POST', memberData);
    loadData();
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    await apiCall(`/members/${id}`, 'PATCH', data);
    loadData();
  };

  const toggleMemberStatus = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      await updateMember(id, { isActive: !member.isActive });
    }
  };

  const addTransaction = async (tx: any) => {
    await apiCall('/transactions', 'POST', tx);
    loadData();
  };

  const applyForLoan = async (loan: any) => {
    await apiCall('/loans', 'POST', loan);
    loadData();
  };

  const approveLoan = async (id: string) => {
    await apiCall(`/loans/${id}`, 'PATCH', { status: 'approved', approvedDate: new Date().toISOString().split('T')[0] });
    loadData();
  };

  const rejectLoan = async (id: string) => {
    await apiCall(`/loans/${id}`, 'PATCH', { status: 'rejected' });
    loadData();
  };

  const addNotice = async (notice: any) => {
    await apiCall('/notices', 'POST', notice);
    loadData();
  };

  const addEvent = async (event: any) => {
    await apiCall('/events', 'POST', event);
    loadData();
  };

  const updateSettings = async (s: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  const value = useMemo(() => ({
    currentUser,
    isAdmin: currentUser?.role === 'admin',
    members,
    transactions,
    loanApplications,
    notices,
    events,
    settings,
    login,
    logout,
    addMember,
    updateMember,
    toggleMemberStatus,
    addTransaction,
    applyForLoan,
    approveLoan,
    rejectLoan,
    addNotice,
    addEvent,
    updateSettings,
    isLoading,
    language,
    setLanguage,
    t
  }), [currentUser, members, transactions, loanApplications, notices, events, settings, isLoading, language]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
