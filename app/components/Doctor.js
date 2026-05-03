"use client";
import AdminSidebar from "@/components/AdminSidebar";
import useAuthStore from "@/store/useAuthStore";
import useUIStore from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Stethoscope, Calendar, Users, Loader2 } from "lucide-react";

export default function Doctor() {
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
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black text-white tracking-tight">Clinical <span className="text-indigo-400">Terminal</span></h1>
                            <p className="text-slate-300 font-medium mt-2 text-lg">Good day, Dr. {user?.fullName?.split(' ').pop()}. Reviewing patient list and schedule.</p>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button onClick={() => router.push("/doctor/viewAppointmentsDocPage#today")} className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-sm shadow-black/60 hover:bg-slate-800 transition-all cursor-pointer text-left">
                            <Users className="w-12 h-12 mb-6 text-indigo-500" />
                            <h3 className="text-xl font-bold text-white">Today's Patients</h3>
                            <p className="text-slate-300 text-sm mt-2">Access clinical records and session logs for current queue.</p>
                        </button>
                        
                        <button onClick={() => router.push("/doctor/viewAppointmentsDocPage#overall")} className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-sm shadow-black/60 hover:bg-slate-800 transition-all cursor-pointer text-left">
                            <Calendar className="w-12 h-12 mb-6 text-emerald-500" />
                            <h3 className="text-xl font-bold text-white">Overall Schedule</h3>
                            <p className="text-slate-300 text-sm mt-2">Manage your clinical sessions and consultation blocks.</p>
                        </button>
 
                        <button onClick={() => router.push("/doctor/viewMedRecordsDocPage")} className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-sm shadow-black/60 hover:bg-slate-800 transition-all cursor-pointer text-left">
                            <Stethoscope className="w-12 h-12 mb-6 text-amber-500" />
                            <h3 className="text-xl font-bold text-white">Medical Archives</h3>
                            <p className="text-slate-300 text-sm mt-2">Review historical treatment plans and prescription logs.</p>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}