"use client";
import AdminSidebar from "@/components/AdminSidebar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useUIStore from "@/store/useUIStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stethoscope, FileText, Loader2, AlertCircle, History, Copy, Check, X } from "lucide-react";

export default function ViewMedRecords() {
    const { isSidebarCollapsed } = useUIStore();
    const { user, authLoading } = useAuthStore();
    const [copiedId, setCopiedId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    const getMedRecords = async () => {
        // This is a placeholder as the actual API might not be fully implemented yet
        // We'll use a relative path and handle the response accordingly
        try {
            const response = await axios.get("/api/patient/getMedRecords");
            return response.data.medRecords;
        } catch (error) {
            console.error("Fetch MedRecords Error:", error);
            return []; // Return empty array if API doesn't exist yet
        }
    };

    const { data: records, isLoading } = useQuery({
        queryKey: ["medRecords"],
        queryFn: getMedRecords,
        enabled: !!user,
    });

    const [diets, setDiets] = useState({});
    const [loadingDiets, setLoadingDiets] = useState({});

    const getDiet = async (diagnosis, recordId) => {
        setLoadingDiets(prev => ({ ...prev, [recordId]: true }));
        try {
            const response = await axios.post("/api/AI/diet", { diagnosis });
            setDiets(prev => ({ ...prev, [recordId]: response.data.diet }));
        } catch (error) {
            console.error("Fetch Diet Error:", error);
        } finally {
            setLoadingDiets(prev => ({ ...prev, [recordId]: false }));
        }
    };

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);

            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-400 font-medium animate-pulse text-lg font-bold uppercase tracking-tight">Accessing Archives...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <AdminSidebar />

            <main className={`flex-1 transition-all duration-500 w-full max-w-[100vw] ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-28 pb-24 px-4 sm:px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-slate-800 relative overflow-hidden group animate-zoom-in">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/20"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black text-white tracking-tight">Medical <span className="text-indigo-400">Archives</span></h1>
                            <p className="text-slate-300 font-medium mt-2 text-lg">Your complete health history and diagnostic reports.</p>
                        </div>
                    </div>

                    {/* Content */}
                    {!records || records.length === 0 ? (
                        <div className="bg-slate-900 rounded-[2.5rem] p-16 text-center border border-slate-800 shadow-sm shadow-black/20 shadow-black/20">
                            <div className="bg-indigo-500/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
                                <History className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">No Records Available</h3>
                            <p className="text-slate-300 mt-3 mb-10 max-w-sm mx-auto font-medium text-lg">Your medical records will appear here after your first completed consultation.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {records.map((record, index) => (
                                <div key={record._id} className="bg-slate-900 rounded-[2rem] p-10 border border-slate-800 shadow-sm shadow-black/20 shadow-black/20 hover:shadow-xl transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Diagnosis</p>
                                                <h3 className="text-2xl font-black text-white tracking-tight mb-3">{record.diagnosis}</h3>
                                                <div className="mt-2">
                                                    <button onClick={() => getDiet(record.diagnosis, record._id)} disabled={loadingDiets[record._id]} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-sm shadow-emerald-900/20">
                                                        {loadingDiets[record._id] && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        {loadingDiets[record._id] ? "Analyzing Diet Plan..." : "Get AI Diet Recommendation"}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="ml-4 pl-4 border-l border-slate-700">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Prescriptions</p>
                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                    {record.prescriptions.map((prescription, idx) => (
                                                        <li key={idx} className="text-slate-400">
                                                            <span className="font-semibold text-slate-300">{prescription?.medicationName || 'N/A'}</span> ({prescription?.dosage || ''})
                                                            {prescription?.instructions && (
                                                                <p className="text-xs text-slate-400 mt-1 font-normal">{prescription.instructions}</p>
                                                            )}
                                                        </li>
                                                    ))}
                                                    {record.prescriptions.length === 0 && (
                                                        <li className="text-slate-400 italic">No prescriptions</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 md:gap-12 md:mr-8">
                                            <div>
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Provider</p>
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope className="w-4 h-4 text-slate-500" />
                                                    <p className="font-bold text-slate-200">{record.doctorName}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Recorded On</p>
                                                <div className="flex items-center gap-2">
                                                    <History className="w-4 h-4 text-indigo-400" />
                                                    <p className="font-bold text-slate-200">{new Date(record.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Diet Full-Width Block */}
                                    {diets[record._id] && (
                                        <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 relative">

                                            {/* Action Buttons */}
                                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopy(diets[record._id], record._id)}
                                                    className="bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white p-2 rounded-lg transition-all"
                                                    title="Copy Diet Plan"
                                                >
                                                    {copiedId === record._id ? (
                                                        <Check className="w-4 h-4 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setDiets(prev => ({ ...prev, [record._id]: null }))}
                                                    className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-lg transition-all"
                                                    title="Close"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <p className="text-xs text-indigo-400 font-bold mb-2">AI Diet Plan</p>

                                            <p className="text-slate-300 text-sm whitespace-pre-line max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                                {diets[record._id]}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}