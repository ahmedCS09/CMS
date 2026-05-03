import { getMedicinesAdmin } from "@/lib/controllers/medicine";

export async function GET(req) {
    return await getMedicinesAdmin(req);
}