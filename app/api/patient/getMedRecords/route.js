import { getMedRecords } from "@/lib/controllers/patient";

export async function GET(req) {
    return await getMedRecords(req);
}