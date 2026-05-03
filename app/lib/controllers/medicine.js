import Medicine from "@/models/medicinesModel";
import PurchasedMedicine from "@/models/purchasedMedicineModel";
import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/mongodb";
import Joi from "joi";

const medicineSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    image: Joi.string().uri().allow('').optional(),
    category: Joi.string().required()
});

const updateMedicineSchema = Joi.object({
    name: Joi.string(),
    price: Joi.number(),
    quantity: Joi.number(),
    description: Joi.string(),
    image: Joi.string(),
    category: Joi.string()
});

export async function getMedicinesPatient() {
    try {
        await dbConnect();
        const medicines = await Medicine.find();
        return NextResponse.json({ medicines, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function getMedicinesAdmin() {
    try {
        await dbConnect();
        const medicines = await Medicine.find();
        return NextResponse.json({ medicines });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function addMedicine(req) {
    try {
        await dbConnect();
        const { name, price, quantity, description, image, category } = await req.json();
        const { error } = medicineSchema.validate({ name, price, quantity, description, image, category });
        if (error) {
            return NextResponse.json({ error: error.details[0].message }, { status: 400 });
        }
        const medicine = new Medicine({ name, price, quantity, description, image, category });
        await medicine.save();
        return NextResponse.json({ medicine });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function deleteMedicine(req) {
    try {
        await dbConnect();
        const { id } = await req.json();
        const { error } = updateMedicineSchema.validate({ id });
        if (error) {
            return NextResponse.json({ error: error.details[0].message }, { status: 400 });
        }
        const medicine = await Medicine.findByIdAndDelete(id);
        return NextResponse.json({ medicine });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getPurchasedMedicines = async (req) => {
    try {
        await dbConnect();
        const medicines = await PurchasedMedicine.find().sort({ purchasedAt: -1 });
        return NextResponse.json({ medicines });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}