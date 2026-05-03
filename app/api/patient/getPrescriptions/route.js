import { getPrescriptions } from "@/lib/controllers/patient";

export async function GET(req) {
    return await getPrescriptions(req);
}