"use client";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Lock, Loader2, Users, Calendar, ClipboardList } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import useUIStore from "@/store/useUIStore";

export default function Receptionist() {
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

    if (user?.role !== 'receptionist') {
        return (
            <div className="min-h-screen bg-slate-950 pt-32 px-6 flex items-center justify-center">
                <div className="text-center bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl shadow-black/60 border border-slate-800 max-w-md">
                   <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-100">Access Restricted</h2>
                    <p className="text-slate-300 mt-2 mb-8 font-medium font-bold uppercase tracking-tight">This terminal is reserved for Receptionists.</p>
                    <button onClick={() => router.push('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-black/20">Go Home</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar (now role-aware) */}
            <AdminSidebar />

            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-72"} pt-24 pb-12 px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-sm shadow-black/60 border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black text-white tracking-tight">Reception <span className="text-indigo-600">Terminal</span></h1>
                            <p className="text-slate-300 font-medium mt-2">Welcome, {user.fullName}. Manage patient flow and registrations.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Action Card */}
                        <div
                            onClick={() => router.push('/auth/registerReceptionistPage')}
                            className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-black/60 cursor-pointer hover:scale-[1.02] transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <Users className="w-12 h-12 mb-6 text-indigo-100" />
                            <h3 className="text-xl font-black tracking-tight">Register New Patient</h3>
                            <p className="text-indigo-100/80 text-sm font-medium mt-2 leading-relaxed">Fast-track patient onboarding and credential generation.</p>
                        </div>

                        {/* Status Card 1 */}
                        <button onClick={() => router.push('/receptionist/appointmentsPage')} className="cursor-pointer text-left w-full block bg-slate-900 rounded-[2rem] p-8 border border-slate-800 hover:border-emerald-500/50 shadow-sm shadow-black/40 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
                            <Calendar className="w-12 h-12 mb-6 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-xl font-black text-white tracking-tight">Today's Visits</h3>
                            <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">Monitor scheduled appointments and check-in statuses.</p>
                        </button>

                        {/* Status Card 2 */}
                        <button onClick={() => router.push('/patient/viewMedRecordsPage')} className="cursor-pointer text-left w-full block bg-slate-900 rounded-[2rem] p-8 border border-slate-800 hover:border-amber-500/50 shadow-sm shadow-black/20 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
                            <ClipboardList className="w-12 h-12 mb-6 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-xl font-black text-white tracking-tight">Visit Records</h3>
                            <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">Access historical patient visit data and registration logs.</p>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}