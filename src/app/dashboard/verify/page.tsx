"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyPage() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/landlord/verify", {
      method: "POST",
      body: formData,
    });
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-12 text-center transition-colors shadow-sm dark:shadow-none">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">🎉</div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Documents Submitted!</h2>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-8 font-medium text-sm transition-colors">
            Our admin team will review your documents within 1-2 business days.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="px-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Account Verification</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-1 font-medium text-sm transition-colors">
          Upload documents to verify your landlord account.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6 transition-colors">
        <h3 className="text-md font-bold text-blue-800 dark:text-blue-400 mb-2 transition-colors flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-xs">🛡️</span>
          Why do we verify?
        </h3>
        <p className="text-blue-700 dark:text-blue-500/70 text-xs leading-relaxed font-medium transition-colors">
          Verification protects tenants from fraud and ensures all properties on RentFlow are legitimate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors">Required Documents</h2>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">National ID <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-8 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                <input type="file" name="nationalId" accept="image/*,.pdf" required className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-600 file:text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Land Title <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-8 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                <input type="file" name="landTitle" accept="image/*,.pdf" required className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-600 file:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1 text-center py-3 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-600 dark:text-emerald-500/60 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Save Later</Link>
          <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Submit Review</button>
        </div>
      </form>
    </div>
  );
}
