import { adminRegisterUser } from "@/lib/controllers/auth.js";

export async function POST(req) {
    return await adminRegisterUser(req);
}
