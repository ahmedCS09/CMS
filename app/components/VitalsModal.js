"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Activity, Thermometer, Droplets, Heart, Scale, Zap, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function VitalsModal({ isOpen, onClose, patientId }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const vitalsSchema = yup.object({
        temperature: yup.string().required("Temperature is required"),
        sugar: yup.string().required("Sugar is required"),
        bp: yup.string().required("Blood Pressure is required"),
        pulse: yup.string().required("Pulse is required"),
        weight: yup.string().required("Weight is required")
    });

    const { register, formState: { errors }, handleSubmit } = useForm({
        resolver: yupResolver(vitalsSchema),
        defaultValues: {
            temperature: "",
            sugar: "",
            bp: "",
            pulse: "",
            weight: ""
        }
    });

    const onSubmit = async (data) => {
        if (!patientId) {
            toast.error("Invalid Patient Selection");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put("/api/nurse/updatePreConsultation", {
                id: patientId,
                data: {
                    temperature: Number(data.temperature),
                    sugar: Number(data.sugar),
                    pulse: Number(data.pulse),
                    weight: Number(data.weight),
                    bp: data.bp
                }
            });

            if (response.data.success) {
                toast.success("Vitals Authorized & Recorded");
                queryClient.invalidateQueries(["preConsultations"]);
                onClose();
            } else {
                toast.error(response.data.message || "Authorization Failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Internal Server Sync Error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-10 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Activity className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Clinical Vitals</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Authorized Medical Assessment Portal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <VitalsInput label="Temperature (°C)" name="temperature" icon={Thermometer} register={register} errors={errors} placeholder="36.5" color="text-amber-400" />
                        <VitalsInput label="Blood Sugar" name="sugar" icon={Zap} register={register} errors={errors} placeholder="95" color="text-blue-400" />
                        <VitalsInput label="BP (mmHg)" name="bp" icon={Droplets} register={register} errors={errors} placeholder="120/80" color="text-rose-400" type="text" />
                        <VitalsInput label="Heart Rate" name="pulse" icon={Heart} register={register} errors={errors} placeholder="72" color="text-red-400" />
                        <VitalsInput label="Weight (KG)" name="weight" icon={Scale} register={register} errors={errors} placeholder="70" color="text-emerald-400" />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Authorize & Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function VitalsInput({ label, name, icon: Icon, placeholder, register, errors, color, type = "number" }) {
    return (
        <div className="space-y-3">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                <Icon className={`w-3 h-3 ${color}`} /> {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className={`w-full bg-slate-950 border ${errors[name] ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-2xl py-5 px-6 text-white font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/10`}
            />
            {errors[name] && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors[name].message}</p>}
        </div>
    );
}