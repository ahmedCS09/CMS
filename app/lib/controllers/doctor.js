import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/appointmentsModel";
import Prescription from "@/models/prescriptionsModel";
import { verifyToken } from "@/lib/utils/tokenUtils";

export const getDoctorAppointments = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "doctor") {
            return NextResponse.json({ message: "Forbidden: Doctor role required" }, { status: 403 });
        }

        const appointments = await Appointment.find({ doctorId: decoded.id });
        return NextResponse.json({ appointments });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

        if (appointment.doctorId.toString() !== decoded.id) {
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

        const { appointmentId, medicationName, dosage, instructions, duration, recordID } = await req.json();

        const prescription = await Prescription.create({
            id: "RX-" + Date.now(),
            recordID: recordID || appointmentId,
            medicationName,
            dosage,
            instructions,
            duration,
        });

        return NextResponse.json({ message: "Prescription added successfully", prescription });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}