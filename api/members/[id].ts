import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    const { id } = req.query;
    const memberId = Array.isArray(id) ? id[0] : id;

    if (!memberId) {
        return res.status(400).json({ message: "Member ID required" });
    }

    if (req.method === "GET") {
        const member = await storage.getMember(memberId);
        if (!member) return res.status(404).json({ message: "Member not found" });
        return res.json(member);
    }

    if (req.method === "PATCH") {
        try {
            const member = await storage.updateMember(memberId, req.body || {});
            return res.json(member);
        } catch (e) {
            return res.status(400).json({ message: "Failed to update member" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
