import { deleteMedicine } from "@/lib/controllers/medicine.js";

export async function DELETE(req) {
    return await deleteMedicine(req);
}