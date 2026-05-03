"use client"
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { X, Activity, Thermometer, AlertCircle, Pill, FileText, Send, Loader2 } from "lucide-react";

export default function PreConsultationForm({ isOpen, onClose, appointment, appointmentId }) {
    const [loading, setLoading] = useState(false);

    const preConsultationSchema = yup.object({
        symptoms: yup.string().required("Symptoms are required"),
        allergies: yup.string().required("Allergies are required"),
        medications: yup.string().optional(),
        medicalHistory: yup.string().optional(),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(preConsultationSchema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post("/api/patient/addPreConsultation", {
                ...data,
                appointmentId
            });

            console.log("Pre-consultation response:", response);
            
            if (response.data.success || response.data.preConsultation) {
                toast.success("Health Assessment Submitted Successfully");
                onClose();
            } else {
                toast.error(response.data.message || "Failed to submit assessment");
            }
        } catch (error) {
            console.error("Error submitting pre-consultation data:", error);
            toast.error(error.response?.data?.message || "Failed to submit pre-consultation data");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 sm:p-10 w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
                {/* Ambient Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Activity className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Pre-Consultation</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">
                                Patient: <span className="text-indigo-400 font-bold">{appointment.patientName}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    {/* Symptoms */}
                    <div className="space-y-3">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Thermometer className="w-3 h-3 text-indigo-400" /> Current Symptoms
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Fever, headache, cough..."
                            {...register("symptoms")}
                            className={`w-full bg-slate-950 border ${errors.symptoms ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-2xl py-4 px-5 text-white font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/10`}
                        />
                        {errors.symptoms && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.symptoms.message}</p>}
                    </div>

                    {/* Allergies */}
                    <div className="space-y-3">
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-rose-400" /> Known Allergies
                        </label>
                        <input
                            type="text"
                            placeholder="Any drug or food allergies?"
                            {...register("allergies")}
                            className={`w-full bg-slate-950 border ${errors.allergies ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-2xl py-4 px-5 text-white font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/10`}
                        />
                        {errors.allergies && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.allergies.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Medications */}
                        <div className="space-y-3">
                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Pill className="w-3 h-3 text-emerald-400" /> Active Medications
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Current medicines..."
                                {...register("medications")}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-5 text-white font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                            />
                        </div>

                        {/* Medical History */}
                        <div className="space-y-3">
                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FileText className="w-3 h-3 text-amber-400" /> Medical History
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Past conditions..."
                                {...register("medicalHistory")}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-4 px-5 text-white font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="flex-[2] bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                            ) : (
                                <><Send className="w-4 h-4" /> Submit Assessment</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}