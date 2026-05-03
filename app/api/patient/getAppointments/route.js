import { getAppointments } from "@/lib/controllers/patient";

export async function GET(req) {
    return await getAppointments(req);
}