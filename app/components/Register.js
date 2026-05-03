"use client";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore.js";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, User, KeyRound } from "lucide-react";
import Link from "next/link";

export default function Register() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const registerSchema = yup.object().shape({
        fullName: yup.string().min(3, "Name must be at least 3 characters").required("Full name is required"),
        email: yup.string().email("Invalid email format").required("Email is required"),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        photoURL: yup.string().transform((v) => (v === "" ? null : v)).url("Must be a valid URL").nullable(),
        adminSecret: yup.string().optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: yupResolver(registerSchema)
    });

    const watchedFullName = watch("fullName");

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            let finalPhotoURL = "";

            // 1. Upload image if one is selected
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadRes = await axios.post("/api/auth/upload", formData);
                finalPhotoURL = uploadRes.data.url;
            }

            // 2. Register user
            const response = await axios.post(
                "/api/auth/register",
                { ...data, photoURL: finalPhotoURL, email: data.email?.trim() },
                { withCredentials: true }
            );

            const userData = response.data.user;
            setUser(userData);
            const userRole = userData.role?.toLowerCase();
            const isAdmin = userRole === 'admin';
            toast.success(
                isAdmin
                    ? "Admin account created successfully!"
                    : "Account created successfully!"
            );
            const rolePaths = {
                admin: "/dashboards/dashboardPage",
                doctor: "/dashboards/doctorPage",
                receptionist: "/dashboards/receptionistPage",
                patient: "/dashboards/patientPage",
            };
            router.push(rolePaths[userRole] || "/dashboards/patientPage");
        } catch (error) {
            console.error("Registration Error:", error);
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || "Registration failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 pt-24 pb-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-8 md:p-12 shadow-2xl shadow-indigo-500/10">

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20">
                            <UserPlus className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            User <span className="text-indigo-500">Registration</span>
                        </h1>
                        <p className="text-slate-300 mt-2 font-medium">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                {/* High-End Avatar Editor */}
                                <div className="bg-slate-950/50 p-8 rounded-[3rem] border border-slate-800 flex flex-col items-center gap-6 group hover:bg-slate-800 hover:border-indigo-100 transition-all duration-500">
                                    <div className="relative">
                                        <div className="w-36 h-36 rounded-[3rem] bg-indigo-600 flex items-center justify-center p-1.5 shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50/50 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 ease-out overflow-hidden">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="ProfilePreview"
                                                    className="w-full h-full rounded-[2.5rem] object-cover"
                                                />
                                            ) : (
                                                <span className="text-5xl font-black text-white">
                                                    {watchedFullName?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-indigo-600 border-4 border-white rounded-2xl shadow-xl shadow-black/40 flex items-center justify-center text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <label className="cursor-pointer bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-indigo-600 shadow-xl shadow-black/40 transition-all border-0 active:scale-95">
                                        Select New Media
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <label className="text-sm font-bold text-slate-200 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        {...register("fullName")}
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-bold text-white shadow-sm shadow-black/40"
                                    />
                                </div>
                                {errors.fullName && <p className="text-red-500 text-xs font-semibold ml-1">{errors.fullName.message}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="admin@mediconnect.com"
                                        className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-bold text-white shadow-sm shadow-black/40"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">Secure Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        {...register("password")}
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-bold text-white shadow-sm shadow-black/40"
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-xs font-semibold ml-1">{errors.password.message}</p>}
                            </div>

                            {/* Admin Secret */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-200 ml-1">Master Secret Key</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                                    <input
                                        {...register("adminSecret")}
                                        type="password"
                                        placeholder="Enter initialization code"
                                        className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-12 pr-5 py-4 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:outline-none transition-all placeholder:text-slate-600 font-bold text-white shadow-sm shadow-black/40"
                                    />
                                </div>
                                {errors.adminSecret && <p className="text-red-500 text-xs font-semibold ml-1">{errors.adminSecret.message}</p>}
                                <p className="text-[10px] text-slate-400 mt-1 ml-1 leading-relaxed">
                                    Requires the <code>ADMIN_SECRET</code> defined in system environment variables.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-2xl py-5 text-white font-black text-lg transition-all transform shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ${loading
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 hover:-translate-y-1 active:translate-y-0.5"
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Initializing...</span>
                                    </>
                                ) : (
                                    <>
                                        Initialize Admin Access
                                        <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="text-center pt-4">
                            <Link href="/auth/loginPage" className="text-sm text-slate-400 hover:text-indigo-400 font-bold transition-colors">
                                Return to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}