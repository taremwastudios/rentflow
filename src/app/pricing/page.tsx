import Link from "next/link";

export default function PricingPage() {
  // Subscription plans data - Prices in USD, converted to UGX for display
  const plans = [
    {
      name: "Free",
      slug: "free",
      priceMonthly: 0,
      priceMonthlyUGX: 0,
      priceAnnually: 0,
      description: "Perfect for landlords just starting out in Mbarara",
      features: [
        "1 property management",
        "Up to 3 rental units",
        "Basic tenant records",
        "Simple rent tracking",
        "Email support",
      ],
      propertyLimit: 1,
      unitLimit: 3,
      highlighted: false,
    },
    {
      name: "Starter",
      slug: "starter",
      priceMonthly: 0,
      priceMonthlyUGX: 0,
      priceAnnually: 0,
      description: "Get your rental business running smoothly",
      features: [
        "Up to 3 properties",
        "Up to 15 units across properties",
        "Tenant management & records",
        "Rent payment tracking",
        "Generate rent receipts",
        "Priority email support",
      ],
      propertyLimit: 3,
      unitLimit: 15,
      highlighted: false,
      badge: "Most Popular",
    },
    {
      name: "Business",
      slug: "business",
      priceMonthly: 5.99,
      priceMonthlyUGX: 21950,
      priceAnnually: 59.9,
      priceAnnuallyUGX: 219500,
      description: "For serious landlords with multiple properties",
      features: [
        "Up to 10 properties",
        "Up to 50 rental units",
        "Advanced tenant analytics",
        "Payment reminder automation",
        "Multi-property dashboard",
        "Generate financial reports",
        "Priority WhatsApp support",
      ],
      propertyLimit: 10,
      unitLimit: 50,
      highlighted: true,
    },
    {
      name: "Pro",
      slug: "pro",
      priceMonthly: 9.25,
      priceMonthlyUGX: 33900,
      priceAnnually: 92.5,
      priceAnnuallyUGX: 339000,
      description: "Full-featured rental empire management",
      features: [
        "Unlimited properties",
        "Unlimited units",
        "Advanced analytics & insights",
        "Dedicated account manager",
        "White-label your dashboard",
        "API access for integrations",
        "24/7 phone & WhatsApp support",
      ],
      propertyLimit: -1,
      unitLimit: -1,
      highlighted: false,
    },
    {
      name: "Estate Manager",
      slug: "estate",
      priceMonthly: 15.89,
      priceMonthlyUGX: 58200,
      setupFee: 39.33,
      setupFeeUGX: 144100,
      priceAnnually: 0,
      description: "For property companies and large estates in Uganda",
      features: [
        "Unlimited properties & units",
        "Custom estate branding",
        "Multi-user access (10+ staff)",
        "Dedicated account manager",
        "Training for your team",
        "SLA guarantee",
        "Priority 24/7 support",
        "Custom integrations",
      ],
      propertyLimit: -1,
      unitLimit: -1,
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-green-600">
              RentFlow
            </Link>
            <span className="text-sm text-green-700 font-medium">Uganda</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-green-600 font-medium">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Trusted by 500+ Ugandan Landlords
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent <span className="text-green-600">Uganda Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            No hidden fees. No surprise charges. Just powerful rental management 
            built specifically for Ugandan landlords.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span> No credit card required for Free
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span> Cancel anytime
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span> 30-day money back
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "ring-4 ring-green-500 transform md:-translate-y-2"
                  : "border border-green-100"
              }`}
            >
              {/* Card Header */}
              <div className={`p-6 text-white ${
                plan.highlighted 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                  : "bg-gradient-to-r from-gray-700 to-gray-800"
              }`}>
                {plan.badge && (
                  <div className="bg-white text-green-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/90 text-sm">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-green-600">
                      {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {plan.priceMonthly === 0 ? "" : "/month"}
                    </span>
                  </div>
                  {plan.priceMonthly > 0 && (
                    <div className="text-lg text-green-600 font-medium">
                      ≈ UGX {plan.priceMonthlyUGX?.toLocaleString()}/month
                    </div>
                  )}
                </div>

                {plan.setupFee && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2 rounded-lg mb-4">
                    One-time setup: <strong>${plan.setupFee}</strong> (≈ UGX {plan.setupFeeUGX?.toLocaleString()})
                  </div>
                )}

                {plan.priceAnnually > 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-2 rounded-lg mb-4">
                    Pay yearly: <strong>${plan.priceAnnually}</strong> (≈ UGX {plan.priceAnnuallyUGX?.toLocaleString()})
                    <span className="block text-green-600 text-xs mt-1">Save 17%</span>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  }`}
                >
                  {plan.priceMonthly === 0 ? "Start Free" : "Start Free Trial"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods Banner */}
        <div className="mt-12 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              💰 Easy Payments for Ugandans
            </h2>
            <p className="text-green-100">
              We know crypto can be confusing. We make it simple!
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl mb-2">₿</div>
              <h3 className="font-bold mb-1">Bitcoin & Crypto</h3>
              <p className="text-green-100 text-sm">Pay with Bitcoin, Ethereum, USDT and 150+ cryptocurrencies</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold mb-1">Mobile Money</h3>
              <p className="text-green-100 text-sm">Convert crypto to MTN/Airtel Mobile Money instantly</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl mb-2">🏦</div>
              <h3 className="font-bold mb-1">Bank Transfer</h3>
              <p className="text-green-100 text-sm">Direct bank deposits in UGX/USD to our Stanbic or DFCC account</p>
            </div>
          </div>
          <div className="mt-6 text-center text-green-100 text-sm">
            Questions? Call/WhatsApp: <span className="font-bold text-white">+256 700 123 456</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked <span className="text-green-600">Questions</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">?</span>
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 ml-8">
                  We accept Bitcoin, Ethereum, USDT and 150+ cryptocurrencies through NOWPayments. 
                  We also accept direct bank transfers to Stanbic Bank or DFCC Bank accounts in UGX or USD.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">?</span>
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600 ml-8">
                  Absolutely! Upgrade or downgrade anytime. When you upgrade, you get immediate access 
                  to new features. Downgrades take effect at your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">?</span>
                  Do I need a credit card to start?
                </h3>
                <p className="text-gray-600 ml-8">
                  No! Our Free plan requires no payment details. For paid plans, you can pay with 
                  crypto or bank transfer - no credit card needed.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">?</span>
                  What happens when my trial ends?
                </h3>
                <p className="text-gray-600 ml-8">
                  You&apos;ll receive friendly reminders before your trial ends. You can then subscribe 
                  using your preferred payment method to continue using all features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">?</span>
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600 ml-8">
                  Yes! We offer a 30-day money-back guarantee for all paid plans. Contact our 
                  support team on WhatsApp for quick assistance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-2">?</span>
                  Do you offer training?
                </h3>
                <p className="text-gray-600 ml-8">
                  Yes! All paid plans include free training via WhatsApp or phone. Estate Manager 
                  plans include on-site training in Mbarara or Kampala.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions? We&apos;d love to help!</p>
          <div className="flex justify-center gap-4">
            <a 
              href="tel:+256700123456" 
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              📞 Call Us
            </a>
            <a 
              href="https://wa.me/256700123456" 
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
