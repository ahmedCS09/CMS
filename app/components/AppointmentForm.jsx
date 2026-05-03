"use client";

import axios from "axios";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, X, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";

export default function AppointmentForm({ isOpen, onClose }) {
    const queryClient = useQueryClient();

    const schema = yup.object({
        patientId: yup.string().required("Patient is required"),
        doctorId: yup.string().required("Doctor is required"),
        appointmentDate: yup.string().required("Appointment date is required"),
        appointmentTime: yup.string().required("Appointment time is required")
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            patientId: "",
            doctorId: "",
            appointmentDate: "",
            appointmentTime: ""
        }
    });

    // Fetch Lists for Registration
    const { data: usersData } = useQuery({
        queryKey: ["usersForBooking"],
        queryFn: async () => {
            const res = await axios.get("/api/receptionist/getUsersByRole");
            return res.data;
        },
        enabled: isOpen
    });

    // Register Appointment Mutation
    const registerMutation = useMutation({
        mutationFn: async (data) => {
            // Model uses: id, patientId, patientName, doctorId, doctorName, appointmentDate, appointmentTime
            const selectedPatient = usersData?.patients?.find(p => String(p._id) === String(data.patientId));
            const selectedDoctor = usersData?.doctors?.find(d => String(d._id) === String(data.doctorId));
            const payload = {
                patientId: data.patientId,
                patientName: selectedPatient?.fullName || "Patient",
                doctorId: data.doctorId,
                doctorName: selectedDoctor?.fullName || "Doctor",
                date: data.appointmentDate,
                time: data.appointmentTime
            };
            const res = await axios.post("/api/receptionist/registerAppointment", payload);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            reset();
            queryClient.invalidateQueries(["allAppointments"]);
            if (data.appointment) {
                const socketPayload = { ...data.appointment, _isNewAppointment: true };
                socket.emit("appointmentStatusUpdated", socketPayload);
            }
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Registration failed");
        }
    });

    if (!isOpen) return null;

    const onSubmit = (data) => {
        registerMutation.mutate(data);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="bg-[#0f172a] w-full max-w-xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 p-1 md:p-1.5 border border-white/10 animate-in zoom-in duration-500 overflow-hidden">
                {/* Decorative Background Accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-[80px]" />

                <div className="bg-[#020617] rounded-[2.85rem] p-8 md:p-12 h-full w-full relative z-10 border border-white/5">
                    <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-3xl flex items-center justify-center shadow-[0_15px_35px_rgba(79,70,229,0.3)]">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">Book <span className="text-indigo-400">Consultation</span></h2>
                                <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-[0.25em] opacity-60">Electronic Medical Registry</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-900/80 hover:bg-white/10 hover:text-white rounded-2xl transition-all duration-300 text-slate-400 border border-white/10 group"
                        >
                            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            {/* Entity Selection Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/90 ml-1">Patient Subject</label>
                                    <div className="relative group">
                                        <select
                                            className={`w-full bg-slate-950/80 border-2 rounded-2xl py-4.5 px-6 focus:ring-0 focus:border-indigo-400 hover:border-slate-800 outline-none transition-all duration-300 font-black text-slate-100 shadow-2xl appearance-none relative z-10 ${errors.patientId ? 'border-red-500/50' : 'border-white/5'}`}
                                            {...register("patientId")}
                                        >
                                            <option value="" className="bg-[#020617] text-slate-400">Select Patient</option>
                                            {usersData?.patients?.map(p => (
                                                <option key={p._id} value={p._id} className="bg-[#020617] text-white py-4">{p.fullName}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors rotate-90 z-20 pointer-events-none" />
                                    </div>
                                    {errors.patientId && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.patientId.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/90 ml-1">Medical Staff</label>
                                    <div className="relative group">
                                        <select
                                            className={`w-full bg-slate-950/80 border-2 rounded-2xl py-4.5 px-6 focus:ring-0 focus:border-indigo-400 hover:border-slate-800 outline-none transition-all duration-300 font-black text-slate-100 shadow-2xl appearance-none relative z-10 ${errors.doctorId ? 'border-red-500/50' : 'border-white/5'}`}
                                            {...register("doctorId")}
                                        >
                                            <option value="" className="bg-[#020617] text-slate-400">Select Doctor</option>
                                            {usersData?.doctors?.map(d => (
                                                <option key={d._id} value={d._id} className="bg-[#020617] text-white py-4">{d.fullName}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors rotate-90 z-20 pointer-events-none" />
                                    </div>
                                    {errors.doctorId && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.doctorId.message}</p>}
                                </div>
                            </div>

                            {/* Temporal Selection Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 p-4 bg-white/[0.02] rounded-3xl border border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 ml-1">Appointment Date</label>
                                    <input
                                        type="date"
                                        className={`w-full bg-slate-950/80 border-2 rounded-2xl py-4 px-6 focus:ring-0 focus:border-emerald-400 hover:border-slate-800 outline-none transition-all duration-300 font-black text-white [color-scheme:dark] ${errors.appointmentDate ? 'border-red-500/50' : 'border-white/5'}`}
                                        {...register("appointmentDate")}
                                    />
                                    {errors.appointmentDate && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-tighter">{errors.appointmentDate.message}</p>}
                                </div>

                                <div className="space-y-3 p-4 bg-white/[0.02] rounded-3xl border border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 ml-1">Time Slot</label>
                                    <input
                                        type="time"
                                        className={`w-full bg-slate-950/80 border-2 rounded-2xl py-4 px-6 focus:ring-0 focus:border-emerald-400 hover:border-slate-800 outline-none transition-all duration-300 font-black text-white [color-scheme:dark] ${errors.appointmentTime ? 'border-red-500/50' : 'border-white/5'}`}
                                        {...register("appointmentTime")}
                                    />
                                    {errors.appointmentTime && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-tighter">{errors.appointmentTime.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="w-full py-5.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(79,70,229,0.35)] hover:-translate-y-1.5 transition-all duration-500 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <div className="relative flex items-center justify-center gap-4">
                                    {registerMutation.isPending ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            CREATE RESERVATION
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
