"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X, ShoppingBag, CreditCard, Minus, Plus, PackageCheck } from "lucide-react";
import { createCheckoutSession } from "@/actions/stripe";
import useAuthStore from "@/store/useAuthStore";


export default function BuyMedicineForm({ medicine, openModal, closeModal, refetch }) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();


    const handlePurchase = async (e) => {
        e.preventDefault();
        if (quantity < 1) return toast.error("Please enter a valid quantity");
        if (quantity > medicine?.quantity) return toast.error(`Only ${medicine.quantity} units available`);

        try {
            setLoading(true);
            const res = await createCheckoutSession({
                medicineId: medicine?._id,
                name: medicine?.name,
                price: medicine?.price,
                quantity: parseInt(quantity),
                email: user?.email // Ensure email is passed
            });

            if (res.error) {
                toast.error(res.error);
                return;
            }

            if (res.url) {
                window.location.href = res.url;
                closeModal();
            }
            if (refetch) refetch();
        } catch (error) {
            console.error("Purchase Error:", error);
            toast.error(error.response?.data?.error || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = (medicine.price * quantity).toFixed(2);

    if (!openModal) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
                onClick={() => closeModal()}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <ShoppingBag className="text-indigo-500 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Checkout</h2>
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none mt-1.5">Inventory Transaction</p>
                        </div>
                    </div>
                    <button
                        onClick={() => closeModal()}
                        className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Info Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                            {medicine.image ? (
                                <img src={medicine.image} alt={medicine.name} className="w-full h-full object-contain" />
                            ) : (
                                <PackageCheck className="text-slate-700 w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">{medicine.name}</h3>
                            <p className="text-slate-500 text-xs font-mono">Rs. {medicine.price} / unit</p>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">{medicine.quantity} In Stock</p>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Quantity</label>
                            {quantity > medicine.quantity && <p className="text-pink-500 text-[9px] font-black uppercase tracking-tighter">Stock Exceeded</p>}
                        </div>
                        <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-2">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center text-white transition-colors active:scale-95"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="flex-1 bg-transparent text-center text-xl font-black text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
                                className="w-12 h-12 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 transition-colors active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-slate-400 text-xs">Unit Price</p>
                            <p className="text-white font-bold text-sm">x{quantity}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-indigo-500/20">
                            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Total Payable</p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">Rs. {totalPrice}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 pb-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-5 bg-slate-800 rounded-2xl">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <button
                            onClick={handlePurchase}
                            disabled={loading || quantity > medicine.quantity}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="text-sm uppercase tracking-widest">Pay Now</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}