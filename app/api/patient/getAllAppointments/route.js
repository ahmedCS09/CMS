import { getAllAppointments } from "@/lib/controllers/patient";

export async function GET(req) {
    return getAllAppointments(req);
}