import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "GET") {
        const memberId = req.query.memberId as string | undefined;
        const loans = await storage.getLoans(memberId);
        return res.json(loans);
    }

    if (req.method === "POST") {
        try {
            const loan = await storage.createLoan(req.body);
            return res.json(loan);
        } catch (e: any) {
            return res.status(400).json({ message: "Invalid loan application", error: e?.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
