import Link from "next/link";
import { CheckCircle2, ArrowLeft, Download, ShoppingBag } from "lucide-react";

export default function PaymentSuccess() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

            <div className="max-w-md w-full relative">
                {/* Main Card */}
                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl shadow-emerald-500/5 animate-in zoom-in duration-500">
                    
                    {/* Icon Container */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400 group">
                            <CheckCircle2 size={48} className="animate-in slide-in-from-bottom duration-700 delay-150" />
                        </div>
                    </div>

                    {/* Content */}
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-4 animate-in fade-in duration-700 delay-300">
                        Payment Successful!
                    </h1>
                    <p className="text-slate-400 font-medium leading-relaxed mb-10 animate-in fade-in duration-700 delay-500">
                        Your transaction has been processed securely. The medicine inventory has been updated, and your digital receipt is ready.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4 animate-in slide-in-from-bottom-[20px] duration-700 delay-700">
                        <a 
                            href="/patient/buyMedicinesPage"
                            className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Return to Inventory
                        </a>
                        
                        <Link 
                            href="/dashboards/patientPage"
                            className="w-full flex items-center justify-center gap-3 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Footer Message */}
                <p className="text-slate-600 text-center mt-8 text-sm font-bold flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> 
                    Transaction ID: #SFP_{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
            </div>
        </div>
    );
}