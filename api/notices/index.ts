import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "GET") {
        const notices = await storage.getNotices();
        return res.json(notices);
    }

    if (req.method === "POST") {
        try {
            const notice = await storage.createNotice(req.body);
            return res.json(notice);
        } catch (e: any) {
            return res.status(400).json({ message: "Invalid notice data", error: e?.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
