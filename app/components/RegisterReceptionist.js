"use client";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, FileText, Activity, Loader2, Lock, User, Mail, Key, Hash, Users } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import useUIStore from "@/store/useUIStore";
import { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar.js";

export default function RegisterReceptionist() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, authLoading } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    const registerSchema = yup.object().shape({
        fullName: yup.string().min(3, "Name must be at least 3 characters").required("Full name is required"),
        email: yup.string().email("Invalid email format").required("Email is required"),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        dob: yup.date().typeError("Date of birth must be a valid date").required("Date of birth is required"),
        gender: yup.string().required("Gender is required"),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post("/api/receptionist/registerPatient", data);
            toast.success(response.data.message || "Patient registered successfully!");
            reset(); // Clear form after success
            router.push("/dashboards/receptionistPage"); // Redirect to receptionist dashboard or patient list
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
    );

    if (user?.role !== 'receptionist' && user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-950 pt-32 px-6 flex items-center justify-center">
                <div className="text-center bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl shadow-black/80 border border-slate-800 max-w-md">
                    <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-100">Access Restricted</h2>
                    <p className="text-slate-300 mt-2 mb-8 font-medium font-bold uppercase tracking-tight">Staff Credentials Required.</p>
                    <button onClick={() => router.push('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-black/20">Go Home</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar for navigation */}
            <AdminSidebar />

            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-72"}`}>
                <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                    <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-8 md:p-12 shadow-2xl shadow-black/80">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-2xl mb-4 shadow-lg shadow-black/40">
                                    <Activity className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    Patient <span className="text-emerald-500">Onboarding</span>
                                </h1>
                                <p className="text-slate-300 mt-2 font-medium">Hospital Staff Portal - New Patient Registration</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-6">
                                     {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-200 ml-1">
                                            Patient Full Name
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                {...register("fullName")}
                                                type="text"
                                                placeholder="Patient's Full Name"
                                                className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm shadow-black/40"
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-red-500 text-xs font-semibold ml-1">{errors.fullName.message}</p>
                                        )}
                                    </div>
 
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-200 ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                {...register("email")}
                                                type="email"
                                                placeholder="patient@example.com"
                                                className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm shadow-black/40"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>
                                        )}
                                    </div>
 
                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-200 ml-1">
                                            Temporary Password
                                        </label>
                                        <div className="relative group">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                {...register("password")}
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm shadow-black/40"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-xs font-semibold ml-1">{errors.password.message}</p>
                                        )}
                                    </div>
                                       <div className="grid grid-cols-2 gap-5">
                                        {/* Age */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-200 ml-1">
                                                Date of Birth
                                            </label>
                                            <div className="relative group">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    {...register("dob")}
                                                    type="date"
                                                    placeholder="Date of Birth"
                                                    className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-11 pr-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm shadow-black/40"
                                                />
                                            </div>
                                            {errors.dob && (
                                                <p className="text-red-500 text-xs font-semibold ml-1">{errors.dob.message}</p>
                                            )}
                                        </div>
 
                                        {/* Gender */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-200 ml-1">
                                                Gender
                                            </label>
                                            <div className="relative group">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                                <select
                                                    {...register("gender")}
                                                    className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-11 pr-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm shadow-black/40 appearance-none"
                                                >
                                                    <option className="bg-slate-900" value="">Select Gender</option>
                                                    <option className="bg-slate-900" value="Male">Male</option>
                                                    <option className="bg-slate-900" value="Female">Female</option>
                                                    <option className="bg-slate-900" value="Other">Other</option>
                                                </select>
                                            </div>
                                            {errors.gender && (
                                                <p className="text-red-500 text-xs font-semibold ml-1">{errors.gender.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 flex gap-3">
                                    <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-emerald-300 font-medium leading-relaxed">
                                        Registered patients can log in immediately with these credentials. They'll be prompted to update their profile on first visit.
                                    </p>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full rounded-2xl py-5 text-white font-black text-lg transition-all transform shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ${loading
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0.5"
                                        }`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                Register Patient
                                                <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
