"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { updateProfile } from "@/app/actions/settings";

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
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme || 'light';
    setTheme(initialTheme);
    
    // Explicitly sync the class on mount
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) throw new Error(`Session error: ${sessionResponse.status}`);
        const fetchedSession: MockSession = await sessionResponse.json();
        
        if (!fetchedSession.user) {
          window.location.href = "/login";
          return;
        }
        setSession(fetchedSession);

        const profileResponse = await fetch('/api/profile');
        if (!profileResponse.ok) throw new Error(`Profile error: ${profileResponse.status}`);
        const fetchedProfile: MockProfile = await profileResponse.json();
        setProfile(fetchedProfile);

      } catch (fetchError: any) {
        console.error("Error fetching settings data:", fetchError);
        setError("Failed to load settings. Please refresh or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTheme = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    // Apply class to documentElement for global support
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleUpdateProfile = async (formData: FormData) => {
    setIsUpdating(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        alert("Profile updated successfully!");
        // Refresh local session name
        if (session) {
          setSession({
            ...session,
            user: { ...session.user, name: formData.get("name") as string }
          });
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Settings</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="text-emerald-600 font-bold hover:underline">Try Again</button>
      </div>
    );
  }

  if (!session || !session.user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="px-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Settings</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-1 font-medium text-sm">Manage your personal preferences and account security</p>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-6 shadow-sm dark:shadow-none transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Appearance</h2>
            <p className="text-slate-400 dark:text-emerald-500/40 text-xs font-medium transition-colors">Customize how RentFlow looks on your device</p>
          </div>
          
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit transition-colors border dark:border-emerald-500/20">
            <button
              onClick={() => toggleTheme('light')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                theme === 'light' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-emerald-500/40 dark:hover:text-emerald-400'
              }`}
            >
              <span>☀️</span>
              <span>Light</span>
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                theme === 'dark' 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-emerald-500/40 dark:hover:text-emerald-400'
              }`}
            >
              <span>🌙</span>
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-6 shadow-sm dark:shadow-none transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors">Profile Information</h2>
        <form action={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Full Name</label>
            <input
              name="name"
              type="text"
              defaultValue={session.user.name}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Email (Primary)</label>
            <input
              type="email"
              value={session.user.email}
              disabled
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-emerald-500/10 rounded-xl text-slate-400 dark:text-emerald-500/30 text-sm font-bold cursor-not-allowed transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="+256 700 000 000"
              defaultValue={profile?.phone || ""}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20 p-6 transition-colors">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-500 mb-1 transition-colors">Danger Zone</h2>
        <p className="text-slate-500 dark:text-slate-500 text-xs font-medium mb-4 transition-colors">Permanently delete your account and all associated data</p>
        <button className="px-6 py-2.5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 rounded-lg font-bold text-xs hover:bg-red-600 hover:text-white transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
}
