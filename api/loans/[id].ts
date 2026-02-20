import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    const { id } = req.query;
    const loanId = Array.isArray(id) ? id[0] : id;

    if (!loanId) {
        return res.status(400).json({ message: "Loan ID required" });
    }

    if (req.method === "PATCH") {
        try {
            const loan = await storage.updateLoan(loanId, req.body || {});

            if (req.body?.status === "approved") {
                await storage.createTransaction({
                    memberId: loan.memberId,
                    type: "loan_disbursement",
                    amount: loan.amount,
                    date: new Date().toISOString().split("T")[0],
                    description: `Loan Disbursement - ${loan.purpose}`,
                });

                const member = await storage.getMember(loan.memberId);
                if (member) {
                    await storage.updateMember(member.id, {
                        loanBalance: (member.loanBalance || 0) + loan.amount,
                    });
                }
            }

            return res.json(loan);
        } catch (e) {
            return res.status(400).json({ message: "Failed to update loan" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
