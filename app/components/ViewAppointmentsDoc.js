"use client";
import AdminSidebar from "@/components/AdminSidebar";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import useUIStore from "@/store/useUIStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import {
    Calendar, Clock, User, AlertCircle, XCircle, Search, FileText, Stethoscope,
    Activity, Thermometer, Droplets, Heart, Scale, Zap, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function ViewAppointmentsDoc() {
    const { isSidebarCollapsed } = useUIStore();
    const { user, authLoading } = useAuthStore();
    const router = useRouter();
    const [filter, setFilter] = useState("all"); // all, pending, completed
    const [searchQuery, setSearchQuery] = useState("");
    const [rxModalData, setRxModalData] = useState(null);
    const [preConsultationModal, setPreConsultationModal] = useState(null);
    const [medRecordModal, setMedRecordModal] = useState(null);
    const [rxForm, setRxForm] = useState({ medicationName: '', dosage: '', instructions: '', duration: '', diagnosis: '' });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    const getAppointments = async () => {
        const response = await axios.get("/api/doctor/getAppointments");
        const filteredAppointments = response?.data?.appointments?.filter((apt) => apt.appointmentStatus !== "pending") || [];
        return {
            ...response.data,
            appointments: filteredAppointments
        };
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["doctorAppointments"],
        queryFn: getAppointments,
        enabled: !!user && user.role === "doctor",
    });

    const getMedRecordsByAppointmentID = async ({ queryKey }) => {
        const [_key, appointmentId] = queryKey;

        if (!appointmentId) return [];

        const response = await axios.post("/api/doctor/getMedRecordsByAppointmentID", {
            appointmentId
        });

        return response.data.medRecords;
    };

    const { data: medRecordsByAppointmentID, isLoading: medRecordsLoading } = useQuery({
        queryKey: ["medRecordsByAppointmentID", medRecordModal],
        queryFn: getMedRecordsByAppointmentID,
        enabled: !!medRecordModal
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ appointmentId, status }) => {
            const response = await axios.post("/api/doctor/updateStatus", { appointmentId, status });
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (data.success) {
                toast.success(data.message);
                if (variables.status === 'completed' && data.appointment) {
                    setRxModalData(data.appointment);
                }
                refetch();
                if (socket) {
                    socket.emit('appointmentStatusUpdated', data.appointment);
                }
            } else {
                toast.error(data.message);
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    });

    const addPrescriptionMutation = useMutation({
        mutationFn: async (data) => {
            const response = await axios.post("/api/doctor/addPrescription", data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            refetch();
            setRxModalData(null);
            setRxForm({ medicationName: '', dosage: '', instructions: '', duration: '', diagnosis: '' });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to add prescription");
        }
    });

    const handleWritePrescription = (e) => {
        e.preventDefault();
        addPrescriptionMutation.mutate({
            appointmentId: rxModalData._id,
            diagnosis: rxForm.diagnosis,
            medicationName: rxForm.medicationName,
            dosage: rxForm.dosage,
            instructions: rxForm.instructions,
            duration: rxForm.duration
        });
    };

    useEffect(() => {
        if (socket && user?.role === 'doctor') {
            const joinRoom = () => socket.emit('join_role_room', 'doctor');

            if (socket.connected) {
                joinRoom();
            }

            const handleSync = (appointment) => {
                toast.success(`${appointment?.patientName || 'Patient'} appointment status updated to ${appointment?.appointmentStatus || 'updated'}`);
                refetch();
            };

            const handleCheckIn = (data) => {
                toast.success(`${data.patientName} patient has checked in for ${data.time}`);
                refetch();
            };

            socket.on('connect', joinRoom);
            socket.on('appointmentStatusUpdated', handleSync);
            socket.on('patientCheckedIn', handleCheckIn);

            return () => {
                socket.off('connect', joinRoom);
                socket.off('appointmentStatusUpdated', handleSync);
                socket.off('patientCheckedIn', handleCheckIn);
            };
        }
    }, [socket, refetch, user?.role]);

    const appointments = data?.appointments || [];

    const getFormattedDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-CA');
    };

    const todayStr = getFormattedDate(new Date());

    const filteredAppointments = appointments.filter(app => {
        const matchesFilter = filter === "all" || app.appointmentStatus === filter;
        const matchesSearch = app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || (app.id || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const todaysLiveQueue = appointments.filter(app => {
        const appDateStr = getFormattedDate(app.appointmentDate);
        const isActive = ['checked-in'].includes(app.appointmentStatus);
        return appDateStr === todayStr && isActive;
    });

    const handleStatusUpdate = (appointmentId, status) => {
        updateStatusMutation.mutate({ appointmentId, status });
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <div className="text-center max-w-md mx-auto p-12">
                    <AlertCircle className="w-24 h-24 text-rose-500 mx-auto mb-8" />
                    <h2 className="text-3xl font-black text-slate-100 mb-4 tracking-tight">Failed to load</h2>
                    <p className="text-slate-400 mb-8 text-lg font-medium">Unable to fetch your appointments.</p>
                    <button onClick={refetch} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/25">Retry</button>
                </div>
            </div>
        );
    }

    if (authLoading || (isLoading && !data)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <AdminSidebar />

            <main className={`flex-1 transition-all duration-500 w-full max-w-[100vw] ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-28 pb-24 px-4 sm:px-6 lg:px-16`}>
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-800 animate-zoom-in">
                        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] opacity-60"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-widest">
                                    <Clock className="w-4 h-4" />
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tight leading-[1.1]">Doctor's Scheduler</h1>
                                <p className="text-slate-500 text-lg font-medium max-w-xl">Welcome back, Dr. {user?.fullName}.</p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="bg-slate-900/80 px-8 py-6 rounded-[2rem] text-white shadow-xl border border-white/5">
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Queue Status</p>
                                    <p className="text-3xl font-black">{todaysLiveQueue.length} <span className="text-slate-400 text-sm font-bold">Active</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Queue */}
                    <div id="today" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                                <Activity className="w-8 h-8 text-rose-500" /> Today's Live Queue
                            </h2>
                        </div>

                        {todaysLiveQueue.length === 0 ? (
                            <div className="bg-slate-900 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-800">
                                <h3 className="text-2xl font-black text-slate-100">Queue is Empty</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {todaysLiveQueue.map((app) => (
                                    <AppointmentCard
                                        key={app._id}
                                        app={app}
                                        onStatusUpdate={handleStatusUpdate}
                                        onViewPreConsultation={(data) => setPreConsultationModal(data)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Records Table */}
                    <div id="overall" className="space-y-8 pt-6 border-t border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                                <FileText className="w-8 h-8 text-indigo-400" /> Patient Records
                            </h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search patient..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-6 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-slate-100 outline-none focus:border-indigo-500 transition-all w-full md:w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-950/50">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Patient</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date/Time</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">History</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Prescribe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredAppointments.map((app) => (
                                            <tr key={app._id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-white text-lg">{app.patientName}</p>
                                                    <p className="text-xs text-slate-500">ID: {app._id.slice(-6).toUpperCase()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-200">{new Date(app.appointmentDate).toLocaleDateString()}</p>
                                                    <p className="text-xs text-slate-500">{app.appointmentTime}</p>
                                                </td>
                                                <td className="px-8 py-6"><StatusBadge status={app.appointmentStatus} /></td>

                                                <td className="px-8 py-6">
                                                    <button onClick={() => setMedRecordModal(app?._id)} className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group flex items-center justify-center relative">
                                                        <FileText className="w-5 h-5" />
                                                        <span className="absolute -top-10 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">View Records</span>
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {
                                                        app.appointmentStatus !== "completed" ? (
                                                            <button onClick={() => setRxModalData(app)} className="px-5 py-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all font-bold text-xs uppercase tracking-widest whitespace-nowrap">Write Rx</button>
                                                        ) : (
                                                            <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                                <p className="text-xs text-emerald-400 font-black uppercase tracking-widest">Completed</p>
                                                            </div>
                                                        )
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {rxModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setRxModalData(null)} className="absolute top-8 right-8 text-slate-500 hover:text-rose-500 transition-colors"><XCircle className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Write Prescription</h3>
                        <p className="text-slate-500 mb-8">Patient: <span className="text-indigo-400 font-bold">{rxModalData.patientName}</span></p>
                        <form onSubmit={handleWritePrescription} className="space-y-5">
                            <input required type="text" placeholder="Diagnosis" value={rxForm.diagnosis} onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-white font-bold" />
                            <input required type="text" placeholder="Medication" value={rxForm.medicationName} onChange={(e) => setRxForm({ ...rxForm, medicationName: e.target.value })} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-white font-bold" />
                            <div className="grid grid-cols-2 gap-5">
                                <input required type="text" placeholder="Dosage" value={rxForm.dosage} onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-white font-bold" />
                                <input required type="text" placeholder="Duration" value={rxForm.duration} onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-white font-bold" />
                            </div>
                            <textarea required placeholder="Instructions" rows="3" value={rxForm.instructions} onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-white font-bold resize-none"></textarea>
                            <button type="submit" disabled={addPrescriptionMutation.isPending} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50">
                                {addPrescriptionMutation.isPending ? "Saving..." : "Save Prescription"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {preConsultationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative my-8">
                        <button onClick={() => setPreConsultationModal(null)} className="absolute top-10 right-10 p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white"><XCircle className="w-8 h-8" /></button>

                        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-800">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-400"><Activity className="w-10 h-10" /></div>
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tight">Pre-Consultation Record</h3>
                                <p className="text-slate-400 font-medium">Patient: <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm">{preConsultationModal.patientName}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <RecordItem label="Reported Symptoms" icon={Stethoscope} value={preConsultationModal.symptoms} color="text-indigo-400" />
                                <RecordItem label="Allergies & Sensitivities" icon={AlertCircle} value={preConsultationModal.allergies} color="text-rose-400" />
                                <RecordItem label="Current Medications" icon={FileText} value={preConsultationModal.medications || "None Reported"} color="text-emerald-400" />
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-indigo-500" /> Authorized Clinical Vitals
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <VitalCard icon={Thermometer} label="Temp" value={preConsultationModal.vitals?.temperature} unit="°C" color="text-amber-400" />
                                    <VitalCard icon={Zap} label="Sugar" value={preConsultationModal.vitals?.sugar} unit="mg/dL" color="text-blue-400" />
                                    <VitalCard icon={Droplets} label="BP" value={preConsultationModal.vitals?.bp} unit="mmHg" color="text-rose-400" />
                                    <VitalCard icon={Heart} label="Pulse" value={preConsultationModal.vitals?.pulse} unit="BPM" color="text-red-400" />
                                    <VitalCard icon={Scale} label="Weight" value={preConsultationModal.vitals?.weight} unit="KG" color="text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setPreConsultationModal(null)} className="w-full mt-12 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Close Assessment Record</button>
                    </div>
                </div>
            )}
            {
                medRecordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[85vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-300">
                            <button onClick={() => setMedRecordModal(null)} className="absolute top-8 right-8 z-50 text-slate-500 hover:text-rose-500 transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full p-2"><XCircle className="w-6 h-6" /></button>

                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800 relative z-10">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">Medical Records</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-1">
                                        Appointment ID: <span className="text-indigo-400 font-bold">{medRecordModal.slice(-6).toUpperCase()}</span>
                                    </p>
                                </div>
                            </div>

                            {medRecordsLoading ? (
                                <div className="flex flex-col justify-center items-center py-16 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                    <p className="text-slate-500 font-bold animate-pulse">Loading records...</p>
                                </div>
                            ) : medRecordsByAppointmentID?.length === 0 ? (
                                <div className="text-center py-16 bg-slate-950/50 rounded-[2rem] border border-dashed border-slate-800">
                                    <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold text-lg">No records found</p>
                                    <p className="text-slate-600 text-sm mt-1">There are no medical records for this appointment.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(medRecordsByAppointmentID || []).map((record, key) => (
                                        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-inner relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300" key={key}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>

                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-slate-800/50 relative z-10 gap-4 sm:gap-0">
                                                <div>
                                                    <h4 className="text-xl font-black text-indigo-400">{record?.diagnosis || "Consultation Record"}</h4>
                                                    <p className="text-slate-500 text-sm font-medium mt-1">Patient: <span className="text-slate-300 font-bold">{record?.patientName}</span></p>
                                                </div>
                                                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-indigo-400" />
                                                    {new Date(record?.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {record?.vitals && (
                                                <div className="mb-8 relative z-10">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                                        <Activity className="w-3 h-3 text-indigo-400" /> Vitals
                                                    </h5>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        <VitalCard icon={Thermometer} label="Temp" value={record.vitals?.temperature} unit="°C" color="text-amber-400" />
                                                        <VitalCard icon={Zap} label="Sugar" value={record.vitals?.sugar} unit="mg/dL" color="text-blue-400" />
                                                        <VitalCard icon={Droplets} label="BP" value={record.vitals?.bp} unit="mmHg" color="text-rose-400" />
                                                        <VitalCard icon={Heart} label="Pulse" value={record.vitals?.pulse} unit="BPM" color="text-red-400" />
                                                        <VitalCard icon={Scale} label="Weight" value={record.vitals?.weight} unit="KG" color="text-emerald-400" />
                                                    </div>
                                                </div>
                                            )}

                                            {record?.prescriptions && record.prescriptions.length > 0 && (
                                                <div className="relative z-10">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                                        <Stethoscope className="w-3 h-3 text-emerald-400" /> Prescriptions
                                                    </h5>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {record.prescriptions.map((med, idx) => (
                                                            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex justify-between items-center group/med hover:border-slate-700 transition-colors">
                                                                <div>
                                                                    <p className="text-white font-bold">{med.medicineName}</p>
                                                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black mt-1">{med.duration}</p>
                                                                </div>
                                                                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                                                    <p className="text-emerald-400 font-black text-xs">{med.dosage}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    );
}

function AppointmentCard({ app, onStatusUpdate, onViewPreConsultation }) {
    const { user } = useAuthStore();
    const { data: preConsultationData, isLoading } = useQuery({
        queryKey: ["preConsultation", app.patientName],
        queryFn: async () => {
            const res = await axios.post("/api/doctor/getPreConsultation", { patientName: app.patientName });
            return res.data;
        },
        enabled: !!user && user.role === "doctor",
    });

    return (
        <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all"><User className="w-8 h-8" /></div>
                    <StatusBadge status={app.appointmentStatus} />
                </div>

                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{app.patientName}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">ID: {app._id.slice(-6).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Time</p>
                        <p className="text-sm font-black text-white">{app.appointmentTime}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</p>
                        <p className="text-sm font-black text-white">{new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {app.appointmentStatus === 'checked-in' && (
                        <button onClick={() => onStatusUpdate(app._id, 'completed')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Mark as Completed</button>
                    )}

                    {preConsultationData?.preConsultation && (
                        <button
                            onClick={() => onViewPreConsultation(preConsultationData.preConsultation)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-700"
                        >
                            View Assessment <Activity className="w-4 h-4 text-indigo-400" />
                        </button>
                    )}

                    {!isLoading && !preConsultationData?.preConsultation && app.appointmentStatus === 'checked-in' && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-black text-amber-500 uppercase tracking-widest">
                            <AlertCircle className="w-4 h-4" /> Vitals Not Recorded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        'checked-in': "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    };
    return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${styles[status] || styles.pending}`}>{status}</span>;
}

function RecordItem({ label, icon: Icon, value, color }) {
    return (
        <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Icon className={`w-3 h-3 ${color}`} /> {label}
            </p>
            <p className="text-slate-100 font-bold leading-relaxed">{value}</p>
        </div>
    );
}

function VitalCard({ icon: Icon, label, value, unit, color }) {
    return (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black text-white">{value || "--"}<span className="text-[10px] text-slate-500 ml-1 font-bold">{unit}</span></p>
        </div>
    );
}