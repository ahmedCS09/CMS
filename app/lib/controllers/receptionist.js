import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Appointment from "@/models/appointmentsModel";
import User from "@/models/userModel";
import { verifyToken } from "@/lib/utils/tokenUtils";
import Joi from "joi";

const updateAppointmentStatusSchema = Joi.object({
    appointmentId: Joi.string().required(),
    status: Joi.string().required()
});

const createAppointmentSchema = Joi.object({
    patientId: Joi.string().required(),
    patientName: Joi.string().required(),
    doctorId: Joi.string().required(),
    doctorName: Joi.string().required(),
    date: Joi.string().required(),
    time: Joi.string().required()
});

export const getAllAppointments = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== "receptionist" && decoded.role !== "admin")) {
            return NextResponse.json({ message: "Forbidden: Receptionist/Admin access required" }, { status: 403 });
        }

        const appointments = await Appointment.find()
            .populate('patientId', 'age')
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        return NextResponse.json({ appointments });

    } catch (error) {
        console.error("GetAllAppointments Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const updateAppointmentStatus = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== "receptionist" && decoded.role !== "admin")) {
            return NextResponse.json({ message: "Forbidden: Receptionist/Admin access required" }, { status: 403 });
        }

        const { appointmentId, status } = await req.json();
        const { error } = updateAppointmentStatusSchema.validate({ appointmentId, status });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { appointmentStatus: status },
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Appointment status updated", appointment });

    } catch (error) {
        console.error("UpdateStatus Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const createAppointment = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== "receptionist" && decoded.role !== "admin")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { patientId, patientName, doctorId, doctorName, date, time } = await req.json();
        const { error } = createAppointmentSchema.validate({ patientId, patientName, doctorId, doctorName, date, time });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }

        const appointment = await Appointment.create({
            id: "APT-" + Date.now(),
            patientId,
            patientName,
            doctorId,
            doctorName,
            appointmentDate: date,
            appointmentTime: time,
            appointmentStatus: "pending",
        });

        return NextResponse.json({ message: "Appointment registered successfully", appointment });

    } catch (error) {
        console.error("CreateAppointment Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const getUsersByRole = async (req) => {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== "receptionist" && decoded.role !== "admin")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const doctors = await User.find({ role: 'doctor' }).select('fullName _id');
        const patients = await User.find({ role: 'patient' }).select('fullName _id');

        return NextResponse.json({ doctors, patients });

    } catch (error) {
        console.error("GetUsersByRole Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
