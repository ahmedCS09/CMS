import { getAppointmentsDoc } from "@/lib/controllers/doctor";

export async function GET(req) {
    return await getAppointmentsDoc(req);
}
