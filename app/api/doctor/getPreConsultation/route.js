import { getPreConsultationByPatient } from "@/lib/controllers/doctor";

export async function POST(req) {
    return getPreConsultationByPatient(req);
}
