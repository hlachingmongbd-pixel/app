import { pgTable, text, serial, integer, boolean, real, date, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // handled in storage or default
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
});

export const members = pgTable("members", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  address: text("address").notNull(),
  nid: text("nid").notNull(),
  photo: text("photo"),
  joinDate: date("join_date").notNull(),
  shares: integer("shares").notNull().default(0),
  savings: real("savings").notNull().default(0),
  loanBalance: real("loan_balance").notNull().default(0),
  dividend: real("dividend").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  memberId: varchar("member_id").notNull().references(() => members.id),
  type: text("type", { enum: ["deposit", "withdrawal", "share", "loan_disbursement", "loan_repayment", "dividend"] }).notNull(),
  amount: real("amount").notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey(),
  memberId: varchar("member_id").notNull().references(() => members.id),
  amount: real("amount").notNull(),
  purpose: text("purpose").notNull(),
  duration: integer("duration").notNull(), // in months
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  appliedDate: date("applied_date").notNull(),
  approvedDate: date("approved_date"),
  monthlyInstallment: real("monthly_installment"),
});

export const notices = pgTable("notices", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: date("date").notNull(),
  isUrgent: boolean("is_urgent").notNull().default(false),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  venue: text("venue").notNull(),
  type: text("type", { enum: ["meeting", "event"] }).notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  member: one(members, {
    fields: [users.id],
    references: [members.userId],
  }),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  loans: many(loans),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  member: one(members, {
    fields: [transactions.memberId],
    references: [members.id],
  }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  member: one(members, {
    fields: [loans.memberId],
    references: [members.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const insertMemberSchema = createInsertSchema(members);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertLoanSchema = createInsertSchema(loans);
export const insertNoticeSchema = createInsertSchema(notices);
export const insertEventSchema = createInsertSchema(events);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = typeof notices.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
