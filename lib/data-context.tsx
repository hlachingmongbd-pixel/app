import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  nid: string;
  photo: string;
  joinDate: string;
  shares: number;
  savings: number;
  loanBalance: number;
  dividend: number;
  isActive: boolean;
  role: 'user' | 'admin';
  password: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'deposit' | 'withdrawal' | 'share' | 'loan_disbursement' | 'loan_repayment' | 'dividend';
  amount: number;
  date: string;
  description: string;
}

export interface LoanApplication {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  purpose: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedDate?: string;
  monthlyInstallment?: number;
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
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  toggleMemberStatus: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  applyForLoan: (loan: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  approveLoan: (id: string) => Promise<void>;
  rejectLoan: (id: string) => Promise<void>;
  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => Promise<void>;
  addEvent: (event: Omit<MeetingEvent, 'id'>) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEYS = {
  MEMBERS: '@metta_members',
  TRANSACTIONS: '@metta_transactions',
  LOANS: '@metta_loans',
  NOTICES: '@metta_notices',
  EVENTS: '@metta_events',
  SETTINGS: '@metta_settings',
  CURRENT_USER: '@metta_current_user',
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const DEFAULT_SETTINGS: Settings = {
  interestRate: 6,
  sharePrice: 100,
  maxLoanAmount: 500000,
  loanInterestRate: 12,
};

const SEED_ADMIN: Member = {
  id: 'admin001',
  name: 'প্রশাসক',
  phone: '01700000000',
  address: 'চট্টগ্রাম',
  nid: '1234567890',
  photo: '',
  joinDate: '2024-01-01',
  shares: 50,
  savings: 25000,
  loanBalance: 0,
  dividend: 1200,
  isActive: true,
  role: 'admin',
  password: 'admin123',
};

const SEED_MEMBERS: Member[] = [
  {
    id: 'mem001',
    name: 'মোহাম্মদ আলী',
    phone: '01711111111',
    address: 'হাটহাজারী, চট্টগ্রাম',
    nid: '1990123456789',
    photo: '',
    joinDate: '2024-02-15',
    shares: 30,
    savings: 15000,
    loanBalance: 50000,
    dividend: 800,
    isActive: true,
    role: 'user',
    password: '1234',
  },
  {
    id: 'mem002',
    name: 'ফাতেমা বেগম',
    phone: '01722222222',
    address: 'রাউজান, চট্টগ্রাম',
    nid: '1992987654321',
    photo: '',
    joinDate: '2024-03-10',
    shares: 20,
    savings: 10000,
    loanBalance: 0,
    dividend: 500,
    isActive: true,
    role: 'user',
    password: '1234',
  },
  {
    id: 'mem003',
    name: 'আব্দুল করিম',
    phone: '01733333333',
    address: 'পটিয়া, চট্টগ্রাম',
    nid: '1988456789012',
    photo: '',
    joinDate: '2024-04-20',
    shares: 40,
    savings: 20000,
    loanBalance: 30000,
    dividend: 1000,
    isActive: true,
    role: 'user',
    password: '1234',
  },
  {
    id: 'mem004',
    name: 'নূরজাহান খাতুন',
    phone: '01744444444',
    address: 'সন্দ্বীপ, চট্টগ্রাম',
    nid: '1995321654987',
    photo: '',
    joinDate: '2024-05-05',
    shares: 15,
    savings: 8000,
    loanBalance: 20000,
    dividend: 400,
    isActive: true,
    role: 'user',
    password: '1234',
  },
  {
    id: 'mem005',
    name: 'রফিকুল ইসলাম',
    phone: '01755555555',
    address: 'বোয়ালখালী, চট্টগ্রাম',
    nid: '1985654321098',
    photo: '',
    joinDate: '2024-06-12',
    shares: 25,
    savings: 12000,
    loanBalance: 0,
    dividend: 650,
    isActive: false,
    role: 'user',
    password: '1234',
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'tx001', memberId: 'mem001', memberName: 'মোহাম্মদ আলী', type: 'deposit', amount: 5000, date: '2025-02-01', description: 'মাসিক সঞ্চয় জমা' },
  { id: 'tx002', memberId: 'mem002', memberName: 'ফাতেমা বেগম', type: 'share', amount: 2000, date: '2025-02-01', description: 'শেয়ার ক্রয়' },
  { id: 'tx003', memberId: 'mem003', memberName: 'আব্দুল করিম', type: 'loan_repayment', amount: 3000, date: '2025-02-05', description: 'ঋণ কিস্তি পরিশোধ' },
  { id: 'tx004', memberId: 'mem001', memberName: 'মোহাম্মদ আলী', type: 'loan_disbursement', amount: 50000, date: '2025-01-15', description: 'ব্যবসায়িক ঋণ' },
  { id: 'tx005', memberId: 'mem004', memberName: 'নূরজাহান খাতুন', type: 'deposit', amount: 3000, date: '2025-02-10', description: 'মাসিক সঞ্চয় জমা' },
  { id: 'tx006', memberId: 'mem003', memberName: 'আব্দুল করিম', type: 'withdrawal', amount: 5000, date: '2025-02-08', description: 'জরুরী উত্তোলন' },
  { id: 'tx007', memberId: 'mem002', memberName: 'ফাতেমা বেগম', type: 'deposit', amount: 4000, date: '2025-02-12', description: 'মাসিক সঞ্চয় জমা' },
];

const SEED_NOTICES: Notice[] = [
  { id: 'n001', title: 'বার্ষিক সাধারণ সভা', content: 'আগামী ১৫ মার্চ ২০২৫ তারিখে বার্ষিক সাধারণ সভা অনুষ্ঠিত হবে। সকল সদস্যদের উপস্থিতি কামনা করা হচ্ছে।', date: '2025-02-15', isUrgent: true },
  { id: 'n002', title: 'নতুন সুদের হার', content: 'সঞ্চয়ের উপর সুদের হার ৬% থেকে ৭% করা হয়েছে। ০১ মার্চ থেকে কার্যকর হবে।', date: '2025-02-10', isUrgent: false },
  { id: 'n003', title: 'ঋণ আবেদনের শেষ তারিখ', content: 'এই মাসের ঋণ আবেদনের শেষ তারিখ ২৮ ফেব্রুয়ারী। আগ্রহী সদস্যরা যোগাযোগ করুন।', date: '2025-02-05', isUrgent: false },
];

const SEED_EVENTS: MeetingEvent[] = [
  { id: 'e001', title: 'মাসিক পরিচালনা সভা', description: 'পরিচালনা পর্ষদের মাসিক সভা', date: '2025-03-01', time: '10:00 AM', venue: 'সমিতির কার্যালয়', type: 'meeting' },
  { id: 'e002', title: 'বার্ষিক সাধারণ সভা', description: 'সকল সদস্যদের জন্য বার্ষিক সাধারণ সভা', date: '2025-03-15', time: '02:00 PM', venue: 'কমিউনিটি হল', type: 'meeting' },
  { id: 'e003', title: 'লভ্যাংশ বিতরণ অনুষ্ঠান', description: 'বার্ষিক লভ্যাংশ বিতরণ', date: '2025-04-01', time: '11:00 AM', venue: 'সমিতির কার্যালয়', type: 'event' },
];

const SEED_LOANS: LoanApplication[] = [
  { id: 'l001', memberId: 'mem001', memberName: 'মোহাম্মদ আলী', amount: 50000, purpose: 'ব্যবসায়িক মূলধন', duration: 12, status: 'approved', appliedDate: '2025-01-10', approvedDate: '2025-01-15', monthlyInstallment: 4583 },
  { id: 'l002', memberId: 'mem004', memberName: 'নূরজাহান খাতুন', amount: 20000, purpose: 'ঘর মেরামত', duration: 6, status: 'approved', appliedDate: '2025-01-20', approvedDate: '2025-01-25', monthlyInstallment: 3500 },
  { id: 'l003', memberId: 'mem003', memberName: 'আব্দুল করিম', amount: 100000, purpose: 'কৃষি কাজ', duration: 24, status: 'pending', appliedDate: '2025-02-10' },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mData, tData, lData, nData, eData, sData, uData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MEMBERS),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LOANS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTICES),
        AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      ]);

      if (!mData) {
        const allMembers = [SEED_ADMIN, ...SEED_MEMBERS];
        await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(allMembers));
        setMembers(allMembers);
      } else {
        setMembers(JSON.parse(mData));
      }

      if (!tData) {
        await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
        setTransactions(SEED_TRANSACTIONS);
      } else {
        setTransactions(JSON.parse(tData));
      }

      if (!lData) {
        await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(SEED_LOANS));
        setLoanApplications(SEED_LOANS);
      } else {
        setLoanApplications(JSON.parse(lData));
      }

      if (!nData) {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(SEED_NOTICES));
        setNotices(SEED_NOTICES);
      } else {
        setNotices(JSON.parse(nData));
      }

      if (!eData) {
        await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
        setEvents(SEED_EVENTS);
      } else {
        setEvents(JSON.parse(eData));
      }

      if (sData) setSettings(JSON.parse(sData));
      if (uData) {
        const user = JSON.parse(uData);
        setCurrentUser(user);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const persist = async (key: string, data: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  };

  const login = async (phone: string, password: string): Promise<boolean> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERS);
    const allMembers: Member[] = stored ? JSON.parse(stored) : [];
    const found = allMembers.find(m => m.phone === phone && m.password === password && m.isActive);
    if (found) {
      setCurrentUser(found);
      await persist(STORAGE_KEYS.CURRENT_USER, found);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const addMember = async (member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: 'mem' + generateId() };
    const updated = [...members, newMember];
    setMembers(updated);
    await persist(STORAGE_KEYS.MEMBERS, updated);
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...data } : m);
    setMembers(updated);
    await persist(STORAGE_KEYS.MEMBERS, updated);
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      await persist(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }
  };

  const toggleMemberStatus = async (id: string) => {
    const updated = members.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
    setMembers(updated);
    await persist(STORAGE_KEYS.MEMBERS, updated);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: 'tx' + generateId() };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await persist(STORAGE_KEYS.TRANSACTIONS, updated);

    const member = members.find(m => m.id === tx.memberId);
    if (member) {
      let memberUpdate: Partial<Member> = {};
      if (tx.type === 'deposit') memberUpdate.savings = member.savings + tx.amount;
      if (tx.type === 'withdrawal') memberUpdate.savings = member.savings - tx.amount;
      if (tx.type === 'share') memberUpdate.shares = member.shares + Math.floor(tx.amount / settings.sharePrice);
      if (tx.type === 'loan_disbursement') memberUpdate.loanBalance = member.loanBalance + tx.amount;
      if (tx.type === 'loan_repayment') memberUpdate.loanBalance = Math.max(0, member.loanBalance - tx.amount);
      if (Object.keys(memberUpdate).length > 0) {
        await updateMember(member.id, memberUpdate);
      }
    }
  };

  const applyForLoan = async (loan: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newLoan: LoanApplication = {
      ...loan,
      id: 'l' + generateId(),
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newLoan, ...loanApplications];
    setLoanApplications(updated);
    await persist(STORAGE_KEYS.LOANS, updated);
  };

  const approveLoan = async (id: string) => {
    const updated = loanApplications.map(l => {
      if (l.id === id) {
        const monthlyInstallment = Math.ceil((l.amount * (1 + settings.loanInterestRate / 100)) / l.duration);
        return { ...l, status: 'approved' as const, approvedDate: new Date().toISOString().split('T')[0], monthlyInstallment };
      }
      return l;
    });
    setLoanApplications(updated);
    await persist(STORAGE_KEYS.LOANS, updated);

    const loan = updated.find(l => l.id === id);
    if (loan && loan.status === 'approved') {
      await addTransaction({
        memberId: loan.memberId,
        memberName: loan.memberName,
        type: 'loan_disbursement',
        amount: loan.amount,
        date: new Date().toISOString().split('T')[0],
        description: `ঋণ অনুমোদন - ${loan.purpose}`,
      });
    }
  };

  const rejectLoan = async (id: string) => {
    const updated = loanApplications.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l);
    setLoanApplications(updated);
    await persist(STORAGE_KEYS.LOANS, updated);
  };

  const addNotice = async (notice: Omit<Notice, 'id' | 'date'>) => {
    const newNotice = { ...notice, id: 'n' + generateId(), date: new Date().toISOString().split('T')[0] };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    await persist(STORAGE_KEYS.NOTICES, updated);
  };

  const addEvent = async (event: Omit<MeetingEvent, 'id'>) => {
    const newEvent = { ...event, id: 'e' + generateId() };
    const updated = [newEvent, ...events];
    setEvents(updated);
    await persist(STORAGE_KEYS.EVENTS, updated);
  };

  const updateSettingsFn = async (s: Partial<Settings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    await persist(STORAGE_KEYS.SETTINGS, updated);
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
    updateSettings: updateSettingsFn,
    isLoading,
  }), [currentUser, members, transactions, loanApplications, notices, events, settings, isLoading]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
