import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "POST") {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password required" });
        }
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const member = await storage.getMemberByUserId(user.id);
        return res.json({ user, member });
    }

    return res.status(405).json({ message: "Method not allowed" });
}
