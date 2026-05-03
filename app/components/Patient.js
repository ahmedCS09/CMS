"use client";
import AdminSidebar from "@/components/AdminSidebar.js";
import useAuthStore from "@/store/useAuthStore";
import useUIStore from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Calendar, Activity, Loader2, ChevronRight, Stethoscope } from "lucide-react";
import AppointmentPieChart from "./AppointmentPieChart";
import SymptomChecker from "./SymptomCheck";

export default function Patient() {
    const { user, authLoading } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <AdminSidebar />
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-72"} pt-24 pb-12 px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-sm shadow-black/60 border border-slate-800 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black text-white tracking-tight">Patient <span className="text-indigo-600">Health Hub</span></h1>
                            <p className="text-slate-300 font-medium mt-2 text-lg">Hello, {user?.fullName}. Welcome to your personal health portal.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Stats Section */}
                        <div className="lg:col-span-4 h-full">
                            <AppointmentPieChart />
                        </div>
                        
                        {/* Action Grid */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button 
                                onClick={() => router.push("/patient/viewAppointmentsPage#upcoming")} 
                                className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl shadow-black/40 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/30 group h-[180px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                    <Calendar className="w-7 h-7 text-emerald-500 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight">Next Visit</h3>
                                <p className="text-slate-500 text-xs mt-2 font-medium max-w-[200px]">Check your clinic appointments.</p>
                                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Open Schedule <ChevronRight className="w-3 h-3" />
                                </div>
                            </button>

                            <button 
                                onClick={() => router.push("/patient/viewDoctorsPage")} 
                                className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl shadow-black/40 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/30 group h-[180px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                    <User className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight">Care Team</h3>
                                <p className="text-slate-500 text-xs mt-2 font-medium max-w-[200px]">Contact your health providers.</p>
                                <div className="mt-4 flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    View Doctors <ChevronRight className="w-3 h-3" />
                                </div>
                            </button>

                            <button 
                                onClick={() => router.push("/patient/buyMedicinesPage")} 
                                className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-xl shadow-black/40 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 group h-[180px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                    <Stethoscope className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight">Buy Medicines</h3>
                                <p className="text-slate-500 text-xs mt-2 font-medium max-w-[200px]">Purchase medicines online.</p>
                                <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Browse Shop <ChevronRight className="w-3 h-3" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* AI assistance */}
                    <SymptomChecker />
                </div>
            </main>
        </div>
    );
}