"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface VerificationStatus {
  verificationStatus: "pending" | "under_review" | "approved" | "rejected";
  verificationNotes?: string | null;
}

export default function VerifyPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (e) {
        console.error("Error fetching verification status", e);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/landlord/verify", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      // Optimistically update status to 'pending' (or whatever the backend sets)
      // Usually after submission, it goes to 'pending' or 'under_review'
      setStatus({ verificationStatus: "pending" }); 
      window.location.reload(); // Reload to fetch fresh state from server
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Checking Status...</p>
      </div>
    );
  }

  // 1. Approved State - Persistent "Congrats"
  if (status?.verificationStatus === "approved") {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-500/20 p-12 text-center transition-colors shadow-sm dark:shadow-none">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">✅</div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">You&apos;re Verified!</h2>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-8 font-medium text-sm transition-colors">
            Congratulations! Your landlord account is fully verified. You can now list unlimited properties, accept payments, and manage agreements.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
             <Link
              href="/dashboard/properties/new"
              className="block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Add Property
            </Link>
            <Link
              href="/dashboard"
              className="block border border-slate-200 dark:border-emerald-500/20 text-slate-600 dark:text-emerald-500 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-emerald-500/5 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Pending / Under Review State - Persistent "Waiting"
  if (status?.verificationStatus === "pending" || status?.verificationStatus === "under_review") {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-12 text-center transition-colors shadow-sm dark:shadow-none">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">⏳</div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Submission Received</h2>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-8 font-medium text-sm transition-colors">
            Our team is currently reviewing your documents. This process typically takes 1-2 business days. We will notify you once approved.
          </p>
          <div className="inline-block bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
            Status: {status.verificationStatus.replace("_", " ")}
          </div>
          <div className="mt-8">
             <Link
              href="/dashboard"
              className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Rejected or New State - Show Form
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="px-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Account Verification</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-1 font-medium text-sm transition-colors">
          Upload documents to verify your landlord account.
        </p>
      </div>

      {status?.verificationStatus === "rejected" && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6 transition-colors">
          <h3 className="text-md font-bold text-red-800 dark:text-red-400 mb-2 transition-colors flex items-center gap-2">
            <span className="w-6 h-6 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center text-xs">❌</span>
            Verification Rejected
          </h3>
          <p className="text-red-700 dark:text-red-400/80 text-xs leading-relaxed font-medium transition-colors">
            {status.verificationNotes || "Please check your documents and try again."}
          </p>
        </div>
      )}

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
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Land Title / Lease <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-8 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                <input type="file" name="landTitle" accept="image/*,.pdf" required className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-600 file:text-white" />
              </div>
            </div>
            {/* Optional Docs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Business Cert (Optional)</label>
                <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-6 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                  <input type="file" name="registrationDoc" accept="image/*,.pdf" className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-slate-200 file:text-slate-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Other Docs (Optional)</label>
                <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-6 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                  <input type="file" name="additionalDocs" accept="image/*,.pdf" className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-slate-200 file:text-slate-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Info Section Restored */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors">Business Information</h2>
          <div className="grid gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Trading Name</label>
                  <input name="businessName" type="text" placeholder="e.g. Mugisha Properties" className="w-full px-4 py-3 bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Location</label>
                  <input name="location" type="text" defaultValue="Mbarara, Uganda" className="w-full px-4 py-3 bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900" />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Business Bio</label>
                <textarea name="bio" rows={3} placeholder="Tell us about your property business..." className="w-full px-4 py-3 bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900 resize-none" />
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
