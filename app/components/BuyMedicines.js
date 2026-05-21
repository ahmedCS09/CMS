"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Package, Image as ImageIcon, ShoppingCart, Info, Search } from "lucide-react";
import { useState } from "react";
import BuyMedicineForm from "./BuyMedicineForm";
import AdminSidebar from "@/components/AdminSidebar";
import useUIStore from "@/store/useUIStore";


export default function BuyMedicines() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showBuyForm, setShowBuyForm] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const { isSidebarCollapsed } = useUIStore();


    const getMedicinesPatient = async () => {
        try {
            const res = await axios.get("/api/medicine/getMedicinesPatient");
            return res.data;
        } catch (error) {
            console.error("Error fetching medicines:", error);
            toast.error(error.response?.data?.error || "Failed to fetch medicines");
            return { medicines: [] };
        }
    }

    const { data: medicines, isLoading, error, refetch } = useQuery({
        queryKey: ["medicines"],
        queryFn: getMedicinesPatient
    });

    const getPurchasedMedicines = async () => {
        try {
            const res = await axios.get("/api/medicine/getPurchasedMedicines");
            return res.data;
        } catch (error) {
            console.error("Error fetching purchased medicines:", error);
            toast.error(error.response?.data?.error || "Failed to fetch purchased medicines");
            return { purchasedMedicines: [] };
        }
    }

    const { data: purchasedMedicines, isLoading: purchasedLoading, error: purchasedError, refetch: purchasedRefetch } = useQuery({
        queryKey: ["purchasedMedicines"],
        queryFn: getPurchasedMedicines
    });

    const filteredMedicines = medicines?.medicines?.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <AdminSidebar />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-72"} pt-24 md:pt-32 pb-24 px-4 md:px-10`}>
                <div className="max-w-7xl mx-auto">


                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Pharmacy Shop</h1>
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] ml-4">Authorized Medical Supplies</p>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search medications by name or category..."
                            className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Synchronizing Inventory...</p>
                    </div>
                ) : error ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 text-center">
                        <Info className="w-16 h-16 text-pink-500/20 mx-auto mb-6" />
                        <p className="text-slate-400 font-bold">Failed to load pharmacuitical data</p>
                        <button onClick={() => refetch()} className="mt-4 text-indigo-400 text-xs font-black uppercase tracking-widest border-b border-indigo-400/30 hover:text-indigo-300">Try Reconnecting</button>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 text-center">
                        <Package className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMedicines.map((medicine) => (
                            <div key={medicine._id} className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 animate-zoom-in">
                                <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center p-6">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                                    {medicine.image ? (
                                        <img src={medicine.image} alt={medicine.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 relative z-10" />
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-slate-800 relative z-10" />
                                    )}
                                    <div className="absolute top-5 right-5 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-400 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest z-20">
                                        {medicine.category || "General"}
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-white leading-tight group-hover:text-indigo-400 transition-colors">{medicine.name}</h3>
                                        <p className="text-2xl font-black text-white font-mono tracking-tighter">Rs. {medicine.price}</p>
                                    </div>
                                    
                                    <p className="text-slate-500 text-xs leading-relaxed mb-8 line-clamp-2 h-8">{medicine.description}</p>
                                    
                                    <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
                                        <button
                                            onClick={() => {
                                                setSelectedMedicine(medicine);
                                                setShowBuyForm(true);
                                            }}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            Purchase Now
                                        </button>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">In Stock</p>
                                        <div className="h-1 flex-1 mx-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500" 
                                                style={{ width: `${Math.min((medicine.quantity / 100) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">{medicine.quantity} units</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Purchased Medicines History */}
                <div className="mt-20">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Purchase History</h2>
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none mt-1.5 ml-0.5">Verified Medical Records</p>
                        </div>
                    </div>

                    {purchasedLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Loading Records...</p>
                        </div>
                    ) : purchasedMedicines?.medicines?.length === 0 ? (
                        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center">
                            <Package className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No transaction history found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchasedMedicines?.medicines?.map((medicine) => (
                                <div key={medicine._id} className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 hover:border-emerald-500/30 transition-all duration-500 shadow-2xl shadow-emerald-500/5 overflow-hidden">
                                    {/* Background Glow */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                                    
                                    <div className="flex items-start gap-5 relative z-10">
                                        {/* Image Box */}
                                        <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center p-3 border border-slate-800 shrink-0">
                                            {medicine?.image ? (
                                                <img src={medicine.image} alt={medicine.medicineName} className="w-full h-full object-contain" />
                                            ) : (
                                                <ImageIcon className="text-slate-700 w-8 h-8" />
                                            )}
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-black text-white truncate pr-2">{medicine?.medicineName}</h3>
                                            </div>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                Purchased {new Date(medicine.purchasedAt).toLocaleDateString()}
                                            </p>
                                            
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">Quantity</p>
                                                    <p className="text-white font-black text-lg">{medicine?.quantity} <span className="text-[10px] text-slate-500 uppercase">Units</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">Amount Paid</p>
                                                    <p className="text-2xl font-black text-white font-mono tracking-tighter">${medicine?.totalPrice}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-6 pt-5 border-t border-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Success</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                </div>
            </main>

            {showBuyForm && (
                <BuyMedicineForm medicine={selectedMedicine} openModal={showBuyForm} closeModal={() => setShowBuyForm(false)} refetch={refetch} />
            )}
        </div>
    );
}