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

    if (res.ok) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-emerald-500/20 p-16 text-center transition-colors">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 transition-colors">🎉</div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 transition-colors">Documents Submitted!</h2>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 font-medium transition-colors">
            Our admin team will review your documents within 1-2 business days. 
            You&apos;ll be notified once your account is approved.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="px-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Account Verification</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium transition-colors">
          Upload the required documents to verify your landlord account and start listing properties.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-[2.5rem] p-8 transition-colors">
        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-3 transition-colors flex items-center gap-3">
          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">🛡️</span>
          Why do we verify landlords?
        </h3>
        <p className="text-blue-700 dark:text-blue-500/70 text-sm leading-relaxed font-medium transition-colors">
          Verification protects tenants from fraud and ensures all properties on RentFlow are legitimate. 
          It also builds trust in your listings, making tenants more likely to contact you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">Required Documents</h2>

          <div className="grid gap-8">
            {/* National ID */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">
                National ID <span className="text-red-500">*</span>
              </label>
              <div className="group border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-[2rem] p-10 text-center hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all bg-slate-50 dark:bg-transparent">
                <input
                  type="file"
                  name="nationalId"
                  accept="image/*,.pdf"
                  required
                  className="w-full text-sm text-slate-500 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all cursor-pointer"
                />
                <p className="text-[10px] font-bold text-slate-400 dark:text-emerald-500/40 mt-4 uppercase tracking-tighter">PNG, JPG, or PDF up to 10MB</p>
              </div>
            </div>

            {/* Land Title */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">
                Land Title / Lease Agreement <span className="text-red-500">*</span>
              </label>
              <div className="group border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-[2rem] p-10 text-center hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all bg-slate-50 dark:bg-transparent">
                <input
                  type="file"
                  name="landTitle"
                  accept="image/*,.pdf"
                  required
                  className="w-full text-sm text-slate-500 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all cursor-pointer"
                />
                <p className="text-[10px] font-bold text-slate-400 dark:text-emerald-500/40 mt-4 uppercase tracking-tighter transition-colors">Property ownership proof</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">Business Information</h2>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">
                  Business Name <span className="text-slate-400 dark:text-emerald-500/20">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="e.g. Mugisha Properties Ltd"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue="Mbarara, Uganda"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">
                Brief Bio / About You
              </label>
              <textarea
                name="bio"
                rows={4}
                placeholder="Tell tenants a bit about yourself and your properties..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex-1 text-center py-4 border-2 border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-600 dark:text-emerald-500/60 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-emerald-500/5 transition-all active:scale-95"
          >
            Save for Later
          </Link>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Submit for Review →
          </button>
        </div>
      </form>
    </div>
  );
}
