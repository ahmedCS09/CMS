import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Appointment from "@/models/appointmentModel";
import { verifyToken } from "@/utils/verifyToken";

export const bookAppointment = async (req) => {
  try {
    await dbConnect();

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "patient") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { doctorId, date, time } = await req.json();

    const appointment = await Appointment.create({
      patientId: decoded.id,
      doctorId,
      date,
      time,
      status: "pending",
    });

    return NextResponse.json({ message: "Appointment booked", appointment });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const getAppointments = async (req) => {
  try {
    await dbConnect();

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "patient") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "patient") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await req.json();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    if (appointment.patientId.toString() !== decoded.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return NextResponse.json({ message: "Appointment cancelled", appointment });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const updateAppointment = async (req) => {
  try {
    await dbConnect();

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "patient") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId, date, time } = await req.json();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    if (appointment.patientId.toString() !== decoded.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    appointment.date = date;
    appointment.time = time;
    await appointment.save();

    return NextResponse.json({ message: "Appointment updated", appointment });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}