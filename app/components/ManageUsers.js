"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, ShieldAlert, Mail, Calendar, Filter, Loader2, Trash2, UserCheck, Edit } from "lucide-react";
import { toast } from "sonner";

export default function ManageUsers() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const queryClient = useQueryClient();

    // Fetch users
    const { data, isLoading, error } = useQuery({
        queryKey: ["users", search],
        queryFn: async () => {
            const res = await axios.get(`/api/admin/getAllUsers?search=${search}`);
            return res.data.users;
        }
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            return await axios.delete("/api/auth/deleteUser", { data: { userId } });
        },
        onSuccess: (data) => {
            toast.success(data.data.message || "User deleted successfully");
            queryClient.invalidateQueries(["users"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete user");
        }
    });

    const handleDelete = (userId, fullName) => {
        if (window.confirm(`Are you sure you want to delete ${fullName}? This action cannot be undone.`)) {
            deleteMutation.mutate(userId);
        }
    };

    const filteredUsers = data?.filter(u => {
        if (roleFilter === "all") return true;
        return u.role === roleFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-sm shadow-black/20 shadow-black/20 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-zoom-in">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Manage <span className="text-indigo-600">Users</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Audit, modify, or remove user accounts across the system.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-slate-900 transition-all text-sm font-bold text-slate-100 placeholder:text-slate-400 shadow-sm shadow-black/40"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                        {['all', 'doctor', 'receptionist', 'patient'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${roleFilter === role
                                        ? "bg-slate-900 text-indigo-600 shadow-sm shadow-black/20 shadow-black/20 border border-slate-800"
                                        : "text-slate-500 hover:text-slate-600"
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users list */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm shadow-black/20 shadow-black/20">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-500 font-bold animate-pulse">Syncing User Directory...</p>
                </div>
            ) : error ? (
                <div className="p-12 bg-red-50 rounded-[2.5rem] border border-red-100 text-center">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-red-900">Database Connection Error</h3>
                    <p className="text-red-600 font-medium">Unable to fetch registered users. Please check your admin privileges.</p>
                </div>
            ) : filteredUsers?.length === 0 ? (
                <div className="p-20 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm shadow-black/20 shadow-black/20 text-center">
                    <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Filter className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-100">No Users Found</h3>
                    <p className="text-slate-500 font-medium mt-2">Try adjusting your search or filters to see more results.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredUsers?.map((u, index) => (
                        <div key={u._id} className="bg-slate-900 rounded-[2.5rem] p-6 shadow-sm shadow-black/20 shadow-black/20 border border-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative animate-fade-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                            {/* Decorative element */}
                            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700 ${u.role === 'doctor' ? 'bg-blue-600' :
                                    u.role === 'receptionist' ? 'bg-amber-600' : 'bg-indigo-600'
                                }`}></div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-black/40 ${u.role === 'doctor' ? 'bg-blue-600 text-white' :
                                            u.role === 'receptionist' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'
                                        }`}>
                                        {u.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{u.fullName}</h4>
                                        <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-slate-950 rounded-full w-fit">
                                            <div className={`w-1.5 h-1.5 rounded-full ${u.role === 'doctor' ? 'bg-blue-500' :
                                                    u.role === 'receptionist' ? 'bg-amber-500' : 'bg-indigo-500'
                                                }`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{u.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 relative z-10">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium truncate">{u.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Registred on {new Date(u.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between relative z-10">
                                <span className="flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Account Active</span>
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(u._id, u.fullName)}
                                        disabled={deleteMutation.isPending}
                                        className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-black/40"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
