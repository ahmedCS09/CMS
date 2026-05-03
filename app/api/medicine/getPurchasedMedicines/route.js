import { getPurchasedMedicines } from "@/lib/controllers/medicine";

export async function GET(req) {
    return getPurchasedMedicines(req);
}