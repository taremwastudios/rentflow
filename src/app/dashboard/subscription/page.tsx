"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Subscription plans data (same as pricing page)
const plans = [
  { id: 1, name: "Free", slug: "free", priceMonthly: 0, priceAnnually: 0, description: "Perfect for getting started", features: ["1 property", "3 units total", "Basic tenant management", "Standard support", "1 GB storage"], propertyLimit: 1, unitLimit: 3 },
  { id: 2, name: "Starter", slug: "starter", priceMonthly: 0, priceAnnually: 0, description: "Free for 1 year with credit card", features: ["3 properties", "15 units total", "Advanced tenant management", "Priority support", "5 GB storage", "Featured listings"], propertyLimit: 3, unitLimit: 15 },
  { id: 3, name: "Businessman", slug: "businessman", priceMonthly: 22000, priceAnnually: 220000, description: "For growing landlords", features: ["10 properties", "50 units total", "Advanced analytics", "Priority support", "20 GB storage", "Featured listings", "Custom branding"], propertyLimit: 10, unitLimit: 50 },
  { id: 4, name: "Pro", slug: "pro", priceMonthly: 34000, priceAnnually: 340000, description: "Professional rental management", features: ["Unlimited properties", "Unlimited units", "Advanced analytics", "24/7 Priority support", "100 GB storage", "Featured listings priority", "Custom branding", "API access"], propertyLimit: -1, unitLimit: -1 },
  { id: 5, name: "Estate / PAYG", slug: "estate", priceMonthly: 58000, setupFee: 145000, priceAnnually: 580000, description: "Pay as you go for large estates", features: ["Unlimited properties", "Unlimited units", "Advanced analytics", "24/7 Priority support", "Unlimited storage", "Top featured listings", "Custom branding", "API access", "White-label option", "Dedicated account manager"], propertyLimit: -1, unitLimit: -1 },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [cryptoCurrency, setCryptoCurrency] = useState("USDT");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setCurrentPlan(plans[0]); // Mock free plan
      } catch (error) {
        console.error("Error loading subscription:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSubscription();
  }, []);

  const handleUpgrade = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setProcessingPayment(true);
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id, billingCycle, cryptoCurrency }),
      });
      const data = await response.json();
      if (data.success && data.payment.checkoutUrl) {
        window.location.href = data.payment.checkoutUrl;
      } else {
        alert("Failed to create payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Payment creation failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Subscription</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="px-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Subscription</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-1 font-medium text-sm transition-colors">
          Scale your properties and manage your billing
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600 rounded-2xl rotate-0.5 group-hover:rotate-0 transition-transform duration-500 opacity-5"></div>
        <div className="relative bg-white dark:bg-slate-950 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-none transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="inline-flex items-center px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-1 transition-colors">
                  Active Plan
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">{currentPlan?.name || "Free"}</h2>
                <p className="text-slate-400 dark:text-emerald-500/40 font-bold text-xs transition-colors">
                  {currentPlan?.priceMonthly === 0 ? "Free forever for starters" : `${currentPlan?.priceMonthly?.toLocaleString()} UGX / month`}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-slate-50 dark:bg-emerald-500/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-emerald-500/10 transition-colors">
                <div className="text-[9px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-widest mb-0.5 transition-colors">Properties</div>
                <div className="text-md font-black text-slate-800 dark:text-white transition-colors">{currentPlan?.propertyLimit === -1 ? "Unlimited" : currentPlan?.propertyLimit}</div>
              </div>
              <div className="bg-slate-50 dark:bg-emerald-500/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-emerald-500/10 transition-colors">
                <div className="text-[9px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-widest mb-0.5 transition-colors">Total Units</div>
                <div className="text-md font-black text-slate-800 dark:text-white transition-colors">{currentPlan?.unitLimit === -1 ? "Unlimited" : currentPlan?.unitLimit}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-2 transition-colors">Upgrade your growth</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            return (
              <div key={plan.id} className={`relative flex flex-col bg-white dark:bg-slate-950 rounded-xl transition-all ${isCurrentPlan ? "ring-2 ring-emerald-500 z-10" : "border border-slate-100 dark:border-emerald-500/20 shadow-sm dark:shadow-none"}`}>
                <div className="p-5 flex flex-col h-full">
                  <h4 className="text-md font-bold text-slate-800 dark:text-white transition-colors">{plan.name}</h4>
                  <p className="text-slate-400 dark:text-emerald-500/40 text-[10px] font-medium leading-relaxed mb-4 h-8 overflow-hidden transition-colors">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-xl font-black text-slate-900 dark:text-white transition-colors">{plan.priceMonthly === 0 ? "Free" : `${plan.priceMonthly?.toLocaleString()}`}</span>
                    {plan.priceMonthly > 0 && <span className="text-slate-400 dark:text-emerald-500/40 text-[9px] font-bold ml-1 uppercase transition-colors">UGX/mo</span>}
                  </div>
                  <div className="flex-grow">
                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start text-[10px] text-slate-600 dark:text-slate-300 group/item transition-colors">
                          <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => !isCurrentPlan && handleUpgrade(plan)} disabled={isCurrentPlan} className={`block w-full text-center py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isCurrentPlan ? "bg-slate-50 dark:bg-emerald-500/5 text-slate-400 dark:text-emerald-500/20 cursor-default" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{isCurrentPlan ? "Current" : "Switch"}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-colors">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-transparent dark:border-emerald-500/20 max-w-md w-full p-8 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white transition-colors">Upgrade Plan</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white transition-all">✕</button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {["monthly", "annually"].map((cycle) => (
                  <button key={cycle} onClick={() => setBillingCycle(cycle as any)} className={`py-2 px-4 rounded-xl font-bold text-xs border-2 transition-all ${billingCycle === cycle ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-slate-100 dark:border-emerald-500/5 text-slate-400 dark:text-emerald-500/20"}`}>{cycle.charAt(0).toUpperCase() + cycle.slice(1)}</button>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-emerald-500/5 rounded-xl p-4 space-y-2 transition-colors">
                <div className="flex justify-between items-center text-xs font-bold transition-colors">
                  <span className="text-slate-400 dark:text-emerald-500/40 transition-colors">Plan</span>
                  <span className="text-slate-900 dark:text-white transition-colors">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200/50 dark:border-emerald-500/10 pt-2 transition-colors">
                  <span className="text-slate-400 dark:text-emerald-500/40 transition-colors">Total Due</span>
                  <span className="text-md text-emerald-600 dark:text-emerald-400 font-black transition-colors">{(billingCycle === "annually" ? selectedPlan?.priceAnnually : selectedPlan?.priceMonthly)?.toLocaleString()} UGX</span>
                </div>
              </div>
              <button onClick={handlePayment} disabled={processingPayment} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 disabled:opacity-50">
                {processingPayment ? "Processing..." : "Complete Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
