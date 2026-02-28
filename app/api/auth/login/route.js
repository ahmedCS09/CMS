import { loginUser } from "@/lib/controllers/auth.js";

export async function POST(req) {
    return await loginUser(req);
}