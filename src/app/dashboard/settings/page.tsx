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
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme || 'light';
    setTheme(initialTheme);

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
    alert("Profile update simulated! (Live updates coming soon)");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Settings</p>
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
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="px-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Settings</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium">Manage your personal preferences and account security</p>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 shadow-sm dark:shadow-none transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Appearance</h2>
            <p className="text-slate-400 dark:text-emerald-500/40 text-sm font-medium transition-colors">Customize how RentFlow looks on your device</p>
          </div>
          
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit transition-colors border dark:border-emerald-500/20">
            <button
              onClick={() => toggleTheme('light')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                theme === 'light' 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-emerald-500/40 dark:hover:text-emerald-400'
              }`}
            >
              <span>☀️</span>
              <span>Light</span>
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                theme === 'dark' 
                  ? 'bg-emerald-600 text-white' 
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
      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 shadow-sm dark:shadow-none transition-colors">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">Profile Information</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(new FormData(e.currentTarget)); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Full Name</label>
            <input
              name="name"
              type="text"
              defaultValue={session.user.name}
              required
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Email (Primary)</label>
            <input
              type="email"
              value={session.user.email}
              disabled
              className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-emerald-500/10 rounded-2xl text-slate-400 dark:text-emerald-500/30 font-bold cursor-not-allowed transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="+256 700 000 000"
              defaultValue={profile?.phone || ""}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-none"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-500/5 rounded-[2.5rem] border border-red-100 dark:border-red-500/20 p-8 transition-colors">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2 transition-colors">Danger Zone</h2>
        <p className="text-slate-500 dark:text-slate-500 text-sm font-medium mb-6 transition-colors">Permanently delete your account and all associated data</p>
        <button className="px-8 py-3 border-2 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
}
