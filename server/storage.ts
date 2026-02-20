import {
  type User, type InsertUser,
  type Member, type InsertMember,
  type Transaction, type InsertTransaction,
  type Loan, type InsertLoan,
  type Notice, type InsertNotice,
  type Event, type InsertEvent,
  users, members, transactions, loans, notices, events
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Members
  getMember(id: string): Promise<Member | undefined>;
  getMemberByUserId(userId: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member>;
  getAllMembers(): Promise<Member[]>;

  // Transactions
  getTransactions(memberId?: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Loans
  getLoans(memberId?: string): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<InsertLoan>): Promise<Loan>;

  // Notices
  getNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private members: Map<string, Member>;
  private transactions: Map<string, Transaction>;
  private loans: Map<string, Loan>;
  private notices: Map<string, Notice>;
  private events: Map<string, Event>;

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.transactions = new Map();
    this.loans = new Map();
    this.notices = new Map();
    this.events = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, role: insertUser.role || "user" };
    this.users.set(id, user);
    return user;
  }

  // Members
  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async getMemberByUserId(userId: string): Promise<Member | undefined> {
    return Array.from(this.members.values()).find(
      (member) => member.userId === userId,
    );
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const member: Member = {
      ...insertMember,
      id,
      shares: insertMember.shares || 0,
      savings: insertMember.savings || 0,
      loanBalance: insertMember.loanBalance || 0,
      dividend: insertMember.dividend || 0,
      isActive: insertMember.isActive ?? true,
      photo: insertMember.photo || null
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, update: Partial<InsertMember>): Promise<Member> {
    const member = this.members.get(id);
    if (!member) throw new Error("Member not found");
    const updatedMember = { ...member, ...update };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  // Transactions
  async getTransactions(memberId?: string): Promise<Transaction[]> {
    const txs = Array.from(this.transactions.values());
    if (memberId) {
      return txs.filter(t => t.memberId === memberId);
    }
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const tx: Transaction = { ...insertTx, id };
    this.transactions.set(id, tx);
    return tx;
  }

  // Loans
  async getLoans(memberId?: string): Promise<Loan[]> {
    const loans = Array.from(this.loans.values());
    if (memberId) {
      return loans.filter(l => l.memberId === memberId);
    }
    return loans;
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const loan: Loan = {
      ...insertLoan,
      id,
      status: insertLoan.status || "pending",
      approvedDate: insertLoan.approvedDate || null,
      monthlyInstallment: insertLoan.monthlyInstallment || null
    };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: string, update: Partial<InsertLoan>): Promise<Loan> {
    const loan = this.loans.get(id);
    if (!loan) throw new Error("Loan not found");
    const updatedLoan = { ...loan, ...update };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  // Notices
  async getNotices(): Promise<Notice[]> {
    return Array.from(this.notices.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createNotice(insertNotice: InsertNotice): Promise<Notice> {
    const id = randomUUID();
    const notice: Notice = {
      ...insertNotice,
      id,
      isUrgent: insertNotice.isUrgent ?? false
    };
    this.notices.set(id, notice);
    return notice;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }
}

export const storage = new MemStorage();
