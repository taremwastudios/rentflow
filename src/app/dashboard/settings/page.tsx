"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const THEME_STORAGE_KEY = "rentflow-theme";

// Mock data structures matching API responses
interface MockSession {
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "landlord" | "tenant";
    avatarUrl: string | null;
  };
  session: {
    id: string;
    userId: number;
    expiresAt: Date;
    createdAt: Date;
  };
}

interface MockProfile {
  id: number;
  userId: number;
  verificationStatus: "pending" | "under_review" | "approved" | "rejected";
  phone: string | null;
  verificationNotes?: string | null;
}

export default function SettingsPage() { // Directly export the client component
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = storedTheme || systemTheme || 'light';
    setTheme(initialTheme);
    root.classList.toggle('dark', initialTheme === 'dark');

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching session data...");
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) {
          throw new Error(`HTTP error! status: ${sessionResponse.status}`);
        }
        const fetchedSession: MockSession = await sessionResponse.json();
        
        if (!fetchedSession.user) {
          console.warn("No user found in session, redirecting to login.");
          window.location.href = "/login";
          return;
        }
        setSession(fetchedSession);
        console.log("Session fetched successfully.");

        console.log("Fetching profile data...");
        const profileResponse = await fetch('/api/profile');
        if (!profileResponse.ok) {
          throw new Error(`HTTP error! status: ${profileResponse.status}`);
        }
        const fetchedProfile: MockProfile = await profileResponse.json();
        setProfile(fetchedProfile);
        console.log("Profile fetched successfully.");

      } catch (fetchError: any) {
        console.error("Error fetching settings data:", fetchError.message || fetchError);
        setError("Failed to load settings. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const toggleTheme = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    const root = window.document.documentElement;
    root.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  // Placeholder for profile update logic. In a real app, this would call an API route.
  const handleUpdateProfile = async (formData: FormData) => {
    console.log("Simulating profile update from client...");
    // This would typically involve a fetch to an API route like /api/profile/update
    alert("Profile updated (simulated)!");
    // To reflect changes, you might refetch or update local state.
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!session || !session.user) {
    // Redirect to login if session is invalid or not found
    if (typeof window !== 'undefined') {
       window.location.href = "/login";
    }
    return null; 
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and profile</p>
      </div>

      {/* Theme Toggle Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
          <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner">
            <button
              onClick={() => toggleTheme('light')}
              className={`py-1.5 px-5 rounded-full text-xs font-bold transition-all ${
                theme === 'light' 
                  ? 'bg-white text-gray-900 shadow dark:bg-gray-300 dark:text-gray-900' 
                  : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              className={`py-1.5 px-5 rounded-full text-xs font-bold transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white shadow dark:bg-gray-200 dark:text-gray-900' 
                  : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Profile Information</h2>
        {/* Using a placeholder for form submission. In a real app, this would call an API route. */}
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(new FormData(e.currentTarget)); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              name="name"
              type="text"
              defaultValue={session.user.name}
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={session.user.email}
              disabled
              className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 dark:bg-gray-800 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="+256 700 000 000"
              defaultValue={profile?.phone || ""}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Verification Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Verification Status</h2>
        <div className={`p-4 rounded-xl ${
          profile?.verificationStatus === "approved"
            ? "bg-green-50 border border-green-200 dark:bg-green-900 dark:border-green-700"
            : profile?.verificationStatus === "under_review"
            ? "bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700"
            : profile?.verificationStatus === "rejected"
            ? "bg-red-50 border border-red-200 dark:bg-red-900 dark:border-red-700"
            : "bg-amber-50 border border-amber-200 dark:bg-amber-900 dark:border-amber-700"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {profile?.verificationStatus === "approved" ? "✅" :
               profile?.verificationStatus === "under_review" ? "🔍" :
               profile?.verificationStatus === "rejected" ? "❌" : "⏳"}
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {profile?.verificationStatus?.replace("_", " ") ?? "Pending"}
              </p>
              {profile?.verificationStatus === "rejected" && profile.verificationNotes && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{profile.verificationNotes}</p>
              )}
            </div>
          </div>
        </div>
        {(profile?.verificationStatus === "pending" || profile?.verificationStatus === "rejected") && (
          <Link
            href="/dashboard/verify"
            className="mt-3 inline-block text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
          >
            Upload / Re-upload Documents →
          </Link>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Role</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{session.user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{session.user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
