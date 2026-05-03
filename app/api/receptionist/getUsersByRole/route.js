import { getUsersByRole } from "@/lib/controllers/receptionist";

export async function GET(req) {
    return await getUsersByRole(req);
}
