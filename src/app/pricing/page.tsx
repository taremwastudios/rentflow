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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      {/* Navigation - Simplified for clean look */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">Rent<span className="text-emerald-600">Flow</span></span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <Link href="/properties" className="hover:text-emerald-600 transition-colors">Properties</Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign In</Link>
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-200 active:scale-95"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-100 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-emerald-700 text-xs font-bold tracking-wider uppercase mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Scale your rental empire</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Plans for every <span className="text-emerald-600">landlord.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Simple, transparent pricing tailored for the Ugandan market. 
            From single units in Mbarara to massive estates in Kampala.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`relative flex flex-col bg-white rounded-[2rem] transition-all duration-500 hover:-translate-y-2 group ${
                plan.highlighted
                  ? "ring-1 ring-emerald-500 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] bg-gradient-to-b from-emerald-50/30 to-white"
                  : "border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                  {plan.badge}
                </div>
              )}

              <div className="p-8 pt-10">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 h-10 overflow-hidden">
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
                    </span>
                    <span className="text-slate-400 text-sm font-medium ml-1">
                      {plan.priceMonthly === 0 ? "" : "/mo"}
                    </span>
                  </div>
                  {plan.priceMonthly > 0 && (
                    <div className="text-sm font-semibold text-emerald-600 mt-1">
                      ≈ {plan.priceMonthlyUGX?.toLocaleString()} UGX
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex-grow">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Includes:</p>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-slate-600 group/item">
                        <div className="mr-3 mt-1 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-emerald-100 transition-colors">
                          <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/register?plan=${plan.slug}`}
                  className={`block w-full text-center py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                    plan.highlighted
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
                      : "bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 hover:border-emerald-100"
                  }`}
                >
                  {plan.priceMonthly === 0 ? "Get Started" : "Choose Plan"}
                </Link>
                
                {plan.setupFee && (
                  <p className="mt-4 text-[10px] text-center text-slate-400 font-medium">
                    + One-time setup fee: ${plan.setupFee}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Niche Stats/Trust section */}
        <div className="mt-32 grid md:grid-cols-4 gap-8 border-y border-slate-100 py-12">
          {[
            { label: "Active Units", value: "2,500+" },
            { label: "Mbarara Landlords", value: "120+" },
            { label: "Payments Processed", value: "UGX 4.2B" },
            { label: "Support Rating", value: "4.9/5" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Payment Methods - Cleaned up */}
        <div className="mt-32 relative group">
          <div className="absolute inset-0 bg-emerald-600 rounded-[3rem] -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
          <div className="relative bg-slate-900 text-white rounded-[3rem] p-12 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Local & Global <span className="text-emerald-400">Payment Methods</span></h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  We bridge the gap between digital currency and local banking. Pay with ease using the methods that work best for you in Uganda.
                </p>
                <div className="flex flex-wrap gap-4">
                  {["Bitcoin", "USDT", "Mobile Money", "Bank Transfer"].map((tag) => (
                    <span key={tag} className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-emerald-400 text-xl font-bold">₿</span>
                  </div>
                  <h3 className="font-bold mb-2">NOWPayments</h3>
                  <p className="text-slate-400 text-sm">Automated crypto payments via the industry leader.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-emerald-400 text-xl font-bold">📲</span>
                  </div>
                  <h3 className="font-bold mb-2">MoMo Bridge</h3>
                  <p className="text-slate-400 text-sm">Convert your crypto to MTN/Airtel cashout instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Ready to simplify your rent flow?</h2>
          <Link 
            href="/register" 
            className="inline-flex items-center space-x-3 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-700 transition-all hover:shadow-2xl hover:shadow-emerald-200 active:scale-95"
          >
            <span>Create Your Free Account</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="mt-6 text-slate-400 text-sm font-medium">Join 500+ landlords managing 2,500+ units today.</p>
        </div>
      </section>
    </div>
  );
}
