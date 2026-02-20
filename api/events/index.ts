import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { cors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (cors(req, res)) return;
    await storage.ensureSeeded();

    if (req.method === "GET") {
        const events = await storage.getEvents();
        return res.json(events);
    }

    if (req.method === "POST") {
        try {
            const event = await storage.createEvent(req.body);
            return res.json(event);
        } catch (e: any) {
            return res.status(400).json({ message: "Invalid event data", error: e?.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
