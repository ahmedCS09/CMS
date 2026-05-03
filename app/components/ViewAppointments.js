"use client";
import AdminSidebar from "@/components/AdminSidebar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useUIStore from "@/store/useUIStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { Calendar, Clock, User, UserCheck, Loader2, AlertCircle } from "lucide-react";
import PreConsultationForm from "@/components/PreConsultationForm";

export default function ViewAppointments() {
    const { isSidebarCollapsed } = useUIStore();
    const { user, authLoading } = useAuthStore();
    const router = useRouter();

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    const getAppointments = async () => {
        const response = await axios.get("/api/patient/getAppointments");
        return response.data;
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["appointments"],
        queryFn: getAppointments,
        enabled: !!user,
    });

    useEffect(() => {
        if (socket) {
            const handleSync = () => {
                console.log("🔄 Force-Syncing Scheduler Data...");
                refetch();
            };
            socket.on('appointmentStatusUpdated', handleSync);
            return () => socket.off('appointmentStatusUpdated', handleSync);
        }
    }, [socket, refetch]);

    const appointments = data?.appointments || [];
    const isSuccess = data?.success !== false;

    if (authLoading || (isLoading && !data)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-medium animate-pulse text-lg font-bold uppercase tracking-tight">Syncing Schedule...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <AdminSidebar />

            <main className={`flex-1 transition-all duration-500 w-full max-w-[100vw] ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-28 pb-24 px-4 sm:px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-sm shadow-black/20 shadow-black/20 border border-slate-800 relative overflow-hidden group animate-zoom-in">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">My <span className="text-indigo-600">Visits</span></h1>
                                <p className="text-slate-300 font-medium mt-2">Manage and view your upcoming clinical appointments.</p>
                            </div>
                            <div className="bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 w-fit">
                                <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">{appointments?.length || 0} Total Sessions</span>
                            </div>
                        </div>
                    </div>
                    {/* Content */}
                    {!isSuccess ? (
                        <div className="bg-slate-900 rounded-[2.5rem] p-16 text-center border-2 border-red-100 shadow-sm shadow-black/20 shadow-black/20">
                            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-100">Internal Connection Error</h3>
                            <p className="text-slate-300 mt-2 mb-8 max-w-sm mx-auto font-medium">
                                {data?.message || "There was a problem syncing your records. Please try again later."}
                            </p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-slate-900 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-700">
                            <div className="bg-slate-950 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-500">
                                <Calendar className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-100">No Appointments Found</h3>
                            <p className="text-slate-300 mt-2 mb-8 max-w-sm mx-auto font-medium">You don't have any scheduled visits yet. Please contact your clinic to schedule a visit.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Upcoming Visits Section */}
                            {appointments.filter(a => ["pending", "checked-in"].includes(a.appointmentStatus)).length > 0 && (
                                <section id="upcoming" className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                                        <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Upcoming <span className="text-indigo-600">Visits</span></h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {appointments
                                            .filter(a => ["pending", "checked-in"].includes(a.appointmentStatus))
                                            .map((appointment, index) => (
                                                <AppointmentCard key={appointment._id} appointment={appointment} index={index} onOpenModal={(app) => { setSelectedAppointment(app); setIsModalOpen(true); }} />
                                            ))}
                                    </div>
                                </section>
                            )}

                            {/* Visit History Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 px-2">
                                    <div className="w-2 h-8 bg-slate-700 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Visit <span className="text-slate-400">History</span></h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {appointments
                                        .filter(a => !["pending", "checked-in"].includes(a.appointmentStatus))
                                        .map((appointment, index) => (
                                            <AppointmentCard key={appointment._id} appointment={appointment} index={index + 10} onOpenModal={(app) => { setSelectedAppointment(app); setIsModalOpen(true); }} />
                                        ))}
                                    {appointments.filter(a => !["pending", "checked-in"].includes(a.appointmentStatus)).length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-800">
                                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest text-slate-100">No past records available</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && selectedAppointment && (
                <PreConsultationForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    appointment={selectedAppointment}
                    appointmentId={selectedAppointment?._id}
                />
            )}
        </div>
    );
}

function AppointmentCard({ appointment, index, onOpenModal }) {

    return (
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-sm shadow-black/20 shadow-black/20 hover:shadow-xl hover:shadow-slate-950/50 transition-all group active:scale-[0.98] animate-fade-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
            <div className="flex items-center justify-between mb-8">
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Calendar className="w-6 h-6" />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${appointment.appointmentStatus === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    appointment.appointmentStatus === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        appointment.appointmentStatus === "checked-in" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                    {appointment.appointmentStatus}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Doctor</p>
                        <p className="font-bold text-slate-100">{appointment.doctorName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Schedule</p>
                        <p className="font-bold text-slate-100">
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {appointment.appointmentTime}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Visit ID: {appointment.id || appointment._id.slice(-8)}</span>
            </div>

            {appointment.appointmentStatus === "checked-in" && (
                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                    <button 
                        className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 w-full shadow-sm shadow-indigo-500/20" 
                        onClick={() => onOpenModal(appointment)}
                    >
                        Fill Pre-Consultation
                    </button>
                </div>
            )}
        </div>
    );
}