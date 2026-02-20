import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "GET") {
        const members = await storage.getAllMembers();
        return res.json(members);
    }

    if (req.method === "POST") {
        try {
            const { username, password, role, ...memberData } = req.body || {};
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }
            const user = await storage.createUser({ username, password, role: role || "user" });
            const member = await storage.createMember({ ...memberData, userId: user.id });
            return res.json({ user, member });
        } catch (e: any) {
            return res.status(400).json({ message: "Failed to create member", error: e?.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
