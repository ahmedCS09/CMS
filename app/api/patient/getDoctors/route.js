import { getDoctors } from "@/lib/controllers/patient";

export async function GET(req) {
    return await getDoctors(req);
}
