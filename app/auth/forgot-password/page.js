"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Reset link sent successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 p-10 shadow-2xl shadow-indigo-100/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-inner ring-4 ring-indigo-50/50">
              <Mail size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Forgot Password?</h1>
            <p className="text-slate-500 font-semibold leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6 text-center animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex flex-col items-center gap-4">
                <CheckCircle2 size={40} className="text-green-500" />
                <div className="space-y-1">
                  <p className="font-black text-slate-900">Check your inbox!</p>
                  <p className="text-sm text-slate-600 font-medium">If an account exists for {email}, you'll receive a reset link shortly.</p>
                </div>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="text-indigo-600 font-black text-sm hover:underline underline-offset-4"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.smith@clinic.com"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white rounded-[1.5rem] py-4.5 font-black text-lg transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/auth/loginPage"
              className="inline-flex items-center gap-2 text-slate-600 font-black text-sm hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}