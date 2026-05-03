import { getMedRecordsDoc } from "@/lib/controllers/doctor";

export async function GET(req) {
    return await getMedRecordsDoc(req);
}