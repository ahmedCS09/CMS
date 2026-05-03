"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { UserCircle, LogOut, LogIn, Menu, X } from 'lucide-react';
import { toast } from "sonner";
import { socket } from "@/lib/socket";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearUser, setUser, authLoading } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleStatusUpdate = (updatedAppointment) => {
            console.log("📝 Real-time Sync (Navbar):", updatedAppointment);
            if (user?.role === 'patient') {
                if (updatedAppointment._isNewAppointment) {
                    toast.success(`[System Alert] New appointment booked with ${updatedAppointment.doctorName}`, {
                        description: `Scheduled for ${new Date(updatedAppointment.appointmentDate).toDateString()} at ${updatedAppointment.appointmentTime}`,
                        duration: 10000,
                    });
                } else {
                    toast.success(`[System Alert] Visit status updated: ${updatedAppointment.appointmentStatus}`, {
                        description: "Your schedule has been synchronized in real-time.",
                        duration: 8000,
                    });
                }
            }
        };

        socket.on('appointmentStatusUpdated', handleStatusUpdate);
        
        return () => {
            socket.off('appointmentStatusUpdated', handleStatusUpdate);
        };
    }, [user?.role]);

    useEffect(() => {
        const handleNewPatient = (newPatient) => {
            if (user?.role === 'admin') {
                toast.success(`[Admin Alert] New Patient registered: ${newPatient.fullName}`, {
                    description: "Verify the registration in your dashboard.",
                    duration: 5000,
                });
            }
        };

        socket.on('newPatientRegistered', handleNewPatient);
        return () => socket.off('newPatientRegistered', handleNewPatient);
    }, [user?.role]);

    useEffect(() => {
        if (!socket.connected) socket.connect();
    }, []);

    useEffect(() => {
        setMounted(true);
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/auth/getUser');
                if (res.data.user) {
                    setUser(res.data.user);
                    // Join user-specific socket room
                    socket.emit("join_room", res.data.user._id || res.data.user.id);
                }
            } catch {
                clearUser();
            }
        };
        if (!user) fetchUser();
        else {
            // Re-join room if user already exists (e.g., on mount)
            socket.emit("join_room", user._id || user.id);
        }
    }, [setUser, clearUser, user]);

    const handleLogout = async () => {
        try {
            const res = await axios.post('/api/auth/logout');
            if (res.status === 200) {
                clearUser();
                toast.success("Logged out successfully");
                router.push('/auth/loginPage');
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed");
        }
    };

    const [imgError, setImgError] = useState(false);

    if (!mounted) return null;

    return (
        <nav className="fixed top-0 left-0 w-full z-[1000] bg-slate-900/60 backdrop-blur-2xl border-b border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Brand Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 group">
                            <div className="p-1 px-1.5 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                <img
                                    src="/mediconnect_logo.png"
                                    alt="MediConnect"
                                    className="h-10 w-auto object-contain drop-shadow-sm"
                                />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                Medi<span className="text-indigo-600">Connect</span>
                            </span>
                        </Link>
                    </div>
 
                    {/* Right Action Section */}
                    <div className="hidden md:flex items-center gap-4 border-l border-slate-800 ml-4 pl-4 font-bold text-sm">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end mr-1 text-right leading-tight">
                                    <span className="text-white font-bold">{user.fullName}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-black ring-1 ring-indigo-500/20">
                                        {user.role}
                                    </span>
                                </div>
                                <div className="relative group">
                                     <Link href="/auth/profilePage" className="block p-0.5 border-2 border-indigo-500/20 rounded-2xl hover:border-indigo-600 transition-colors bg-slate-900 overflow-hidden shadow-lg shadow-black/40">
                                         {user.photoURL && !imgError ? (
                                             <img 
                                                src={user?.photoURL} 
                                                alt="Profile" 
                                                onError={() => setImgError(true)}
                                                className="w-10 h-10 rounded-xl object-cover" 
                                             />
                                         ) : (
                                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-950 flex items-center justify-center text-white font-black text-lg select-none">
                                                 {user.fullName?.charAt(0).toUpperCase() || <UserCircle size={24} className="text-slate-500" />}
                                             </div>
                                         )}
                                     </Link>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 invisible group-hover:visible translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                         <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !authLoading && (
                                 <Link
                                    href="/auth/loginPage"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-black/60 transition-all active:scale-95"
                                >
                                    <LogIn size={18} />
                                    <span>Sign In</span>
                                </Link>
                            )
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 space-y-2">

                        {user ? (
                            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                                <Link
                                    href="/auth/profilePage"
                                    className="flex items-center gap-4 p-4 hover:bg-slate-800 rounded-2xl transition-colors font-bold text-slate-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="w-12 h-12 rounded-xl border border-slate-800 overflow-hidden shadow-lg shadow-black/40">
                                        {user.photoURL && !imgError ? (
                                            <img 
                                                src={user?.photoURL} 
                                                alt="Profile" 
                                                onError={() => setImgError(true)}
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-950 flex items-center justify-center text-white font-black text-xl">
                                                {user.fullName?.charAt(0).toUpperCase() || <UserCircle size={24} className="text-slate-500" />}
                                            </div>
                                        )}
                                    </div>
                                    <span>My Profile</span>
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-4 p-4 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-colors font-bold text-left w-full"
                                >
                                    <LogOut size={22} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/loginPage"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl font-bold mt-4"
                            >
                                <LogIn size={20} />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
