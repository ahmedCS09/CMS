import { getMedRecordsByAppointmentID } from "@/lib/controllers/doctor";

export async function POST(req) {
    return await getMedRecordsByAppointmentID(req);
}