import { updateAppointmentStatus } from "@/lib/controllers/receptionist";

export async function POST(req) {
    return await updateAppointmentStatus(req);
}
