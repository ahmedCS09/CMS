import { addPrescription } from "@/lib/controllers/doctor";

export async function POST(req) {
    return await addPrescription(req);
}
