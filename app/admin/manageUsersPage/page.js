"use client";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar.js";
import ManageUsers from "@/components/ManageUsers";
import useUIStore from "@/store/useUIStore";

export default function ManageUsersPage() {
    const { user, authLoading } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
    );

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-950 pt-32 px-6 flex items-center justify-center">
                <div className="text-center bg-slate-900 p-12 rounded-[2.5rem] shadow-xl shadow-black/40 shadow-black/40 shadow-slate-200 border border-slate-800 max-w-md">
                    <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-100">Access Restricted</h2>
                    <p className="text-slate-500 mt-2 mb-8 font-medium font-bold uppercase tracking-tight">This terminal is reserved for administrators.</p>
                    <button onClick={() => router.push('/')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Go Home</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <AdminSidebar />

            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-72"} pt-24 pb-12 px-6 lg:px-12`}>
                <div className="max-w-7xl mx-auto">
                    <ManageUsers />
                </div>
            </main>
        </div>
    );
}