"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Hospital,
    UserCircle,
    LogOut,
    LogIn,
    Stethoscope,
    ClipboardList,
    Menu,
    X
} from 'lucide-react';
import { toast } from "sonner";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearUser, setUser, authLoading } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/auth/getUser');
                if (res.data.user) {
                    setUser(res.data.user);
                }
            } catch {
                clearUser();
            }
        };
        if (!user) fetchUser();
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

    if (!mounted) return null;

    // Define navigation links based on user role
    const getNavLinks = () => {
        const commonLinks = [
            { href: '/auth/dashboardPage', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }
        ];

        if (!user) return [];

        switch (user.role) {
            case 'admin':
                return [
                    ...commonLinks,
                    { href: '/admin/clinics', label: 'Clinics', icon: <Hospital size={20} /> },
                    { href: '/auth/manageUsers', label: 'Manage Users', icon: <Users size={20} /> },
                ];
            case 'doctor':
                return [
                    ...commonLinks,
                    { href: '/doctor/appointments', label: 'Schedule', icon: <Calendar size={20} /> },
                    { href: '/doctor/patients', label: 'Patients', icon: <Stethoscope size={20} /> },
                ];
            case 'receptionist':
                return [
                    ...commonLinks,
                    { href: '/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
                    { href: '/patients', label: 'Registrations', icon: <Users size={20} /> },
                ];
            case 'patient':
                return [
                    ...commonLinks,
                    { href: '/patient/appointments', label: 'My Visits', icon: <Calendar size={20} /> },
                    { href: '/patient/records', label: 'Medical Records', icon: <ClipboardList size={20} /> },
                ];
            default:
                return commonLinks;
        }
    };

    const navLinks = getNavLinks();

    return (
        <nav className="fixed top-0 left-0 w-full z-[1000] bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Brand Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 group">
                            <div className="p-1 px-1.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                <img
                                    src="/mediconnect_logo.png"
                                    alt="MediConnect"
                                    className="h-10 w-auto object-contain drop-shadow-sm"
                                />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                Medi<span className="text-indigo-600">Connect</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${pathname === link.href
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                    }`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Action Section */}
                    <div className="hidden md:flex items-center gap-4 border-l border-slate-100 ml-4 pl-4 font-bold text-sm">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end mr-1 text-right leading-tight">
                                    <span className="text-slate-900 font-bold">{user.fullName}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full font-black">
                                        {user.role}
                                    </span>
                                </div>
                                <div className="relative group">
                                    <Link href="/auth/profilePage" className="block p-0.5 border-2 border-indigo-100 rounded-2xl hover:border-indigo-600 transition-colors bg-white overflow-hidden shadow-sm">
                                        {user.image ? (
                                            <img src={user.image} alt="Profile" className="w-10 h-10 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <UserCircle size={24} />
                                            </div>
                                        )}
                                    </Link>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 invisible group-hover:visible translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
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
                            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${pathname === link.href
                                    ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <div className={pathname === link.href ? "text-indigo-600" : "text-slate-400"}>
                                    {link.icon}
                                </div>
                                {link.label}
                            </Link>
                        ))}

                        {user ? (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                                <Link
                                    href="/auth/profilePage"
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors font-bold text-slate-700"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <UserCircle size={22} className="text-slate-400" />
                                    <span>My Profile</span>
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-4 p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-bold text-left w-full"
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
