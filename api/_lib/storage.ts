import { randomUUID } from "crypto";

// Types (inline to avoid import path issues in serverless)
export interface User {
    id: string;
    username: string;
    password: string;
    role: string;
}

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
}

export interface Transaction {
    id: string;
    memberId: string;
    type: string;
    amount: number;
    date: string;
    description: string;
}

export interface Loan {
    id: string;
    memberId: string;
    amount: number;
    purpose: string;
    duration: number;
    status: string;
    appliedDate: string;
    approvedDate: string | null;
    monthlyInstallment: number | null;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    date: string;
    isUrgent: boolean;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    type: string;
}

class MemStorage {
    private users: Map<string, User>;
    private members: Map<string, Member>;
    private transactions: Map<string, Transaction>;
    private loans: Map<string, Loan>;
    private notices: Map<string, Notice>;
    private events: Map<string, Event>;
    private seeded: boolean;

    constructor() {
        this.users = new Map();
        this.members = new Map();
        this.transactions = new Map();
        this.loans = new Map();
        this.notices = new Map();
        this.events = new Map();
        this.seeded = false;
    }

    async ensureSeeded() {
        if (this.seeded) return;
        this.seeded = true;

        // Seed admin
        const adminUser = await this.createUser({
            username: "01700000000",
            password: "admin123",
            role: "admin",
        });
        await this.createMember({
            userId: adminUser.id,
            name: "প্রশাসক",
            phone: "01700000000",
            address: "Chittagong",
            nid: "1234567890",
            joinDate: new Date().toISOString().split("T")[0],
            shares: 10,
            savings: 5000,
            isActive: true,
        });

        // Seed demo user
        const demoUser = await this.createUser({
            username: "01711111111",
            password: "123",
            role: "user",
        });
        await this.createMember({
            userId: demoUser.id,
            name: "সাধারণ সদস্য",
            phone: "01711111111",
            address: "Dhaka",
            nid: "0987654321",
            joinDate: new Date().toISOString().split("T")[0],
            shares: 5,
            savings: 2000,
            isActive: true,
        });
    }

    // Users
    async getUser(id: string): Promise<User | undefined> {
        return this.users.get(id);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find((u) => u.username === username);
    }

    async createUser(data: { username: string; password: string; role?: string }): Promise<User> {
        const id = randomUUID();
        const user: User = { id, username: data.username, password: data.password, role: data.role || "user" };
        this.users.set(id, user);
        return user;
    }

    // Members
    async getMember(id: string): Promise<Member | undefined> {
        return this.members.get(id);
    }

    async getMemberByUserId(userId: string): Promise<Member | undefined> {
        return Array.from(this.members.values()).find((m) => m.userId === userId);
    }

    async createMember(data: Partial<Member> & { userId: string; name: string; phone: string; address: string; nid: string; joinDate: string }): Promise<Member> {
        const id = randomUUID();
        const member: Member = {
            id,
            userId: data.userId,
            name: data.name,
            phone: data.phone,
            address: data.address,
            nid: data.nid,
            photo: data.photo || null,
            joinDate: data.joinDate,
            shares: data.shares || 0,
            savings: data.savings || 0,
            loanBalance: data.loanBalance || 0,
            dividend: data.dividend || 0,
            isActive: data.isActive ?? true,
        };
        this.members.set(id, member);
        return member;
    }

    async updateMember(id: string, update: Partial<Member>): Promise<Member> {
        const member = this.members.get(id);
        if (!member) throw new Error("Member not found");
        const updated = { ...member, ...update };
        this.members.set(id, updated);
        return updated;
    }

    async getAllMembers(): Promise<Member[]> {
        return Array.from(this.members.values());
    }

    // Transactions
    async getTransactions(memberId?: string): Promise<Transaction[]> {
        const txs = Array.from(this.transactions.values());
        if (memberId) return txs.filter((t) => t.memberId === memberId);
        return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    async createTransaction(data: Omit<Transaction, "id">): Promise<Transaction> {
        const id = randomUUID();
        const tx: Transaction = { id, ...data };
        this.transactions.set(id, tx);
        return tx;
    }

    // Loans
    async getLoans(memberId?: string): Promise<Loan[]> {
        const loans = Array.from(this.loans.values());
        if (memberId) return loans.filter((l) => l.memberId === memberId);
        return loans;
    }

    async createLoan(data: Partial<Loan> & { memberId: string; amount: number; purpose: string; duration: number; appliedDate: string }): Promise<Loan> {
        const id = randomUUID();
        const loan: Loan = {
            id,
            memberId: data.memberId,
            amount: data.amount,
            purpose: data.purpose,
            duration: data.duration,
            status: data.status || "pending",
            appliedDate: data.appliedDate,
            approvedDate: data.approvedDate || null,
            monthlyInstallment: data.monthlyInstallment || null,
        };
        this.loans.set(id, loan);
        return loan;
    }

    async updateLoan(id: string, update: Partial<Loan>): Promise<Loan> {
        const loan = this.loans.get(id);
        if (!loan) throw new Error("Loan not found");
        const updated = { ...loan, ...update };
        this.loans.set(id, updated);
        return updated;
    }

    // Notices
    async getNotices(): Promise<Notice[]> {
        return Array.from(this.notices.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    async createNotice(data: Omit<Notice, "id">): Promise<Notice> {
        const id = randomUUID();
        const notice: Notice = { id, ...data, isUrgent: data.isUrgent ?? false };
        this.notices.set(id, notice);
        return notice;
    }

    // Events
    async getEvents(): Promise<Event[]> {
        return Array.from(this.events.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    async createEvent(data: Omit<Event, "id">): Promise<Event> {
        const id = randomUUID();
        const event: Event = { id, ...data };
        this.events.set(id, event);
        return event;
    }
}

// Singleton — note: in serverless, this resets per cold start
export const storage = new MemStorage();
