import Link from "next/link";

export default function PricingPage() {
  // Subscription plans data
  const plans = [
    {
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
      highlighted: false,
    },
    {
      name: "Starter",
      slug: "starter",
      priceMonthly: 0, // Free for 1 year with credit card
      priceAnnually: 0,
      description: "Free for 1 year with valid credit card",
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
      highlighted: false,
      note: "Free 1 year with credit card",
    },
    {
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
      highlighted: true,
    },
    {
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
      highlighted: false,
    },
    {
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
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RentFlow
            </Link>
            <span className="text-sm text-gray-500">Uganda</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section-16 text-center */}
      <section className="py">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Choose the perfect plan for your rental management needs. All plans
          include our core features with no hidden fees.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                plan.highlighted
                  ? "ring-2 ring-blue-600 transform md:-translate-y-2"
                  : ""
              }`}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-blue-100 text-sm">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="p-6">
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.priceMonthly === 0 ? "0" : plan.priceMonthly}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {plan.priceMonthly === 0 ? "" : "/month"}
                  </span>
                </div>

                {plan.setupFee && (
                  <div className="text-sm text-gray-600 mb-4">
                    One-time setup: ${plan.setupFee}
                  </div>
                )}

                {plan.note && (
                  <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full mb-4 inline-block">
                    {plan.note}
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
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

                {/* CTA Button */}
                <Link
                  href={`/register?plan=${plan.slug}`}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.priceMonthly === 0 ? "Get Started Free" : "Start Free Trial"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major cryptocurrencies including Bitcoin, Ethereum,
                USDT, and many more through NOWPayments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens when my free trial ends?
              </h3>
              <p className="text-gray-600">
                You&apos;ll be prompted to enter your payment details to continue
                using the service. For Starter plan, you need a valid credit
                card to keep using the service after 1 year.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee for all paid plans.
                Contact our support team to request a refund.
              </p>
            </div>
          </div>
        </div>

        {/* Crypto Payment Info */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            🔒 Secure Crypto Payments
          </h2>
          <p className="text-purple-100 mb-4">
            All payments are processed securely through NOWPayments. We accept
            150+ cryptocurrencies with instant confirmation.
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span>✅ Bitcoin</span>
            <span>✅ Ethereum</span>
            <span>✅ USDT</span>
            <span>✅ And 150+ more</span>
          </div>
        </div>
      </section>
    </div>
  );
}
