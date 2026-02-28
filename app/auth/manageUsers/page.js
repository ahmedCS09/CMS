"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    Search,
    UserCheck,
    Edit2,
    Trash2,
    Shield,
    MoreVertical,
    Check,
    X,
    Loader2,
    Filter
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function ManageUsers() {
    const { user, authLoading } = useAuthStore();
    const router = useRouter();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState("");

    const roles = ['patient', 'doctor', 'receptionist'];

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            toast.error("Unauthorized access");
            router.push("/auth/dashboardPage");
            return;
        }
        fetchUsers();
    }, [user, authLoading]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/auth/getAllUsers?search=${searchTerm}`);
            setUsersList(res.data.users);
        } catch (error) {
            toast.error("Failed to fetch users");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (targetUserId) => {
        try {
            const res = await axios.post("/api/auth/updateUser", {
                targetUserId,
                role: newRole
            });
            if (res.status === 200) {
                toast.success("User role updated successfully");
                setEditingUser(null);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    if (authLoading || loading && usersList.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <Users className="text-indigo-600" size={36} />
                            User Management
                        </h1>
                        <p className="text-slate-500 font-semibold italic">Administrate staff and patient roles</p>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all font-semibold shadow-sm"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Current Role</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {usersList.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                                <Filter size={48} strokeWidth={1} />
                                                <p className="text-xl font-bold">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    usersList.map((targetUser) => (
                                        <tr key={targetUser._id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden ring-2 ring-white">
                                                        {targetUser.image ? (
                                                            <img src={targetUser.image} alt={targetUser.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xl font-black">{targetUser.fullName[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{targetUser.fullName}</div>
                                                        <div className="text-sm text-slate-500 font-semibold">{targetUser.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {editingUser === targetUser._id ? (
                                                    <div className="flex items-center gap-2 animate-in zoom-in duration-200">
                                                        <select
                                                            value={newRole}
                                                            onChange={(e) => setNewRole(e.target.value)}
                                                            className="px-3 py-2 rounded-xl border border-indigo-200 bg-white text-indigo-700 font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                                                        >
                                                            {roles.map(r => (
                                                                <option key={r} value={r}>{r.toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleRoleUpdate(targetUser._id)}
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${targetUser.role === 'doctor' ? 'bg-indigo-100 text-indigo-700' :
                                                            targetUser.role === 'receptionist' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        <Shield size={12} />
                                                        {targetUser.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(targetUser._id);
                                                        setNewRole(targetUser.role);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-black text-sm active:scale-95"
                                                >
                                                    <Edit2 size={16} />
                                                    Assign Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
