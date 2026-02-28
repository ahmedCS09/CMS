import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Star,
  Clock,
  Hospital,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-sm font-black uppercase tracking-widest shadow-sm">
              <Star size={16} className="fill-indigo-600" />
              Next-Generation Clinic Management
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
              The standard of <br />
              <span className="text-indigo-600">modern healthcare</span> <br />
              management.
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              MediConnect provides a unified platform for doctors, patients, and staff to streamline appointments, records, and treatments with state-of-the-art security.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/registerPage"
                className="group flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-200"
              >
                Get Started free
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/loginPage"
                className="px-8 py-5 text-slate-900 font-black text-lg hover:text-indigo-600 transition-colors"
              >
                Sign in
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-6 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100">
                    <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">
                Trusted by <span className="text-slate-900 font-black tracking-tight">5,000+</span> healthcare practitioners
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 relative group animate-in zoom-in duration-700">
            <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-2xl group-hover:bg-indigo-600/20 transition-all duration-500 -z-10" />
            <div className="bg-slate-50 rounded-[2.5rem] p-4 border border-white shadow-2xl">
              <img
                src="/medical_hero.png"
                alt="MediConnect Dashboard Preview"
                className="rounded-3xl w-full h-auto shadow-inner"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute top-1/2 -left-12 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-xl border border-slate-50 animate-bounce-slow hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-slate-400">Success</p>
                  <p className="text-sm font-black text-slate-900">Patient Recorded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Everything you need to <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">run your clinic</span>.</h2>
            <p className="text-lg text-slate-500 font-semibold leading-relaxed">Powerful tools designed to simplify the complexity of medical management, allowing you to focus on what matters: patient care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="text-indigo-600" size={28} />}
              title="Appointment Scheduling"
              desc="Real-time booking and scheduling system for patients with automated reminders and calendar syncing."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-indigo-600" size={28} />}
              title="Secure Medical Records"
              desc="Industry-standard encryption for patient data, ensuring privacy and compliance with global health standards."
            />
            <FeatureCard
              icon={<Hospital className="text-indigo-600" size={28} />}
              title="Role-Based Dashboards"
              desc="Tailored interfaces for admins, doctors, receptionists, and patients to manage their specific tasks."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col items-center text-center gap-10 border-8 border-indigo-600 shadow-3xl shadow-indigo-100">
          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Join the future of healthcare.</h2>
            <p className="text-xl text-slate-400 font-bold max-w-lg mx-auto leading-relaxed">Start managing your clinic with MediConnect today and experience the difference in efficiency.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full max-w-md">
            <input
              type="email"
              placeholder="yourname@clinic.com"
              className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all text-lg"
            />
            <button className="px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-900/40">
              Join Now
            </button>
          </div>
          {/* Background decoration */}
          <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
        </div>
      </section>
    </main>
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-8 bg-white border border-slate-100 rounded-[2rem] hover:ring-4 hover:ring-indigo-600/5 hover:border-indigo-600/20 transition-all duration-300">
    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 font-semibold leading-relaxed">{desc}</p>
  </div>
);
