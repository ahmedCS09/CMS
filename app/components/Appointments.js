"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    MoreVertical,
    Stethoscope,
    AlertCircle,
    Loader2,
    X,
    ChevronRight,
    UserPlus
} from "lucide-react";
import PremiumDropdown from "@/components/ui/PremiumDropdown";
import { toast } from "sonner";
import AdminSidebar from "@/components/AdminSidebar.js";
import AppointmentForm from "@/components/AppointmentForm.jsx";
import useUIStore from "@/store/useUIStore";
import { socket } from "@/lib/socket";

export default function Appointments() {
    const { user, authLoading } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    // Auth Protection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    // Fetch Appointments
    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ["allAppointments"],
        queryFn: async () => {
            const res = await axios.get("/api/receptionist/getAppointments");
            return res.data.appointments;
        },
        enabled: !!user && (user.role === 'receptionist' || user.role === 'admin')
    });

    // Update Status Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ appointmentId, status }) => {
            const res = await axios.post("/api/receptionist/updateStatus", { appointmentId, status });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Status updated");
            queryClient.invalidateQueries(["allAppointments"]);
            if (data.appointment) {
                socket.emit("appointmentStatusUpdated", data.appointment);
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                    <p className="text-slate-500 font-bold animate-pulse text-xs tracking-widest uppercase">Syncing Terminal...</p>
                </div>
            </div>
        );
    }

    if (user?.role !== 'receptionist' && user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-slate-900 p-12 rounded-[2.5rem] shadow-xl shadow-black/40 shadow-black/40 max-w-md border border-slate-800">
                    <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-100">Access Restricted</h2>
                    <p className="text-slate-500 mt-4 mb-8 font-bold leading-relaxed">This administrative terminal is restricted to authorized hospital staff only.</p>
                    <button onClick={() => router.push('/')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">Go Back</button>
                </div>
            </div>
        );
    }

    const getFormattedDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-CA');
    };

    const todayStr = getFormattedDate(new Date());

    const filteredAppointments = appointmentsData?.filter(app => {
        const matchesSearch = app.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || app.appointmentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const todayAppointments = filteredAppointments?.filter(app => getFormattedDate(app.appointmentDate) === todayStr) || [];
    const overallAppointments = filteredAppointments?.filter(app => getFormattedDate(app.appointmentDate) !== todayStr) || [];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'checked-in': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-950 text-slate-300 border-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <AdminSidebar />
            <main className={`flex-1 transition-all duration-300 w-full max-w-[100vw] ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Premium Header */}
                     <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-sm shadow-black/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden animate-zoom-in">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-black/40">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Main <span className="text-indigo-600">Scheduler</span></h1>
                                <p className="text-slate-300 font-bold mt-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    Live Terminal Update
                                </p>
                            </div>
                        </div>

                         <div className="flex items-center gap-6 relative z-10">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mb-1">Clinic Status</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-amber-500/10 rounded-lg text-amber-500 text-xs font-black border border-amber-500/20 uppercase">
                                        {appointmentsData?.filter(a => a.appointmentStatus === 'pending').length} Pending Slots
                                    </span>
                                </div>
                            </div>
                            <div className="h-12 w-px bg-slate-800 hidden sm:block"></div>
                            <button
                                onClick={() => setIsRegisterModalOpen(true)}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-black/60 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Schedule Visit
                            </button>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up relative z-20" style={{ animationDelay: '100ms' }}>
                        <div className="lg:col-span-8 bg-slate-900 p-2 rounded-3xl border border-slate-800 shadow-sm shadow-black/20 shadow-black/20 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name, UID or staff..."
                                    className="w-full bg-slate-950 border-2 border-transparent hover:border-slate-700 rounded-2xl py-4 pl-14 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-slate-900 outline-none transition-all font-bold text-slate-100 placeholder:text-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-4 bg-slate-900 p-2 rounded-3xl border border-slate-800 shadow-sm shadow-black/20 shadow-black/20 flex items-center gap-4 group">
                            <PremiumDropdown 
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'all', label: 'ALL VISITS' },
                                    { value: 'pending', label: 'PENDING' },
                                    { value: 'checked-in', label: 'CHECKED IN' },
                                    { value: 'completed', label: 'COMPLETED' },
                                    { value: 'cancelled', label: 'CANCELLED' }
                                ]}
                            />
                            <Filter className="absolute ml-6 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                        </div>
                    </div>

                    {/* Responsive Scheduler List */}
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-sm shadow-black/20 shadow-black/20 border border-slate-800 overflow-hidden min-h-[400px] animate-fade-up relative z-10" style={{ animationDelay: '200ms' }}>
                        {/* Desktop Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-950/50 border-b border-slate-800 px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <div className="col-span-4">Patient Details</div>
                            <div className="col-span-4">Schedule & Provider</div>
                            <div className="col-span-2">Current Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        
                        <div className="space-y-10">
                            <section id="today" className="rounded-[2.5rem] bg-slate-900 border border-slate-800 p-6 shadow-sm shadow-black/20">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Today&apos;s Appointments</h2>
                                        <p className="text-slate-500 text-sm">Appointments scheduled for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
                                    </div>
                                    <span className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full bg-indigo-600 text-white">{todayAppointments.length} on today</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {todayAppointments.length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center">
                                                <Search className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-500 font-bold">No appointments scheduled for today</p>
                                        </div>
                                    ) : (
                                        todayAppointments.map((app) => (
                                            <div key={app._id} className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 px-6 md:px-8 py-6 md:py-6 group hover:bg-indigo-50/30 transition-colors">
                                                <div className="col-span-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-lg shrink-0">
                                                        {app.patientName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white tracking-tight">{app.patientName}</p>
                                                        <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-widest">ID: {app.id}</p>
                                                    </div>
                                                </div>

                                                <div className="col-span-4 space-y-1.5 mt-2 md:mt-0 bg-slate-950 md:bg-transparent p-4 md:p-0 rounded-2xl">
                                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4 text-indigo-500" />
                                                        {app.doctorName}
                                                    </p>
                                                    <p className="text-[11px] font-black text-indigo-600 flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(app.appointmentDate).toDateString()} @ {app.appointmentTime}
                                                    </p>
                                                </div>

                                                <div className="col-span-2 mt-2 md:mt-0 flex items-center">
                                                    <span className={`inline-flex items-center justify-center w-full md:w-auto md:justify-start gap-2 px-4 py-2.5 md:py-1.5 rounded-full md:rounded-full text-[10px] font-black uppercase tracking-widest border border-dashed ${getStatusStyles(app.appointmentStatus)}`}>
                                                        {app.appointmentStatus === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {app.appointmentStatus}
                                                    </span>
                                                </div>

                                                <div className="col-span-2 flex items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-800 md:border-none">
                                                    {app.appointmentStatus === 'pending' && (
                                                        <button
                                                            onClick={() => updateMutation.mutate({ appointmentId: app._id, status: 'checked-in' })}
                                                            className="w-full md:w-auto px-6 md:px-4 py-3 md:py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-black/40 hover:scale-105 active:scale-95 transition-all text-center"
                                                        >
                                                            Check-In
                                                        </button>
                                                    )}
                                                    <button className="p-3 md:p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section id="overall" className="rounded-[2.5rem] bg-slate-900 border border-slate-800 p-6 shadow-sm shadow-black/20">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Overall Appointments</h2>
                                        <p className="text-slate-500 text-sm">Past and future appointments outside of today.</p>
                                    </div>
                                    <span className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full bg-slate-800 text-slate-300">{overallAppointments.length} total</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {overallAppointments.length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center">
                                                <Search className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-500 font-bold">No other appointments found</p>
                                        </div>
                                    ) : (
                                        overallAppointments.map((app) => (
                                            <div key={app._id} className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 px-6 md:px-8 py-6 md:py-6 group hover:bg-indigo-50/30 transition-colors">
                                                <div className="col-span-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-lg shrink-0">
                                                        {app.patientName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white tracking-tight">{app.patientName}</p>
                                                        <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-widest">ID: {app.id}</p>
                                                    </div>
                                                </div>

                                                <div className="col-span-4 space-y-1.5 mt-2 md:mt-0 bg-slate-950 md:bg-transparent p-4 md:p-0 rounded-2xl">
                                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4 text-indigo-500" />
                                                        {app.doctorName}
                                                    </p>
                                                    <p className="text-[11px] font-black text-indigo-600 flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(app.appointmentDate).toDateString()} @ {app.appointmentTime}
                                                    </p>
                                                </div>

                                                <div className="col-span-2 mt-2 md:mt-0 flex items-center">
                                                    <span className={`inline-flex items-center justify-center w-full md:w-auto md:justify-start gap-2 px-4 py-2.5 md:py-1.5 rounded-full md:rounded-full text-[10px] font-black uppercase tracking-widest border border-dashed ${getStatusStyles(app.appointmentStatus)}`}>
                                                        {app.appointmentStatus === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {app.appointmentStatus}
                                                    </span>
                                                </div>

                                                <div className="col-span-2 flex items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-800 md:border-none">
                                                    {app.appointmentStatus === 'pending' && (
                                                        <button
                                                            onClick={() => updateMutation.mutate({ appointmentId: app._id, status: 'checked-in' })}
                                                            className="w-full md:w-auto px-6 md:px-4 py-3 md:py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-black/40 hover:scale-105 active:scale-95 transition-all text-center"
                                                        >
                                                            Check-In
                                                        </button>
                                                    )}
                                                    <button className="p-3 md:p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <AppointmentForm isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
        </div>
    );
}