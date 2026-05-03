import { receptionistRegisterPatient } from "@/lib/controllers/auth.js";

export async function POST(req) {
    return await receptionistRegisterPatient(req);
}
