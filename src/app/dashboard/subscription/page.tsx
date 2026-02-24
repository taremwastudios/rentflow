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
    priceMonthly: 5.99,
    priceAnnually: 59.9,
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
    priceMonthly: 9.25,
    priceAnnually: 92.5,
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
    priceMonthly: 15.89,
    setupFee: 39.33,
    priceAnnually: 0,
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {currentPlan?.name || "Free"}
            </div>
            <div className="text-gray-600">
              {currentPlan?.priceMonthly === 0
                ? "Free forever"
                : `$${currentPlan?.priceMonthly}/month`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Active
            </div>
          </div>
        </div>

        {/* Usage limits */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Property Limit</div>
              <div className="font-semibold">
                {currentPlan?.propertyLimit === -1
                  ? "Unlimited"
                  : currentPlan?.propertyLimit}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Unit Limit</div>
              <div className="font-semibold">
                {currentPlan?.unitLimit === -1
                  ? "Unlimited"
                  : currentPlan?.unitLimit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            const isUpgrade =
              !isCurrentPlan &&
              plan.priceMonthly > (currentPlan?.priceMonthly || 0);

            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 ${
                  isCurrentPlan ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  {isCurrentPlan && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold">
                    ${plan.priceMonthly}
                  </span>
                  {plan.priceMonthly > 0 && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>

                <ul className="text-sm space-y-1 mb-4">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upgrade to {plan.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {plan.priceMonthly === 0 ? "Downgrade to Free" : "Switch Plan"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Upgrade to {selectedPlan?.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="billingCycle"
                      value="monthly"
                      checked={billingCycle === "monthly"}
                      onChange={(e) =>
                        setBillingCycle(e.target.value as "monthly")
                      }
                      className="mr-2"
                    />
                    Monthly
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="billingCycle"
                      value="annually"
                      checked={billingCycle === "annually"}
                      onChange={(e) =>
                        setBillingCycle(e.target.value as "annually")
                      }
                      className="mr-2"
                    />
                    Annually (Save 20%)
                  </label>
                </div>
              </div>

              {/* Crypto Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Currency
                </label>
                <select
                  value={cryptoCurrency}
                  onChange={(e) => setCryptoCurrency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {cryptos.map((crypto) => (
                    <option key={crypto} value={crypto}>
                      {crypto}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Billing:</span>
                  <span className="font-semibold capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    $
                    {billingCycle === "annually"
                      ? selectedPlan?.priceAnnually
                      : selectedPlan?.priceMonthly}
                    /{billingCycle === "annually" ? "year" : "month"}
                  </span>
                </div>
              </div>

              {/* Crypto Payment Notice */}
              <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800">
                💳 You&apos;ll be redirected to NOWPayments to complete your crypto
                payment securely.
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processingPayment
                  ? "Processing..."
                  : `Pay with ${cryptoCurrency}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
