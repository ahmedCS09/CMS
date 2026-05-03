import { getAllAppointments } from "@/lib/controllers/receptionist";

export async function GET(req) {
    return await getAllAppointments(req);
}
