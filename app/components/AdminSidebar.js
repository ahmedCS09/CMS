"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus, Calendar, Stethoscope, BriefcaseMedical, Users, LogOut, ChevronRight } from "lucide-react";
import { Hospital, ClipboardList } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import useUIStore from "@/store/useUIStore";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { isSidebarCollapsed, toggleSidebar } = useUIStore();

    // Close sidebar on mobile after navigating
    const handleMobileNav = () => {
        if (window.innerWidth < 768 && !isSidebarCollapsed) {
            toggleSidebar();
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = "/auth/loginPage";
    };

    const getNavLinks = () => {
        if (!user) return [];

        switch (user.role) {
            case 'admin':
                return [
                    { href: '/dashboards/dashboardPage', label: 'Dashboard', icon: LayoutDashboard },
                    { href: '/admin/manageUsersPage', label: 'Manage Users', icon: Users },
                    { href: '/admin/manageMedicinesPage', label: 'Manage Medicines', icon: BriefcaseMedical },
                    { href: '/auth/registerAdminPage', label: 'Register Staff', icon: UserPlus },
                ];
            case 'doctor':
                return [
                    { href: '/dashboards/doctorPage', label: 'Dashboard', icon: LayoutDashboard },
                    { href: '/doctor/viewAppointmentsDocPage', label: 'Appointments', icon: Calendar },
                    { href: '/doctor/viewMedRecordsDocPage', label: 'Archives', icon: ClipboardList }
                ];
            case 'patient':
                return [
                    { href: '/dashboards/patientPage', label: 'Dashboard', icon: LayoutDashboard },
                    { href: '/patient/viewAppointmentsPage', label: 'My Visits', icon: Calendar },
                    { href: '/patient/viewMedRecordsPage', label: 'Medical Records', icon: ClipboardList },
                    { href: '/patient/buyMedicinesPage', label: 'Buy Medicines', icon: Stethoscope }
                ];
            case 'receptionist':
                return [
                    { href: '/dashboards/receptionistPage', label: 'Dashboard', icon: LayoutDashboard },
                    { href: '/receptionist/appointmentsPage', label: 'Appointments', icon: Calendar },
                    { href: '/auth/registerReceptionistPage', label: 'Register Patient', icon: UserPlus },
                ];
            case 'nurse':
                return [
                    { href: '/dashboards/nurseDashboard', label: 'Dashboard', icon: LayoutDashboard },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <>
            {/* Mobile Hamburger Toggle (Visible only on mobile when collapsed) */}
            <button 
                onClick={toggleSidebar}
                className={`md:hidden fixed top-24 left-6 z-[60] p-3 bg-slate-900 rounded-xl shadow-xl shadow-black/40 border border-slate-800 text-slate-200 transition-all ${!isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <div className="flex flex-col gap-1.5">
                    <div className="w-5 h-0.5 bg-slate-300 rounded-full"></div>
                    <div className="w-4 h-0.5 bg-indigo-400 rounded-full"></div>
                    <div className="w-3 h-0.5 bg-slate-300 rounded-full"></div>
                </div>
            </button>

            {/* Mobile Overlay */}
            {!isSidebarCollapsed && (
                <div 
                    className="md:hidden fixed inset-0 top-20 z-[40] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside
                className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-slate-950/80 backdrop-blur-3xl border-r border-slate-800/50 z-50 flex flex-col shadow-[8px_0_30px_rgba(0,0,0,0.15)] transition-all duration-300 ${isSidebarCollapsed ? "-translate-x-full md:translate-x-0 w-64 md:w-20" : "translate-x-0 w-[280px] md:w-72"}`}
            >
                {/* Minimalist Grab Handle Toggle - Center Right (Hidden on Mobile) */}
                <div className="hidden md:flex absolute inset-y-0 -right-1.5 items-center z-[70]">
                <button
                    onClick={toggleSidebar}
                    className="group relative flex items-center justify-center w-3 h-24 bg-transparent hover:bg-slate-800/50 rounded-full transition-all duration-300"
                    title={isSidebarCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
                >
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-0.5 h-8 bg-slate-500 group-hover:bg-indigo-400 rounded-full" />
                        <div className="w-0.5 h-8 bg-slate-500 group-hover:bg-indigo-400 rounded-full" />
                    </div>
                    {/* Subtle indicator line */}
                    <div className="absolute w-[1px] h-10 bg-slate-800 rounded-full group-hover:opacity-0 transition-opacity" />
                </button>
            </div>

            {/* Logo Section */}
            <div className={`p-6 border-b border-slate-800 flex items-center transition-all duration-300 ${isSidebarCollapsed ? "justify-center" : "justify-start"}`}>
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
                    <img
                        src="/mediconnect_logo.png"
                        alt="MC"
                        className={`h-10 w-auto object-contain drop-shadow-lg transition-all duration-300 ${isSidebarCollapsed ? "scale-110" : "group-hover:scale-105"}`}
                    />
                    {!isSidebarCollapsed && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <h2 className="text-xl font-black text-white tracking-tight">Medi<span className="text-indigo-400">Connect</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap">
                                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Portal
                            </p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto pt-6 pb-24 px-3 no-scrollbar space-y-1.5 font-sans">
                {navLinks.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            title={isSidebarCollapsed ? item.label : ""}
                            onClick={handleMobileNav}
                            className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-200 hover:bg-slate-800/50 hover:text-white"
                                } ${isSidebarCollapsed ? "justify-start md:justify-center" : "justify-between"}`}
                        >
                            <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-indigo-400"}`} />
                                {!isSidebarCollapsed && (
                                    <span className="text-sm font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                                        {item.label}
                                    </span>
                                )}
                                {isSidebarCollapsed && (
                                    <span className="md:hidden text-sm font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 ml-3">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            {(!isSidebarCollapsed && !isActive) && (
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-600" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer / Logout */}
            <div className={`p-4 pb-28 mt-auto border-t border-slate-800 transition-all ${isSidebarCollapsed ? "px-2" : "px-6"}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center justify-center gap-3 py-4 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-200 rounded-2xl font-black transition-all duration-300 active:scale-95 group ${isSidebarCollapsed ? "w-12 h-12" : "w-full text-sm"
                        }`}
                    title={isSidebarCollapsed ? "Logout" : ""}
                >
                    <LogOut className={`w-5 h-5 transition-transform ${!isSidebarCollapsed && "group-hover:-translate-x-1"}`} />
                    {!isSidebarCollapsed && (
                        <span className="animate-in fade-in slide-in-from-left-1">
                            Logout {user?.role === 'admin' ? 'Terminal' : 'Service'}
                        </span>
                    )}
                    {isSidebarCollapsed && (
                        <span className="md:hidden animate-in fade-in slide-in-from-left-1 ml-3 font-bold text-[13px]">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
        </>
    );
}
