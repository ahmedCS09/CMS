import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/appointmentsModel";
import MedRecord from "@/models/medRecordsModel";
import Prescription from "@/models/prescriptionsModel";
import { verifyToken } from "@/lib/utils/tokenUtils";
import User from "@/models/userModel";
import Joi from "joi";
import PreConsultation from "@/models/preConsultationModel";

const bookingSchema = Joi.object({
    doctorId: Joi.string().required(),
    doctorName: Joi.string().required(),
    date: Joi.string().required(),
    time: Joi.string().required()
});

const updateSchema = Joi.object({
    appointmentId: Joi.string().required(),
    date: Joi.string().optional(),
    time: Joi.string().optional()
});

const preConsultationSchemaPatient = Joi.object({
    appointmentId: Joi.string().required(),
    symptoms: Joi.string().required(),
    allergies: Joi.string().required(),
    medications: Joi.string().optional().allow(""),
    medicalHistory: Joi.string().optional().allow("")
});

export const bookAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized: Patient access required", success: false }, { status: 403 });
        }

        const body = await req.json();
        const { error } = bookingSchema.validate(body);
        if (error) {
            return NextResponse.json({ message: error.details[0].message, success: false }, { status: 400 });
        }

        const { doctorId, doctorName, date, time } = body;

        const appointment = await Appointment.create({
            id: "APT-" + Date.now(),
            patientId: decoded.id,
            patientName: decoded.fullName,
            doctorId,
            doctorName,
            appointmentDate: date,
            appointmentTime: time,
            appointmentStatus: "pending",
        });

        return NextResponse.json({ message: "Appointment booked successfully", appointment, success: true });

    } catch (error) {
        console.error("BookAppointment Error:", error);
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export const updateAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 403 });
        }

        const body = await req.json();
        const { error } = updateSchema.validate(body);
        if (error) {
            return NextResponse.json({ message: error.details[0].message, success: false }, { status: 400 });
        }

        const { appointmentId, date, time } = body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found", success: false }, { status: 404 });
        }

        if (appointment.patientId.toString() !== decoded.id) {
            return NextResponse.json({ message: "Unauthorized: You do not own this appointment", success: false }, { status: 401 });
        }

        if (date) appointment.appointmentDate = date;
        if (time) appointment.appointmentTime = time;
        await appointment.save();

        return NextResponse.json({ message: "Appointment updated successfully", appointment, success: true });

    } catch (error) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}


export const getAppointments = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ message: "Invalid session", success: false }, { status: 401 });
        }

        if (decoded.role !== "patient") {
            return NextResponse.json({ message: "Forbidden: Patient access required", success: false }, { status: 403 });
        }

        // Multi-format ID check to handle consistency issues
        const patientIdString = String(decoded.id);
        const patientName = decoded.fullName;

        // Query with fallback matching for maximum reliability
        const appointments = await Appointment.find({
            $and: [
                { appointmentStatus: { $ne: "cancelled" } },
                {
                    $or: [
                        { patientId: patientIdString },
                        { patientId: new mongoose.Types.ObjectId(patientIdString) },
                        { patientName: { $regex: new RegExp(`^${patientName}$`, 'i') } }
                    ]
                }
            ]
        }).sort({ appointmentDate: 1, appointmentTime: 1 }).lean();

        return NextResponse.json({
            appointments: appointments || [],
            success: true
        });

    } catch (error) {
        console.error("GetAppointments Error:", error);
        return NextResponse.json({
            appointments: [],
            message: error.message,
            success: false
        }, { status: 500 });
    }
}

export const cancelAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { appointmentId } = await req.json();

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        if (appointment.patientId.toString() !== decoded.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        appointment.appointmentStatus = "cancelled";
        await appointment.save();

        return NextResponse.json({ message: "Appointment cancelled", appointment });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getMedRecords = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized: Patient access required" }, { status: 403 });
        }

        const patientName = decoded.fullName || "";

        const medRecords = await MedRecord.aggregate([
            { $match: { patientName: { $regex: new RegExp(`^${patientName}$`, 'i') } } },
            {
                $lookup: {
                    from: 'prescriptions',
                    localField: '_id',
                    foreignField: 'recordID',
                    as: 'prescriptions'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json({ medRecords, success: true });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getPrescriptions = async (req) => {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized: Patient access required" }, { status: 403 });
        }

        const patientName = decoded.fullName || "";

        const prescriptions = await Prescription.aggregate([
            {
                $lookup: {
                    from: 'medrecords',
                    localField: 'recordID',
                    foreignField: '_id',
                    as: 'medRecord'
                }
            },
            { $unwind: { path: '$medRecord', preserveNullAndEmptyArrays: true } },
            { $match: { 'medRecord.patientName': { $regex: new RegExp(`^${patientName}$`, 'i') } } },
            {
                $project: {
                    medicationName: 1,
                    dosage: 1,
                    instructions: 1,
                    duration: 1,
                    createdAt: 1,
                    medRecord: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json({ prescriptions, success: true });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getDoctors = async (req) => {
    try {
        await dbConnect();
        const doctors = await User.find({ role: "doctor" }).select("fullName role photoURL docSpecialization");
        return NextResponse.json({ doctors, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getAllAppointments = async (req) => {
    try {
        await dbConnect();
        const appointments = await Appointment.find();
        return NextResponse.json({ appointments, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const addPreConsultation = async (req) => {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized: Patient access required" }, { status: 403 });
        }

        const body = await req.json();
        const { error } = preConsultationSchemaPatient.validate(body);
        if (error) {
            return NextResponse.json({ message: error.details[0].message, success: false }, { status: 400 });
        }

        const patientName = decoded.fullName;
        const patientId = decoded.id;

        const appointment = await Appointment.findById(body.appointmentId);
        if (!appointment) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });

        
        if (appointment.appointmentStatus === "cancelled") return NextResponse.json({ message: "Appointment is cancelled" }, { status: 400 });

        const existing = await PreConsultation.findOne({ appointmentId: body.appointmentId });
        if (existing) return NextResponse.json({ message: "PreConsultation already exists" }, { status: 400 });

        const preConsultation = await PreConsultation.create({
            patientName,
            patientId,
            appointmentId: body.appointmentId,
            symptoms: body.symptoms,
            allergies: body.allergies,
            medications: body.medications,
            medicalHistory: body.medicalHistory,
        });
        return NextResponse.json({ preConsultation, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}