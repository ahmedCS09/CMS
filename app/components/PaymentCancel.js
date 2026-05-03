import Link from "next/link";
import { XCircle, RefreshCcw, ShoppingCart, HelpCircle } from "lucide-react";

export default function PaymentCancel() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

            <div className="max-w-md w-full relative">
                {/* Main Card */}
                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl shadow-rose-500/5 animate-in slide-in-from-top-10 duration-700">
                    
                    {/* Icon Container */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl opacity-50" />
                        <div className="relative w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 text-rose-400">
                            <XCircle size={48} className="animate-pulse" />
                        </div>
                    </div>

                    {/* Content */}
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-4">
                        Payment Cancelled
                    </h1>
                    <p className="text-slate-400 font-medium leading-relaxed mb-10">
                        No worries! Your transaction was not processed and no funds were captured. You can return to your cart and try again whenever you're ready.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <Link 
                            href="/patient/buyMedicinesPage"
                            className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Return to Checkout
                        </Link>
                        
                        <Link 
                            href="/patient/dashboard"
                            className="w-full flex items-center justify-center gap-3 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Back to Store
                        </Link>
                    </div>

                    {/* Support Link */}
                    <div className="mt-10 pt-8 border-t border-slate-800">
                        <p className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2">
                            <HelpCircle className="w-4 h-4" /> 
                            Need help? <Link href="/support" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30">Contact Support</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}