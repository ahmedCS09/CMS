import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/appointmentsModel";
import { verifyToken } from "@/lib/utils/tokenUtils";

export const bookAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { doctorId, date, time } = await req.json();

        const appointment = await Appointment.create({
            id: "APT-" + Date.now(),
            patientId: decoded.id,
            doctorId,
            appointmentDate: date,
            appointmentTime: time,
            appointmentStatus: "pending",
        });

        return NextResponse.json({ message: "Appointment booked", appointment });

    } catch (error) {
        console.error("BookAppointment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const getAppointments = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const appointments = await Appointment.find({ patientId: decoded.id });

        return NextResponse.json({ appointments });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

export const updateAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "patient") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { appointmentId, date, time } = await req.json();

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        if (appointment.patientId.toString() !== decoded.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (date) appointment.appointmentDate = date;
        if (time) appointment.appointmentTime = time;
        await appointment.save();

        return NextResponse.json({ message: "Appointment updated", appointment });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}