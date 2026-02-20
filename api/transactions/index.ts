import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "GET") {
        const memberId = req.query.memberId as string | undefined;
        const transactions = await storage.getTransactions(memberId);
        return res.json(transactions);
    }

    if (req.method === "POST") {
        try {
            const txData = req.body;
            const tx = await storage.createTransaction(txData);

            // Update member balances
            const member = await storage.getMember(tx.memberId);
            if (member) {
                const update: any = {};
                if (tx.type === "deposit") update.savings = (member.savings || 0) + tx.amount;
                if (tx.type === "withdrawal") update.savings = (member.savings || 0) - tx.amount;
                if (tx.type === "loan_disbursement") update.loanBalance = (member.loanBalance || 0) + tx.amount;
                if (tx.type === "loan_repayment") update.loanBalance = Math.max(0, (member.loanBalance || 0) - tx.amount);

                if (Object.keys(update).length > 0) {
                    await storage.updateMember(member.id, update);
                }
            }

            return res.json(tx);
        } catch (e: any) {
            return res.status(400).json({ message: "Invalid transaction data", error: e?.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
