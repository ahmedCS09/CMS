import { getAllUsers } from "@/lib/controllers/auth.js";

export async function GET(req) {
    return await getAllUsers(req);
}
