import { getLoggedInUser } from "@/lib/controllers/auth.js";

export async function GET(req) {
    return await getLoggedInUser(req);
}
