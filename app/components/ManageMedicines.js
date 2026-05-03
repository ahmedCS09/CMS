"use client";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Package, DollarSign, Image as ImageIcon, Tag, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const medicineSchema = yup.object({
    name: yup.string().required("Medicine name is required"),
    description: yup.string().required("Description is required"),
    price: yup.number().transform((val) => (isNaN(val) ? undefined : val)).required("Price is required").positive("Price must be positive"),
    quantity: yup.number().transform((val) => (isNaN(val) ? undefined : val)).required("Stock quantity is required").integer("Must be an integer"),
    image: yup.string().nullable(),
    category: yup.string().required("Category is required"),
});

export default function ManageMedicines() {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);


    const getMedicinesAdmin = async () => {
        try {
            const res = await axios.get("/api/medicine/getMedicinesAdmin");
            return res.data;
        } catch (error) {
            console.error("Error fetching medicines:", error);
            toast.error(error.response?.data?.error || "Failed to fetch medicines");
        }
    }

    const deleteMedicine = async (id) => {
        try {
            const res = await axios.delete("/api/medicine/deleteMedicine", { data: { id } });
            toast.success("Medicine deleted successfully");
            refetch();
            return res.data;
        } catch (error) {
            console.error("Error deleting medicine:", error);
            toast.error(error.response?.data?.error || "Failed to delete medicine");
        }
    }

    const { data: medicines, isLoading, error, refetch } = useQuery({
        queryKey: ["medicines"],
        queryFn: getMedicinesAdmin
    });

    const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm({
        resolver: yupResolver(medicineSchema),
        defaultValues: {
            category: "General",
            image: ""
        }
    });

    const watchAllFields = watch();

    if (!mounted) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            let finalPhotoURL = data.image || "";

            // 1. Upload image if one is selected
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadRes = await axios.post("/api/auth/upload", formData);
                finalPhotoURL = uploadRes.data.url;
            }

            const response = await axios.post("/api/medicine/addMedicine", {
                ...data,
                image: finalPhotoURL
            });
            toast.success("Medicine added successfully to inventory");
            reset();
            setImageFile(null);
            refetch();
        } catch (error) {
            console.error("Error adding medicine:", error);
            toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to add medicine");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 pt-24 md:p-8 md:pt-32 animate-fade-in">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Form Section */}
                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <PlusCircle className="text-indigo-500 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight leading-none">Add Inventory</h1>
                            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-black">Pharmaceutical Management</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Medicine Name</label>
                                <div className="relative group">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        {...register("name")}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Panadol Extra"
                                    />
                                    {errors.name && <p className="text-pink-500 text-[10px] font-bold mt-1.5 ml-1">{errors.name.message}</p>}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <select
                                        {...register("category")}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="General">General</option>
                                        <option value="Antibiotics">Antibiotics</option>
                                        <option value="Pain Relief">Pain Relief</option>
                                        <option value="Vitamins">Vitamins</option>
                                        <option value="First Aid">First Aid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Price ($)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("price")}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="12.99"
                                    />
                                    {errors.price && <p className="text-pink-500 text-[10px] font-bold mt-1.5 ml-1">{errors.price.message}</p>}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Stock</label>
                                <div className="relative group">
                                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="number"
                                        {...register("quantity")}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="100"
                                    />
                                    {errors.quantity && <p className="text-pink-500 text-[10px] font-bold mt-1.5 ml-1">{errors.quantity.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Medicine Image URL</label>
                            <div className="relative group">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setValue("image", reader.result, { shouldValidate: true });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="https://images.unsplash.com/..."
                                />
                                {errors.image && <p className="text-pink-500 text-[10px] font-bold mt-1.5 ml-1">{errors.image.message}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Description</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-6 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                <textarea
                                    {...register("description")}
                                    rows="4"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700 resize-none"
                                    placeholder="Medical indications, dosage rules, and storage info..."
                                />
                                {errors.description && <p className="text-pink-500 text-[10px] font-bold mt-1.5 ml-1">{errors.description.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                            Register Product
                        </button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 ml-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inventory Preview</h2>
                    </div>

                    <div className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-[3rem] p-8 border-dashed flex flex-col items-center justify-center">
                        {!watchAllFields.name && !watchAllFields.image ? (
                            <div className="text-center space-y-4">
                                <Package className="w-16 h-16 text-slate-800 mx-auto" />
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Entry Data to Preview Card</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-zoom-in">
                                <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                    {watchAllFields.image ? (
                                        <img src={watchAllFields.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-slate-800" />
                                    )}
                                    <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        {watchAllFields.category}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-black text-white leading-tight mb-2 truncate">{watchAllFields.name || "Medicine Name"}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-3 mb-6 min-h-[48px]">{watchAllFields.description || "No description provided yet..."}</p>

                                    <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Price</p>
                                            <p className="text-2xl font-black text-indigo-400 font-mono">${parseFloat(watchAllFields.price || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stock</p>
                                            <p className="text-xl font-bold text-white">{watchAllFields.quantity || 0} Units</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                        <div className="flex items-start gap-4">
                            <PlusCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                            <div>
                                <p className="text-slate-400 text-xs leading-relaxed">This product will be immediately visible to patients in the <span className="text-indigo-400 font-bold">Buy Medicines</span> module after registration.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <Package className="text-indigo-500 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight leading-none">Inventory List</h1>
                            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-black">Current Stock Overview</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">Error loading inventory</p>
                        </div>
                    ) : medicines?.medicines?.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No medicines in inventory</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {medicines?.medicines?.map((medicine) => (
                                <div key={medicine._id} className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group flex flex-col">
                                    <div className="h-48 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                                        {medicine.image ? (
                                            <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-slate-800" />
                                        )}
                                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-700/50 shadow-lg">
                                            {medicine.category}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-white font-black text-lg mb-1 truncate" title={medicine.name}>{medicine.name}</h3>
                                        <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed font-medium min-h-[32px]">{medicine.description}</p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Price</p>
                                                <p className="text-indigo-400 font-bold">${parseFloat(medicine.price).toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Stock</p>
                                                <p className="text-white font-bold">{medicine.quantity} <span className="text-slate-500 text-xs">units</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                                        <button
                                            onClick={() => deleteMedicine(medicine._id)}
                                            className="w-full py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Remove Item
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}