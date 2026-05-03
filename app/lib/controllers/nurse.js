import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import PreConsultation from "@/models/preConsultationModel";
import User from "@/models/userModel";
import { verifyToken } from "@/lib/utils/tokenUtils";
import Joi from "joi";

const preConsultationSchemaNurse = Joi.object({
    temperature: Joi.number().required(),
    sugar: Joi.number().required(),
    bp: Joi.string().required(),
    pulse: Joi.number().required(),
    weight: Joi.number().required()
});

export const getPreConsultations = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "nurse") {
            return NextResponse.json({ message: "Unauthorized: Nurse access required", success: false }, { status: 403 });
        }

        const preConsultations = await PreConsultation.find().sort({ createdAt: -1 }).lean();

        return NextResponse.json({ preConsultations, success: true });

    } catch (error) {
        console.error("GetPreConsultations Error:", error);
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export const updatePreConsultation = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "nurse") {
            return NextResponse.json({ message: "Unauthorized: Nurse access required", success: false }, { status: 403 });
        }

        const { id, data } = await req.json();
        const { error } = preConsultationSchemaNurse.validate(data);
        if (error) return NextResponse.json({ message: error.details[0].message, success: false }, { status: 400 });

        const preConsultation = await PreConsultation.findById(id);

        if (!preConsultation) return NextResponse.json({ message: "PreConsultation not found", success: false }, { status: 404 });

        preConsultation.vitals = {
            temperature: data.temperature,
            sugar: data.sugar,
            bp: data.bp,
            pulse: data.pulse,
            weight: data.weight
        };

        await preConsultation.save();

        return NextResponse.json({ preConsultation, success: true });

    } catch (error) {
        console.error("UpdatePreConsultation Error:", error);
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}