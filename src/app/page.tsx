import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">BP</span>
            </div>
            <span className="font-bold text-xl text-gray-900">BizPilot AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </nav>
          <Link 
            href="/dashboard"
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your back-office, now in WhatsApp.
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Quotes, invoices, expenses, and tax summaries for small businesses. No software to learn. Just chat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
                  Join the Waitlist
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </span>
                  Watch how it works
                </button>
              </div>
            </div>
            
            {/* Split Screen Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  {/* WhatsApp Side */}
                  <div className="bg-[#dcf8c6] p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">You</p>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl rounded-tl-none p-4 shadow-sm">
                      <p className="text-gray-800 text-sm">Quote Alice for 3 windows</p>
                    </div>
                  </div>
                  {/* Dashboard Side */}
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700">
                    <p className="text-white/80 text-xs mb-2">New Quote Created</p>
                    <p className="text-white font-semibold text-lg">Alice — 3 Windows</p>
                    <p className="text-blue-200 text-sm">$1,200.00 • Sent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-xl text-gray-600">Powerful features that actually make sense for small business</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chat-First Invoicing</h3>
              <p className="text-gray-600 leading-relaxed">
                Send professional quotes and invoices directly through WhatsApp. No more sitting at a desk after hours.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Snap & Log Expenses</h3>
              <p className="text-gray-600 leading-relaxed">
                Take a photo of any receipt. Our AI extracts the details and categorizes it for tax season.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">The 'No-Accountant' Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                See your revenue, pending payments, and estimated tax in a simple view that requires zero training.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proactive Follow-ups</h3>
              <p className="text-gray-600 leading-relaxed">
                BizPilot reminds you to follow up on unpaid quotes so you never miss a sale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Up and running in under 5 minutes</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600">Link your WhatsApp number to BizPilot AI.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chat</h3>
              <p className="text-gray-600">Tell BizPilot what you need—quotes, invoices, or stock checks.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grow</h3>
              <p className="text-gray-600">Focus on your craft while BizPilot runs the back-office.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by small business owners</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <p className="text-white text-lg mb-4 leading-relaxed">
                "BizPilot saves me 5 hours of paperwork every week."
              </p>
              <p className="text-blue-200 font-medium">— Mike, Plumber</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <p className="text-white text-lg mb-4 leading-relaxed">
                "I finally know exactly how much tax I owe without calling my accountant."
              </p>
              <p className="text-blue-200 font-medium">— Sarah, Shop Owner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, honest pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees. No surprises.</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-center text-white shadow-2xl">
            <div className="inline-block px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-semibold rounded-full mb-6">
              Limited Beta Offer
            </div>
            <h3 className="text-3xl font-bold mb-2">Free 30-Day Beta</h3>
            <p className="text-blue-200 mb-8">No credit card required</p>
            
            <div className="border-t border-white/20 pt-8 mb-8">
              <p className="text-white/80 mb-2">After Beta ends:</p>
              <p className="text-5xl font-bold mb-2">$19<span className="text-xl font-normal">/month</span></p>
              <p className="text-blue-200">Simple flat pricing. Cancel anytime.</p>
            </div>
            
            <button className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Secure your spot in the Beta
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to simplify your back-office?</h2>
          <p className="text-gray-400 mb-8">Join thousands of small business owners who've already made the switch.</p>
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BP</span>
                </div>
                <span className="font-bold text-white">BizPilot AI</span>
              </div>
              <p className="text-gray-500 text-sm">Your AI-powered back-office assistant.</p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 BizPilot AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
