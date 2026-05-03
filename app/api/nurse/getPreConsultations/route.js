import { getPreConsultations } from "@/lib/controllers/nurse";

export const GET = async (req) => {
    return await getPreConsultations(req);
};
