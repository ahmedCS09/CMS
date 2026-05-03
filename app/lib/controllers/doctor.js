import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/appointmentsModel";
import Prescription from "@/models/prescriptionsModel";
import MedRecord from "@/models/medRecordsModel";
import PreConsultation from "@/models/preConsultationModel";
import { verifyToken } from "@/lib/utils/tokenUtils";
import Joi from "joi";

const prescriptionSchema = Joi.object({
    appointmentId: Joi.string().required(),
    medicationName: Joi.string().required(),
    dosage: Joi.string().required(),
    instructions: Joi.string().required(),
    duration: Joi.string().required(),
    diagnosis: Joi.string().required()
});

const updateAppointmentStatusSchema = Joi.object({
    appointmentId: Joi.string().required(),
    status: Joi.string().required()
});

export const getAppointmentsDoc = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Forbidden: Doctor role required", success: false }, { status: 403 });
        }

        const doctorIdString = String(decoded.id);
        const doctorName = decoded.fullName || "";

        const appointments = await Appointment.find({
            $or: [
                { doctorId: doctorIdString },
                { doctorId: new mongoose.Types.ObjectId(doctorIdString) },
                { doctorName: { $regex: new RegExp(`^${doctorName}$`, 'i') } }
            ]
        })
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .lean();

        return NextResponse.json({ 
            appointments: appointments || [],
            success: true 
        });

    } catch (error) {
        console.error("GetDoctorAppointments Error:", error);
        return NextResponse.json({ 
            appointments: [],
            message: error.message,
            success: false 
        }, { status: 500 });
    }
}

export const updateAppointmentStatus = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Forbidden: Doctor role required", success: false }, { status: 403 });
        }

        const { appointmentId, status } = await req.json();
        const { error } = updateAppointmentStatusSchema.validate({ appointmentId, status });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found", success: false }, { status: 404 });
        }

        const isAuthorized = 
            (appointment.doctorId && appointment.doctorId.toString() === decoded.id) || 
            (appointment.doctorName && decoded.fullName && appointment.doctorName.toLowerCase() === decoded.fullName.toLowerCase());

        if (!isAuthorized) {
            return NextResponse.json({ message: "Unauthorized access to this appointment", success: false }, { status: 401 });
        }

        const validStatuses = ['pending', 'rejected', 'checked-in', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: "Invalid status", success: false }, { status: 400 });
        }

        appointment.appointmentStatus = status;
        await appointment.save();

        return NextResponse.json({ 
            message: `Appointment ${status} successfully`, 
            appointment,
            success: true 
        });

    } catch (error) {
        console.error("UpdateAppointmentStatus Error:", error);
        return NextResponse.json({ 
            message: error.message,
            success: false 
        }, { status: 500 });
    }
}

export const cancelDoctorAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Forbidden: Doctor role required" }, { status: 403 });
        }

        const { appointmentId } = await req.json();

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        const isAuthorized = 
            (appointment.doctorId && appointment.doctorId.toString() === decoded.id) || 
            (appointment.doctorName && decoded.fullName && appointment.doctorName.toLowerCase() === decoded.fullName.toLowerCase());

        if (!isAuthorized) {
            return NextResponse.json({ message: "Unauthorized access to this appointment" }, { status: 401 });
        }

        appointment.appointmentStatus = "cancelled";
        await appointment.save();

        return NextResponse.json({ message: "Appointment cancelled by doctor", appointment });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function addPrescription(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { appointmentId, medicationName, dosage, instructions, duration, diagnosis } = await req.json();
        const { error } = prescriptionSchema.validate({ appointmentId, medicationName, dosage, instructions, duration, diagnosis });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }

        // 1. Get the appointment details to populate the medical record
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        // 2. Create the Medical Record first
        const medRecord = await MedRecord.create({
            userId: appointment.patientId,
            appointmentId: appointmentId,
            patientName: appointment.patientName,
            doctorName: appointment.doctorName || decoded.fullName,
            diagnosis: diagnosis || "General Consultation",
        });

        // 3. Create the Prescription linked to the new Medical Record
        const prescription = await Prescription.create({
            recordID: medRecord._id, // Must be an ObjectId referencing the MedRecord
            medicationName,
            dosage,
            instructions,
            duration,
        });

        appointment.appointmentStatus = "completed";
        await appointment.save();

        return NextResponse.json({ 
            message: "Prescription and Medical Record added successfully", 
            prescription,
            medRecord 
        });

    } catch (error) {
        console.error("AddPrescription Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function getMedRecordsDoc(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const medRecords = await MedRecord.aggregate([
            { $match: { doctorName: decoded.fullName } },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: "$userId", patientName: "$patientName" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$fullName", "$$patientName"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
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

        return NextResponse.json({ medRecords });

    } catch (error) {
        console.error("GetMedRecords Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getPreConsultationByPatient = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { patientName } = await req.json();
        const preConsultation = await PreConsultation.findOne({ patientName });
        return NextResponse.json({ preConsultation });
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getMedRecordsByAppointmentID = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { appointmentId } = await req.json();
        const medRecords = await MedRecord.find({ appointmentId });
        if(!medRecords){
            return NextResponse.json({ message: "No med records found" }, { status: 404 });
        }
        return NextResponse.json({ medRecords });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}