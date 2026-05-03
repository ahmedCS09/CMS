'use client';
import { useState, useEffect } from 'react';
import { Search, FileText, User, Calendar, Clipboard, Loader2, History, ChevronRight } from 'lucide-react';
import AdminSidebar from "@/components/AdminSidebar";
import useUIStore from "@/store/useUIStore";
import axios from 'axios';

export default function HistoryFeed() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const { isSidebarCollapsed } = useUIStore();

    useEffect(() => {
        fetchRecords();
    }, []);

    const [expandedRecords, setExpandedRecords] = useState(new Set());

    const toggleExpand = (id) => {
        const newSet = new Set(expandedRecords);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRecords(newSet);
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/doctor/getMedRecordsDoc');
            const data = response.data;
            
            if (response.status === 200) {
                const mergedRecords = (data.medRecords || []).map(record => {
                    const recordPrescriptions = record.prescriptions?.length > 0 
                        ? record.prescriptions 
                        : (data.prescriptions || []).filter(p => p.recordID === record._id);
                    
                    return {
                        ...record,
                        prescriptions: recordPrescriptions
                    };
                });
                setRecords(mergedRecords);
            } else {
                setError(data.message || 'Failed to fetch medical records');
            }
        } catch (err) {
            setError('An error occurred while fetching records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records?.filter(record => 
        record.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Retrieving patient history...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex font-inter">
            <AdminSidebar />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-12`}>
                <div className="max-w-6xl mx-auto animate-fade-up">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-xl shadow-black/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                        
                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <History className="w-8 h-8 text-emerald-500" />
                                </div>
                                Patient <span className="text-emerald-500">History</span>
                            </h1>
                            <p className="text-slate-300 mt-4 text-lg font-medium max-w-lg">Review and manage clinical records for your patient population.</p>
                        </div>

                        <div className="relative group max-w-md w-full z-10">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="block w-full pl-16 pr-6 py-5 bg-slate-950 border-2 border-transparent hover:border-slate-800 rounded-[2rem] text-white font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl mb-10 flex items-center gap-4 animate-shake">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="font-bold uppercase tracking-tight text-xs">{error}</p>
                        </div>
                    )}

                    {/* Records List */}
                    <div className="grid gap-6">
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                                <div 
                                    key={record._id}
                                    className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all group relative shadow-lg shadow-black/20"
                                >
                                    <div className="p-8 relative z-10">
                                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="bg-emerald-500/10 p-5 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:scale-105 shadow-sm shadow-black/40">
                                                    <User className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                                                        {record.patientName}
                                                    </h3>
                                                    <p className="text-slate-400 text-sm font-medium">{record.user?.age || "N/A"}</p>
                                                    <div className="flex flex-wrap items-center gap-6 mt-2">
                                                        <span className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                                                            <Calendar className="w-4 h-4 text-emerald-500" />
                                                            {new Date(record.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <span className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                                                            <Clipboard className="w-4 h-4 text-emerald-500" />
                                                            REF: {record._id.slice(-8).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 w-full xl:max-w-md">
                                                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800/50 shadow-inner group-hover:border-emerald-500/20 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Clinical Diagnosis</span>
                                                    </div>
                                                    <p className="text-slate-200 font-medium line-clamp-2 leading-relaxed">
                                                        {record.diagnosis}
                                                    </p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => toggleExpand(record._id)}
                                                className={`cursor-pointer w-14 h-14 rounded-2xl transition-all self-end xl:self-center flex items-center justify-center shadow-lg ${
                                                    expandedRecords.has(record._id) 
                                                    ? 'bg-emerald-500 text-white rotate-90 shadow-emerald-500/20' 
                                                    : 'bg-slate-950 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-slate-800 shadow-black/40'
                                                }`}
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {expandedRecords.has(record._id) && (
                                            <div className="mt-10 pt-10 border-t border-slate-800/50 animate-fade-up">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h4 className="text-xl font-black text-white flex items-center gap-3">
                                                        <Clipboard className="w-6 h-6 text-emerald-500" />
                                                        Medical Order Details
                                                    </h4>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {record.prescriptions && record.prescriptions.length > 0 ? (
                                                        record.prescriptions.map((p, idx) => (
                                                            <div key={idx} className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 hover:border-emerald-500/30 transition-all shadow-inner">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <p className="text-emerald-400 font-black text-xl tracking-tight">{p.medicationName}</p>
                                                                    <div className="px-3 py-1 bg-emerald-500/10 rounded-lg text-emerald-500 font-black text-[10px] uppercase tracking-widest">Active Order</div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <div>
                                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Dosage</p>
                                                                        <p className="text-slate-200 font-bold">{p.dosage}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Duration</p>
                                                                        <p className="text-slate-200 font-bold">{p.duration}</p>
                                                                    </div>
                                                                    <div className="col-span-2 pt-2">
                                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Instructions</p>
                                                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed font-medium">
                                                                            {p.instructions}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-2 py-12 text-center bg-slate-950/50 rounded-[2.5rem] border-2 border-dashed border-slate-800">
                                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active orders linked to this entry</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-24 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[2.5rem] animate-fade-up">
                                <div className="bg-slate-950 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                                    <History className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-200">No Patient Records</h3>
                                <p className="text-slate-400 mt-2 font-medium">No results match your current search parameters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
