import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "POST") {
        const { username, password, role } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password required" });
        }
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const user = await storage.createUser({ username, password, role: role || "user" });
        return res.json(user);
    }

    return res.status(405).json({ message: "Method not allowed" });
}
