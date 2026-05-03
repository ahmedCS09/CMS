import { getMedicinesPatient } from "@/lib/controllers/medicine";

export async function GET(req) {
    return await getMedicinesPatient(req);
}