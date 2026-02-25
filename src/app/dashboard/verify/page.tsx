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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/landlord/verify", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        alert("Verification documents submitted successfully!");
        window.location.reload(); 
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit documents. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An error occurred during submission. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest transition-colors">Checking Status</p>
      </div>
    );
  }

  // 1. Approved State
  if (status?.verificationStatus === "approved") {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-500/20 p-12 text-center transition-colors shadow-sm dark:shadow-none">
          <div className="text-5xl mb-8 transition-colors">✅</div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 transition-colors uppercase tracking-tight">Account Verified</h2>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 font-medium text-sm transition-colors leading-relaxed max-w-lg mx-auto">
            Congratulations! Your account is verified. You now have full access to RentFlow Uganda. Start listing properties and managing your units effortlessly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
             <Link
              href="/dashboard/properties/new"
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-emerald-500/20 shadow-lg hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
            >
              Add Property
            </Link>
            <Link
              href="/dashboard"
              className="border border-slate-200 dark:border-emerald-500/20 text-slate-600 dark:text-emerald-500 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-emerald-500/5 transition-all active:scale-95"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Under Review State
  if (status?.verificationStatus === "under_review") {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-12 text-center transition-colors shadow-sm dark:shadow-none">
          <div className="text-5xl mb-8 transition-colors">🔍</div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 transition-colors uppercase tracking-tight">Review in Progress</h2>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 font-medium text-sm transition-colors leading-relaxed max-w-lg mx-auto">
            We have received your documents. Our team is currently verifying your details to ensure platform security. This typically takes 24-48 hours.
          </p>
          <div className="inline-block bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border dark:border-emerald-500/10 transition-colors">
            Status: Under Review
          </div>
          <div className="mt-12 transition-colors">
             <Link
              href="/dashboard"
              className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest hover:underline transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Rejected or Pending State
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="px-2 transition-colors">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Account Verification</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium text-sm">
          Please upload your documents to verify your landlord identity.
        </p>
      </div>

      {status?.verificationStatus === "rejected" && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-8 transition-colors">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2 transition-colors flex items-center gap-3">
            <span className="text-2xl">❌</span>
            Verification Rejected
          </h3>
          <p className="text-sm font-medium text-red-700 dark:text-red-400/80 leading-relaxed transition-colors">
            {status.verificationNotes || "One or more documents were invalid. Please re-upload clear copies."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10 transition-colors">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors shadow-sm dark:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">Required Documents</h2>
          <div className="grid gap-10">
            <div className="space-y-4 transition-colors">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">National ID <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-10 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                <input type="file" name="nationalId" accept="image/*,.pdf" required className="w-full text-sm text-slate-500 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-emerald-600 file:text-white cursor-pointer transition-all" />
              </div>
            </div>
            <div className="space-y-4 transition-colors">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Land Title / Lease Agreement <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-10 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                <input type="file" name="landTitle" accept="image/*,.pdf" required className="w-full text-sm text-slate-500 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-emerald-600 file:text-white cursor-pointer transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-colors">
               <div className="space-y-4 transition-colors">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Business Certificate (Optional)</label>
                <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-8 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                  <input type="file" name="registrationDoc" accept="image/*,.pdf" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-200 file:text-slate-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400 cursor-pointer transition-all" />
                </div>
              </div>
              <div className="space-y-4 transition-colors">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Other Evidence (Optional)</label>
                <div className="border-2 border-dashed border-slate-100 dark:border-emerald-500/10 rounded-xl p-8 text-center hover:border-emerald-400 transition-all bg-slate-50 dark:bg-transparent">
                  <input type="file" name="additionalDocs" accept="image/*,.pdf" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-200 file:text-slate-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400 cursor-pointer transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors shadow-sm dark:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">Business Details</h2>
          <div className="grid gap-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-colors">
                <div className="space-y-2 transition-colors">
                  <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Trading Name</label>
                  <input name="businessName" type="text" placeholder="e.g. Mugisha Properties" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900" />
                </div>
                <div className="space-y-2 transition-colors">
                  <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Location</label>
                  <input name="location" type="text" defaultValue="Mbarara, Uganda" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900" />
                </div>
             </div>
             <div className="space-y-2 transition-colors">
                <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Bio / Summary</label>
                <textarea name="bio" rows={4} placeholder="Tell us about your property business..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900 resize-none" />
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 transition-colors">
          <Link href="/dashboard" className="flex-1 text-center py-4 border-2 border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-600 dark:text-emerald-500/60 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Save Later</Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
