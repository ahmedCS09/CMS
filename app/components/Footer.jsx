import Link from "next/link";

const Footer = () => {
    return (
        <footer className="w-full bg-slate-900 text-white py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Brand Section */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <img src="/mediconnect_logo.png" alt="MediConnect" className="h-12 w-auto object-contain drop-shadow-lg" />
                        <span className="text-white font-black text-2xl tracking-tight">
                            Medi<span className="text-indigo-400">Connect</span>
                        </span>
                    </Link>
                    <p className="text-slate-400 text-sm font-medium">
                        Secure and modern real-time communication platform.
                    </p>
                </div>
                {/* Links Section */}
                <div className="flex items-center gap-8">
                    <FooterLink href="#" label="Privacy" />
                    <FooterLink href="#" label="Terms" />
                    <FooterLink href="#" label="Support" />
                </div>

                {/* Copyright Section */}
                <div className="text-slate-500 text-sm font-bold">
                    &copy; {new Date().getFullYear()} MediConnect. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

const FooterLink = ({ href, label }) => (
    <Link
        href={href}
        className="text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
    >
        {label}
    </Link>
);

export default Footer;
