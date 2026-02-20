import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertUserSchema, insertMemberSchema, insertTransactionSchema, insertLoanSchema, insertNoticeSchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const member = await storage.getMemberByUserId(user.id);
    res.json({ user, member });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input", error: e });
    }
  });

  // Member Routes
  app.get("/api/members", async (req, res) => {
    const members = await storage.getAllMembers();
    res.json(members);
  });

  app.get("/api/members/:id", async (req, res) => {
    const member = await storage.getMember(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  });

  app.post("/api/members", async (req, res) => {
    try {
      const { username, password, role, ...memberData } = req.body;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({ username, password, role: role || "user" });

      const memberInput = { ...memberData, userId: user.id };
      const member = await storage.createMember(memberInput);

      res.json({ user, member });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Failed to create member", error: e });
    }
  });

  app.patch("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.updateMember(req.params.id, req.body);
      res.json(member);
    } catch (e) {
      res.status(400).json({ message: "Failed to update member" });
    }
  });

  // Transaction Routes
  app.get("/api/transactions", async (req, res) => {
    const memberId = req.query.memberId as string | undefined;
    const transactions = await storage.getTransactions(memberId);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const txData = insertTransactionSchema.parse(req.body);
      const tx = await storage.createTransaction(txData);

      const member = await storage.getMember(tx.memberId);
      if (member) {
        const update: any = {};
        if (tx.type === 'deposit') update.savings = (member.savings || 0) + tx.amount;
        if (tx.type === 'withdrawal') update.savings = (member.savings || 0) - tx.amount;
        if (tx.type === 'loan_disbursement') update.loanBalance = (member.loanBalance || 0) + tx.amount;
        if (tx.type === 'loan_repayment') update.loanBalance = Math.max(0, (member.loanBalance || 0) - tx.amount);

        if (Object.keys(update).length > 0) {
          await storage.updateMember(member.id, update);
        }
      }

      res.json(tx);
    } catch (e) {
      res.status(400).json({ message: "Invalid transaction data", error: e });
    }
  });

  // Loan Routes
  app.get("/api/loans", async (req, res) => {
    const memberId = req.query.memberId as string | undefined;
    const loans = await storage.getLoans(memberId);
    res.json(loans);
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const loanData = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(loanData);
      res.json(loan);
    } catch (e) {
      res.status(400).json({ message: "Invalid loan application", error: e });
    }
  });

  app.patch("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.updateLoan(req.params.id, req.body);

      if (req.body.status === 'approved') {
        const tx = await storage.createTransaction({
          memberId: loan.memberId,
          type: 'loan_disbursement',
          amount: loan.amount,
          date: new Date().toISOString().split('T')[0],
          description: `Loan Disbursement - ${loan.purpose}`
        });

        const member = await storage.getMember(loan.memberId);
        if (member) {
          await storage.updateMember(member.id, {
            loanBalance: (member.loanBalance || 0) + loan.amount
          });
        }
      }

      res.json(loan);
    } catch (e) {
      res.status(400).json({ message: "Failed to update loan" });
    }
  });

  // Notices
  app.get("/api/notices", async (req, res) => {
    const notices = await storage.getNotices();
    res.json(notices);
  });

  app.post("/api/notices", async (req, res) => {
    try {
      const noticeData = insertNoticeSchema.parse(req.body);
      const notice = await storage.createNotice(noticeData);
      res.json(notice);
    } catch (e) {
      res.status(400).json({ message: "Invalid notice data" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (e) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  // Seed Data if empty
  if ((await storage.getAllMembers()).length === 0) {
    console.log("Seeding initial data...");
    const adminUser = await storage.createUser({
      username: "01700000000", // Using phone as username for ease of login
      password: "admin123",
      role: "admin"
    });
    await storage.createMember({
      userId: adminUser.id,
      name: "প্রশাসক",
      phone: "01700000000",
      address: "Chittagong",
      nid: "1234567890",
      joinDate: new Date().toISOString().split('T')[0],
      shares: 10,
      savings: 5000,
      isActive: true
    });

    const demoUser = await storage.createUser({
      username: "01711111111", // Using phone as username
      password: "123",
      role: "user"
    });
    await storage.createMember({
      userId: demoUser.id,
      name: "সাধারণ সদস্য",
      phone: "01711111111",
      address: "Dhaka",
      nid: "0987654321",
      joinDate: new Date().toISOString().split('T')[0],
      shares: 5,
      savings: 2000,
      isActive: true
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
