"use client";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail, Lock, UserCog, Loader2, ShieldCheck } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import AgePieChart from "@/components/AgePieChart";
import useUIStore from "@/store/useUIStore";

export default function Dashboard() {
    const { user, authLoading } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();
    const router = useRouter();

    // Fetch Doctors Count
    const fetchDoctorsCount = async () => {
        const response = await axios.get("/api/admin/getAllUsers");
        return response.data.users;
    }

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: fetchDoctorsCount,
    })

    const doctorsCount = users?.filter(user => user.role === "doctor").length || 0;
    const receptionistsCount = users?.filter(user => user.role === "receptionist").length || 0;
    const patientsCount = users?.filter(user => user.role === "patient").length || 0;
    const totalUsersCount = users?.length || 0;

    // Calculate Percentages for Pulse Bars
    const calculateWidth = (count) => {
        if (!totalUsersCount) return "0%";
        return `${Math.min((count / totalUsersCount) * 100, 100)}%`;
    };

    useEffect(() => {
        console.log("Dashboard - User:", user);
        console.log("Dashboard - Fetched Users:", users);
        console.log("Dashboard - Total Users Count:", totalUsersCount);
    }, [user, users, totalUsersCount]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    if (authLoading || isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium animate-pulse">
                    {authLoading ? "Authenticating..." : "Loading Pulse Data..."}
                </p>
            </div>
        </div>
    );

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-950 pt-32 px-6 flex items-center justify-center">
                <div className="text-center bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl shadow-black/60 border border-slate-800 max-w-md">
                    <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-100 mb-2">Access Restricted</h2>
                    <p className="text-slate-300 mb-8 leading-relaxed font-medium">This terminal is reserved for administrators only. Please return to your appropriate dashboard.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-black/20"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-500 w-full max-w-[100vw] ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-28 pb-24 px-4 sm:px-6 lg:px-12`}>
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-sm shadow-black/20 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-8 overflow-hidden relative group animate-zoom-in">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl opacity-60"></div>

                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-black/20">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Management Console</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Dashboard</span>
                            </h1>
                            <p className="text-slate-300 text-lg font-medium max-w-md">Welcome back, {user?.fullName || "Admin"}. Control center for clinic operations.</p>
                        </div>

                        <div className="relative z-10 flex flex-wrap gap-3">
                            <div className="flex items-center gap-4 px-6 py-4 bg-slate-950 rounded-3xl text-white shadow-xl shadow-black/60 border border-slate-800">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-lg font-bold">
                                    {user?.fullName?.charAt(0) || "A"}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Active User</p>
                                    <p className="font-bold text-sm tracking-wide">{user?.fullName || "Admin User"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* System Pulse / Stats */}
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-black/40 relative overflow-hidden group h-fit animate-fade-up" style={{ animationDelay: '100ms' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-16 -mr-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-12 -ml-12 blur-xl"></div>

                            <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-2">
                                System Pulse
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-100"></span>
                                </span>
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Doctors</span>
                                        <span className="text-2xl font-black">{doctorsCount}</span>
                                    </div>
                                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-slate-900 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: calculateWidth(doctorsCount) }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Support Staff</span>
                                        <span className="text-2xl font-black">{receptionistsCount}</span>
                                    </div>
                                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-slate-900 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: calculateWidth(receptionistsCount) }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Patients</span>
                                        <span className="text-2xl font-black">{patientsCount}</span>
                                    </div>
                                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-slate-900 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: calculateWidth(patientsCount) }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Users</span>
                                        <span className="text-2xl font-black">{totalUsersCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions / Guidelines */}
                        <div className="lg:col-span-2 space-y-8 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-sm shadow-black/60 border border-slate-800 h-full">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-slate-800 p-2 rounded-xl text-white">
                                        <UserCog className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Administrative Controls</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                                        <h4 className="font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                                            Account Management
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        </h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10">Review and modify existing user permissions and profile data.</p>
                                    </div>

                                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                                        <h4 className="font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                                            System Audits
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        </h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10">Access detailed logs for all registration and modification events.</p>
                                    </div>

                                    <div onClick={() => router.push("/admin/manageMedicinesPage")} className="md:col-span-2 p-8 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 group-hover:bg-indigo-500/30 transition-all duration-700"></div>
                                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xl font-black text-indigo-400 mb-2 flex items-center gap-3">
                                                    Pharmacy Inventory
                                                    <span className="relative flex h-2 w-2">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                                    </span>
                                                </h4>
                                                <p className="text-sm text-indigo-200/70 leading-relaxed font-medium max-w-lg">Manage stock levels, update pricing, and add new pharmaceutical products to the master clinic inventory.</p>
                                            </div>
                                            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white text-indigo-400 transition-all duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Age Distribution Analytics */}
                                    <div className="md:col-span-2 mt-4">
                                        <AgePieChart />
                                    </div>
                                </div>

                                <div className="mt-10 p-8 border-2 border-dashed border-slate-800 rounded-[2rem]">
                                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Master Guidelines</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { icon: Lock, label: "Default permissions apply immediately", color: "text-amber-500" },
                                            { icon: Mail, label: "Manual credential delivery required", color: "text-blue-500" },
                                            { icon: ShieldCheck, label: "Role changes audit-logged", color: "text-emerald-500" }
                                        ].map((item, i) => (
                                            <li key={i} className="space-y-3 group">
                                                <div className={`${item.color} bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-slate-800 group-hover:scale-110 transition-transform`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 leading-normal">{item.label}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}