import { updatePreConsultation } from "@/lib/controllers/nurse";

export const PUT = async (req) => {
    return await updatePreConsultation(req);
};