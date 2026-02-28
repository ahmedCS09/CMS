import { bookAppointment } from "@/lib/controllers/patient";

export async function POST(req) {
    return await bookAppointment(req);
}
