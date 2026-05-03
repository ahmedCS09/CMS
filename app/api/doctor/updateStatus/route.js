import { updateAppointmentStatus } from "@/lib/controllers/doctor";

export async function POST(req) {
    return await updateAppointmentStatus(req);
}
