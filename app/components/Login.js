"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore.js";
import { toast } from "sonner";
import { ShieldCheck, Stethoscope, Users, UserCircle, BriefcaseMedical } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    role: yup.string().oneOf(['admin', 'doctor', 'receptionist', 'patient', 'nurse'], "Please select a valid role").required("Role selection is required"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      role: 'patient'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "/api/auth/login",
        { ...data, email: data.email?.trim() },
        { withCredentials: true }
      );
      const userData = response.data.user;
      setUser(userData);
      toast.success("Login successful!");

      const userRole = userData.role?.toLowerCase();
      const rolePaths = {
        admin: "/dashboards/dashboardPage",
        doctor: "/dashboards/doctorPage",
        receptionist: "/dashboards/receptionistPage",
        patient: "/dashboards/patientPage",
        nurse: "/dashboards/nurseDashboard",
      };

      const destination = rolePaths[userRole] || "/dashboards/patientPage";
      router.push(destination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'patient', label: 'Patient', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'receptionist', label: 'Staff', icon: BriefcaseMedical, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { id: 'nurse', label: 'Nurse', icon: Stethoscope, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 pt-24 pb-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-8 md:p-12 shadow-2xl shadow-indigo-500/10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 mb-4">
              <img src="/mediconnect_logo.png" alt="MediConnect Logo" className="h-16 w-auto drop-shadow-xl hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              Medi<span className="text-indigo-500">Connect</span>
            </h1>
            <p className="text-slate-300 mt-2 font-medium">Portal Access Terminal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <input type="hidden" {...register('role')} />
            {/* Role Selection Grid */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roles.map((role) => (
                   <button
                    key={role.id}
                    type="button"
                    onClick={() => setValue('role', role.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 group ${selectedRole === role.id
                      ? `border-indigo-500 bg-indigo-500/10 scale-105 shadow-lg shadow-black/40`
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                  >
                    <role.icon className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${selectedRole === role.id ? 'text-indigo-400' : 'text-slate-400'
                      }`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedRole === role.id ? 'text-indigo-400' : 'text-slate-400'
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
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-200 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="name@company.com"
                    className={`w-full bg-slate-950 border-2 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-700 focus:bg-slate-900 outline-none transition-all font-bold text-slate-100 shadow-sm shadow-black/40 ${errors.email ? 'border-red-300' : 'border-transparent'}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-bold text-slate-200">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-all hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </span>
            </button>
            <div className="text-center pt-4">
              <Link href="/auth/registerPage" className="text-sm text-slate-400 hover:text-indigo-400 font-bold transition-colors">
                Don't have an account? Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
