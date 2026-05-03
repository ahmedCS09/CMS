import { createAppointment } from "@/lib/controllers/receptionist";

export async function POST(req) {
    return await createAppointment(req);
}
