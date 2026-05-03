import { addMedicine } from "@/lib/controllers/medicine";

export async function POST(req) {
    return await addMedicine(req);
}