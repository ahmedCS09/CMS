"use client";
import { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "./AdminSidebar";
import useUIStore from "@/store/useUIStore";
import VitalsModal from "@/components/VitalsModal";
import { 
    Activity, 
    User, 
    ClipboardList, 
    RefreshCw,
    AlertCircle,
    LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Nurse() {
    const { isSidebarCollapsed } = useUIStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    const getPreConsultations = async () => {
        const response = await axios.get("/api/nurse/getPreConsultations");
        return Array.isArray(response.data.preConsultations) ? response.data.preConsultations : [];
    }

    const { data: preConsultations, isLoading, error, refetch } = useQuery({
        queryKey: ["preConsultations"],
        queryFn: getPreConsultations
    });

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans">
            <AdminSidebar />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-72"} pt-24 pb-32 px-6 lg:px-12 min-h-screen`}>
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Header Section */}
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-800/50 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Medical Staff Portal</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Nurse <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Care Center</span></h1>
                            <p className="text-slate-400 font-medium mt-3 text-lg max-w-xl">Monitor pre-consultation requests and manage patient vital records with precision.</p>
                        </div>
                        
                        <div className="relative z-10 mt-8 md:mt-0 flex gap-4">
                            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50 backdrop-blur-md min-w-[160px] text-center">
                                <p className="text-4xl font-black text-white leading-none">{preConsultations?.length || 0}</p>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Active Requests</p>
                            </div>
                            <button 
                                onClick={() => refetch()}
                                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95 self-center"
                                title="Refresh Data"
                            >
                                <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                <ClipboardList className="w-6 h-6 text-indigo-400" />
                                Patient Queue
                            </h2>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                Live Feed
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-64 bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/5 border border-red-500/20 p-12 rounded-[2.5rem] flex flex-col items-center text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Sync Error</h3>
                                <p className="text-slate-400 mb-6">{error.message}</p>
                                <button onClick={() => refetch()} className="px-8 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all">Retry Connection</button>
                            </div>
                        ) : preConsultations?.length === 0 ? (
                            <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800/30 rounded-[3rem] py-24 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                    <Activity className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Queue is Empty</h3>
                                <p className="text-slate-500 font-medium">All patients have been successfully assessed.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {preConsultations?.map((item) => (
                                    <div key={item._id} className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/50 p-8 shadow-xl hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col">
                                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                                        </div>

                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <User className="w-7 h-7" />
                                            </div>
                                            <div className="bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 flex items-center gap-2">
                                                <Activity className="w-3 h-3 text-indigo-500" />
                                                <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">Pending Review</span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">{item.patientName}</h3>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Patient ID: {item._id.slice(-8).toUpperCase()}</p>
                                        
                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <ClipboardList className="w-3 h-3" /> Reported Symptoms
                                                </p>
                                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-slate-300 text-xs leading-relaxed font-medium min-h-[60px]">
                                                    {item.symptoms}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/30">
                                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Allergies</p>
                                                    <p className="text-rose-400 text-xs font-bold truncate">{item.allergies || "None"}</p>
                                                </div>
                                                <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/30">
                                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Time</p>
                                                    <p className="text-slate-400 text-xs font-bold">
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vitals Action Button */}
                                        <button 
                                            onClick={() => {
                                                setSelectedPatientId(item._id);
                                                setShowVitalsModal(true);
                                            }}
                                            className="w-full mt-8 bg-slate-800/50 hover:bg-indigo-600 text-slate-300 hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 group/btn border border-slate-700/50 hover:border-indigo-500 shadow-lg active:scale-[0.98]"
                                        >
                                            Record Vital Signs
                                            <Activity className="w-4 h-4 group-hover/btn:scale-110 transition-transform text-indigo-400 group-hover/btn:text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80] px-6 pb-8">
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] p-4 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 active:scale-90 transition-all">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Dashboard</span>
                    </button>

                    <button 
                        onClick={() => refetch()}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                            <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Refresh</span>
                    </button>

                    <button 
                        onClick={() => router.push("/auth/profilePage")}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile</span>
                    </button>
                </div>
            </div>

            {selectedPatientId && (
                <VitalsModal
                    isOpen={showVitalsModal}
                    onClose={() => setShowVitalsModal(false)}
                    patientId={selectedPatientId}
                />
            )}
        </div>
    );
}