"use client";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
    const { user, authLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/loginPage");
        }
    }, [user, authLoading, router]);

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Welcome back, <span className="text-indigo-600">{user?.fullName || "Patient"}</span>!
                    </h1>
                    <p className="text-slate-500 mb-8">Access your medical history and upcoming appointments.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-2">My Profile</h3>
                            <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                {user?.role || "patient"}
                            </span>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center italic text-slate-400">
                            Upcoming Feature: Medical Records
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
