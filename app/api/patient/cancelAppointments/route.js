import { cancelAppointment } from "@/lib/controllers/patient";

export async function DELETE(req) {
    return await cancelAppointment(req);
}