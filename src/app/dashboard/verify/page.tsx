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
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Our admin team will review your documents within 1-2 business days. 
            You&apos;ll be notified once your account is approved.
          </p>
          <Link
            href="/dashboard"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Verification</h1>
        <p className="text-gray-500 mt-1">
          Upload the required documents to verify your landlord account and start listing properties.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Why do we verify landlords?</h3>
        <p className="text-blue-700 text-sm leading-relaxed">
          Verification protects tenants from fraud and ensures all properties on RentFlow are legitimate. 
          It also builds trust in your listings, making tenants more likely to contact you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Required Documents</h2>

          {/* National ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              National ID <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Upload a clear photo or scan of your National ID (front and back)</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                name="nationalId"
                accept="image/*,.pdf"
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, or PDF up to 10MB</p>
            </div>
          </div>

          {/* Land Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Land Title / Lease Agreement <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Upload your land title, lease agreement, or any document proving you own or manage the property
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                name="landTitle"
                accept="image/*,.pdf"
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, or PDF up to 10MB</p>
            </div>
          </div>

          {/* Registration Doc */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Business Registration Certificate <span className="text-gray-400">(Optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              If you operate as a business, upload your URSB registration certificate
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                name="registrationDoc"
                accept="image/*,.pdf"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, or PDF up to 10MB</p>
            </div>
          </div>

          {/* Additional Docs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Additional Documents <span className="text-gray-400">(Optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Any other supporting documents (e.g., utility bills, council letters)
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                name="additionalDocs"
                accept="image/*,.pdf"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, or PDF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Business Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Business / Trading Name <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Mugisha Properties Ltd"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location / Area of Operation
              </label>
              <input
                type="text"
                name="location"
                defaultValue="Mbarara, Uganda"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Brief Bio / About You
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Tell tenants a bit about yourself and your properties..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Save for Later
          </Link>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Submit for Review →
          </button>
        </div>
      </form>
    </div>
  );
}
