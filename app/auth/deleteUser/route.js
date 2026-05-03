import { deleteUser } from "@/lib/controllers/auth";

export const DELETE = async (req) => {
    return await deleteUser(req);
}