"use client";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldPlus, Stethoscope, BriefcaseMedical, UserPlus, HeartPulse } from "lucide-react";

export default function RegisterAdmin() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const registerSchema = yup.object().shape({
        fullName: yup.string().min(3, "Name must be at least 3 characters").required("Full name is required"),
        email: yup.string().email("Invalid email format").required("Email is required"),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        role: yup.string().oneOf(['doctor', 'receptionist', 'nurse'], "Please select a valid staff role").required("Role is required"),
        docSpecialization: yup.string().when('role', {
            is: 'doctor',
            then: (schema) => schema.required("Doctor specialization is required"),
            otherwise: (schema) => schema.optional()
        })
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            role: 'doctor'
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post("/api/admin/registerAdmin", data);
            toast.success(response.data.message || "Staff registered successfully!");
            reset(); // Clear form after successful registration
            router.push("/dashboards/dashboardPage"); // Redirect to admin dashboard or staff list
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const staffRoles = [
        { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'receptionist', label: 'Receptionist', icon: BriefcaseMedical, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'nurse', label: 'Nurse', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 pt-24 pb-12 md:px-8 md:pt-32 md:pb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-8 md:p-12 shadow-2xl shadow-black/80">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-black/40">
                            <ShieldPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Register <span className="text-indigo-500">Staff</span>
                        </h1>
                        <p className="text-slate-300 mt-2 font-medium">Administrator Panel - New User Creation</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Role Selection Grid */}
                         <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1">
                                Select Staff Role
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {staffRoles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setValue('role', role.id)}
                                        className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 group ${selectedRole === role.id
                                            ? `border-indigo-500 bg-indigo-500/10 scale-105`
                                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                                            }`}
                                    >
                                        <role.icon className={`w-8 h-8 mb-2 transition-transform duration-300 group-hover:scale-110 ${selectedRole === role.id ? 'text-indigo-400' : 'text-slate-500'
                                            }`} />
                                        <span className={`text-xs font-black uppercase tracking-tighter ${selectedRole === role.id ? 'text-indigo-400' : 'text-slate-500'
                                            }`}>
                                            {role.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {errors.role && (
                                <p className="text-red-500 text-xs font-semibold ml-1">{errors.role.message}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">
                                    Full Name
                                </label>
                                <input
                                    {...register("fullName")}
                                    type="text"
                                    placeholder="Dr. John Doe / Jane Staff"
                                    className={`w-full bg-slate-950 border-2 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-700 focus:bg-slate-900 outline-none transition-all font-bold text-slate-100 shadow-sm shadow-black/40 ${errors.fullName ? 'border-red-300' : 'border-transparent'}`}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs font-semibold ml-1">{errors.fullName.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">
                                    Email Address
                                </label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="staff@mediconnect.com"
                                    className={`w-full bg-slate-950 border-2 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-700 focus:bg-slate-900 outline-none transition-all font-bold text-slate-100 shadow-sm shadow-black/40 ${errors.email ? 'border-red-300' : 'border-transparent'}`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">
                                    Initial Password
                                </label>
                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`w-full bg-slate-950 border-2 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-700 focus:bg-slate-900 outline-none transition-all font-bold text-slate-100 shadow-sm shadow-black/40 ${errors.password ? 'border-red-300' : 'border-transparent'}`}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs font-semibold ml-1">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Doctor Specialization */}
                        {selectedRole === 'doctor' && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">
                                    Doctor Specialization
                                </label>
                                <input
                                    {...register("docSpecialization")}
                                    type="text"
                                    placeholder="Cardiology / Neurology / etc."
                                    className={`w-full bg-slate-950 border-2 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-700 focus:bg-slate-900 outline-none transition-all font-bold text-slate-100 shadow-sm shadow-black/40 ${errors.docSpecialization ? 'border-red-300' : 'border-transparent'}`}
                                />
                                {errors.docSpecialization && (
                                    <p className="text-red-500 text-xs font-semibold ml-1">{errors.docSpecialization.message}</p>
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-2xl py-5 text-white font-black text-lg transition-all transform shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ${loading
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0.5"
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        Complete Staff Registration
                                        <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
