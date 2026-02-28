"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Lock, Loader2, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Password reset successful!");
        setTimeout(() => router.push("/auth/loginPage"), 3000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      toast.error("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 p-10 shadow-2xl shadow-indigo-100/50">

          {success ? (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center p-6 bg-green-50 text-green-500 rounded-[2rem] shadow-inner ring-4 ring-green-50/50">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Password Updated!</h1>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  Your security credentials have been successfully updated. Redirecting you to sign in...
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/auth/loginPage"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Sign In Now
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-inner ring-4 ring-indigo-50/50">
                  <Lock size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Set New Password</h1>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  Choose a secure new password for your access.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <ShieldAlert size={20} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white rounded-[1.5rem] py-4.5 font-black text-lg transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-95 disabled:opacity-70 shadow-lg shadow-indigo-100"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    "Finalize Reset"
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/auth/loginPage"
              className="text-slate-400 font-black text-sm hover:text-indigo-600 transition-colors"
            >
              Cancel and Return
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}