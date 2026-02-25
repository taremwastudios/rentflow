"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Subscription plans data (same as pricing page)
const plans = [
  {
    id: 1,
    name: "Free",
    slug: "free",
    priceMonthly: 0,
    priceAnnually: 0,
    description: "Perfect for getting started",
    features: [
      "1 property",
      "3 units total",
      "Basic tenant management",
      "Standard support",
      "1 GB storage",
    ],
    propertyLimit: 1,
    unitLimit: 3,
  },
  {
    id: 2,
    name: "Starter",
    slug: "starter",
    priceMonthly: 0,
    priceAnnually: 0,
    description: "Free for 1 year with credit card",
    features: [
      "3 properties",
      "15 units total",
      "Advanced tenant management",
      "Priority support",
      "5 GB storage",
      "Featured listings",
    ],
    propertyLimit: 3,
    unitLimit: 15,
  },
  {
    id: 3,
    name: "Businessman",
    slug: "businessman",
    priceMonthly: 22000,
    priceAnnually: 220000,
    description: "For growing landlords",
    features: [
      "10 properties",
      "50 units total",
      "Advanced analytics",
      "Priority support",
      "20 GB storage",
      "Featured listings",
      "Custom branding",
    ],
    propertyLimit: 10,
    unitLimit: 50,
  },
  {
    id: 4,
    name: "Pro",
    slug: "pro",
    priceMonthly: 34000,
    priceAnnually: 340000,
    description: "Professional rental management",
    features: [
      "Unlimited properties",
      "Unlimited units",
      "Advanced analytics",
      "24/7 Priority support",
      "100 GB storage",
      "Featured listings priority",
      "Custom branding",
      "API access",
    ],
    propertyLimit: -1,
    unitLimit: -1,
  },
  {
    id: 5,
    name: "Estate / PAYG",
    slug: "estate",
    priceMonthly: 58000,
    setupFee: 145000,
    priceAnnually: 580000,
    description: "Pay as you go for large estates",
    features: [
      "Unlimited properties",
      "Unlimited units",
      "Advanced analytics",
      "24/7 Priority support",
      "Unlimited storage",
      "Top featured listings",
      "Custom branding",
      "API access",
      "White-label option",
      "Dedicated account manager",
    ],
    propertyLimit: -1,
    unitLimit: -1,
  },
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

  // Supported cryptocurrencies
  const cryptos = ["BTC", "ETH", "USDT", "BNB", "DOGE", "LTC", "XMR", "XRP"];

  useEffect(() => {
    // Load current subscription data
    const loadSubscription = async () => {
      try {
        // For now, we'll simulate having a free plan
        // In real implementation, this would fetch from database
        setCurrentPlan(plans[0]); // Free plan
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
          cryptoCurrency,
        }),
      });

      const data = await response.json();

      if (data.success && data.payment.checkoutUrl) {
        // Redirect to NOWPayments checkout
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading subscription...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscription</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Scale your properties and manage your billing
        </p>
      </div>

      {/* Current Plan Status - New Premium Design */}
      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600 rounded-[2.5rem] rotate-0.5 group-hover:rotate-0 transition-transform duration-500 opacity-10"></div>
        <div className="relative bg-white border border-emerald-100 rounded-[2.5rem] p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.1)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
                  Active Plan
                </div>
                <h2 className="text-3xl font-black text-slate-900">{currentPlan?.name || "Free"}</h2>
                <p className="text-slate-400 font-bold text-sm">
                  {currentPlan?.priceMonthly === 0
                    ? "Free forever for starters"
                    : `${currentPlan?.priceMonthly?.toLocaleString()} UGX / month`}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Properties</div>
                <div className="text-xl font-black text-slate-800">
                  {currentPlan?.propertyLimit === -1 ? "Unlimited" : currentPlan?.propertyLimit}
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Units</div>
                <div className="text-xl font-black text-slate-800">
                  {currentPlan?.unitLimit === -1 ? "Unlimited" : currentPlan?.unitLimit}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plans - Grid Layout */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 ml-2">Choose a plan that fits your growth</h3>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col bg-white rounded-[2rem] transition-all duration-500 group ${
                  isCurrentPlan 
                    ? "ring-2 ring-emerald-500 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] scale-105 z-10" 
                    : "border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                    Your current plan
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  <h4 className="text-lg font-bold text-slate-800 mb-1">{plan.name}</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 h-8 overflow-hidden">
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {plan.priceMonthly === 0 ? "Free" : `${plan.priceMonthly?.toLocaleString()}`}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-slate-400 text-[10px] font-bold ml-1 uppercase">UGX/mo</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <ul className="space-y-4 mb-8">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start text-xs text-slate-600 group/item">
                          <div className="mr-2 mt-0.5 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-emerald-100 transition-colors">
                            <svg className="w-2 h-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => !isCurrentPlan && handleUpgrade(plan)}
                    disabled={isCurrentPlan}
                    className={`block w-full text-center py-3.5 rounded-2xl font-bold text-xs transition-all active:scale-95 ${
                      isCurrentPlan
                        ? "bg-slate-50 text-slate-400 cursor-default"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
                    }`}
                  >
                    {isCurrentPlan ? "Current Active Plan" : "Switch to this Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal Redesign */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Upgrade Plan</h3>
                <p className="text-slate-500 text-sm">Review your selection</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Billing Cycle */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Billing Cycle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["monthly", "annually"].map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle as any)}
                      className={`py-3 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                        billingCycle === cycle
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-slate-900">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold border-t border-slate-200/50 pt-3">
                  <span className="text-slate-400">Total Due</span>
                  <div className="text-right">
                    <span className="text-lg text-emerald-600 font-black">
                      {(billingCycle === "annually" ? selectedPlan?.priceAnnually : selectedPlan?.priceMonthly)?.toLocaleString()} UGX
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase">per {billingCycle === "annually" ? "year" : "month"}</p>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Complete Payment"
                )}
              </button>
              
              <p className="text-center text-[10px] text-slate-400 font-medium">
                Payments are securely processed via NOWPayments crypto bridge.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
