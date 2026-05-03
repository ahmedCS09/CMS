import { addPreConsultation } from "@/lib/controllers/patient";

export async function POST(req) {
    return await addPreConsultation(req);
}