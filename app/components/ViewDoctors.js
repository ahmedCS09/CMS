"use client";
import AdminSidebar from "@/components/AdminSidebar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useUIStore from "@/store/useUIStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stethoscope, User, Loader2, Award, Clock, ArrowRight, Star, ShieldCheck } from "lucide-react";

export default function ViewDoctors() {
    const { isSidebarCollapsed } = useUIStore();
    const { user, authLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    const getAllDoctors = async () => {
        const res = await axios.get("/api/patient/getDoctors");
        return res.data;
    }

    const { data, isLoading } = useQuery({
        queryKey: ["allDoctors"],
        queryFn: getAllDoctors,
        enabled: !!user
    });

    console.log(data)

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">Assembling Medical Team...</p>
            </div>
        );
    }

    const doctors = data?.doctors || [];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row shadow-inner">
            <AdminSidebar />
            
            <main className={`flex-1 transition-all duration-500 w-full ${isSidebarCollapsed ? "md:ml-20" : "md:ml-72"} pt-24 md:pt-28 pb-20 px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Hero Header */}
                    <header className="relative bg-[#0f172a] rounded-[3rem] p-10 md:p-16 border border-white/5 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] -ml-20 -mb-20 opacity-30"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-px w-12 bg-indigo-500/50"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Clinical Excellence</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                                Meet Our <span className="text-indigo-500">Medical</span> <br className="hidden md:block" /> Experts
                            </h1>
                            <p className="text-slate-300 max-w-2xl text-lg font-medium leading-relaxed">
                                Connect with our network of world-class specialists dedicated to providing 
                                personalized care and innovative treatments.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm font-bold">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    Top Rated Staff
                                </div>
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm font-bold">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Verified Profiles
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Doctors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((doctor, index) => (
                            <DoctorCard key={doctor._id} doctor={doctor} index={index} />
                        ))}
                    </div>

                    {doctors.length === 0 && (
                        <div className="py-20 text-center bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-800">
                             <Stethoscope className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                             <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Medical Staff Registered</h2>
                             <p className="text-slate-400 font-medium mt-2">The medical directory is currently being updated.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function DoctorCard({ doctor, index }) {
    const [imgError, setImgError] = useState(false);

    return (
        <div 
            className="group relative bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5 hover:border-slate-700 shadow-2xl hover:shadow-black/80 transition-all duration-500 animate-fade-up flex flex-col h-full"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-start justify-between mb-8">
                <div className="relative">
                    <div className="relative w-22 h-22 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-inner group-hover:border-indigo-500/30 transition-all">
                        {doctor.photoURL && !imgError ? (
                            <img 
                                src={doctor.photoURL} 
                                alt={doctor.fullName} 
                                onError={() => setImgError(true)}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-950 text-white text-3xl font-black tracking-tight select-none">
                                {doctor.fullName?.charAt(0).toUpperCase() || <User className="w-10 h-10 text-slate-600" />}
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600/90 backdrop-blur-md p-2 rounded-xl border border-white/10 z-10 shadow-lg shadow-black/40">
                        <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Verified
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                        Dr. {doctor?.fullName}
                    </h3>
                    <p className="text-indigo-400/80 font-black text-xs uppercase tracking-[0.2em] mt-1">{doctor?.docSpecialization}</p>
                </div>
                
                <p className="text-slate-300 text-sm font-medium leading-relaxed line-clamp-2">
                    Highly experienced in diagnosing and treating complex medical conditions with a patient-centered approach.
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-400/70">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Experience</span>
                        </div>
                        <p className="text-slate-100 font-bold text-sm">10+ Years</p>
                    </div>
                </div>
            </div>
        </div>
    );
}