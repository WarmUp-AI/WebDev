import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Flame, Target, TrendingUp, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'success' or 'error'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleCheckout = (plan) => {
    navigate(`/signup?plan=${plan}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    
    try {
      // Replace YOUR_FORM_ID with your actual Formspree form ID
      const response = await fetch('https://formspree.io/f/xeobzvod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          _subject: 'New Warmup.ai Waitlist Signup!',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus(''), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-orange/20 via-brand-pink/10 to-transparent blur-3xl pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
      
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/warmup-logo.png" alt="Warmup.ai" className="w-10 h-10" />
            <span className="text-2xl font-bold">
              <span className="inline-block bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">warmup.ai</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#how-it-works" className="hover:text-brand-orange transition">How It Works</a>
            <a href="#pricing" className="hover:text-brand-orange transition">Pricing</a>
            <button 
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
              className="hover:text-brand-orange transition"
            >
              {isLoggedIn ? 'Dashboard' : 'Login'}
            </button>
          </div>
          <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-2 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm">
            🚀 Launching December 1st, 2025
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Professional Instagram
            <br />
            <span className="inline-block bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
              Account Warming
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get your Instagram accounts algorithm-ready in 5 days.
            Safe, automated, and proven to work.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mb-12">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg focus:outline-none focus:border-brand-orange transition"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining...' : (
                  <>
                    Join Waitlist <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
            
            {submitStatus === 'success' && (
              <div className="text-green-400 text-sm text-center">
                🎉 Success! Check your email for confirmation.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="text-red-400 text-sm text-center">
                ❌ Oops! Something went wrong. Please try again.
              </div>
            )}
          </form>

          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="text-green-400" size={16} />
              5-Day Warmup
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-400" size={16} />
              From $75/account
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-400" size={16} />
              Niche Targeting
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-white mb-2" style={{
              textShadow: '0 0 30px rgba(255, 107, 53, 0.5), 0 0 60px rgba(255, 20, 147, 0.3)'
            }}>
              5 Days
            </div>
            <div className="text-gray-400">Proven Warmup Method</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2" style={{
              textShadow: '0 0 30px rgba(255, 107, 53, 0.5), 0 0 60px rgba(255, 20, 147, 0.3)'
            }}>
              100%
            </div>
            <div className="text-gray-400">Safe & Automated</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2" style={{
              textShadow: '0 0 30px rgba(255, 107, 53, 0.5), 0 0 60px rgba(255, 20, 147, 0.3)'
            }}>
              $75
            </div>
            <div className="text-gray-400">Starting Price</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Our proven 5-day methodology trains Instagram's algorithm to show your content to the right audience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Target, title: 'Choose Plan', desc: 'Select one-time or monthly subscription' },
              { icon: Zap, title: 'Provide Details', desc: 'Username, niche, and target audience' },
              { icon: Flame, title: 'We Warm Up', desc: '5-day automated algorithm training' },
              { icon: TrendingUp, title: 'Get Results', desc: 'Ready-to-post account with trained algorithm' },
            ].map((step, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:border-brand-orange/50 transition group"
              >
                <div className="w-12 h-12 bg-brand-gradient rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-center mb-16">
            No hidden fees. Cancel anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* One-Time */}
            <div className="p-8 bg-gradient-to-br from-brand-orange/10 to-brand-pink/10 backdrop-blur-md border-2 border-brand-orange/50 rounded-xl hover:border-brand-orange transition">
              <div className="text-sm text-brand-orange mb-2">ONE-TIME</div>
              <div className="text-4xl font-bold mb-4">
                $75
                <span className="text-lg text-gray-400">/account</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5-day warmup', 'Niche targeting', 'Progress tracking', 'Final report'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="text-green-400" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleCheckout('one_time')}
                className="w-full py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
              >
                Get Started
              </button>
            </div>

            {/* Starter */}
            <div className="p-8 bg-gradient-to-br from-brand-orange/10 to-brand-pink/10 backdrop-blur-md border-2 border-brand-orange/50 rounded-xl hover:border-brand-orange transition">
              <div className="text-sm text-brand-orange mb-2">STARTER</div>
              <div className="text-4xl font-bold mb-4">
                $299
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 accounts/month', 'Priority queue', 'Email support', 'Monthly reports', 'Cancel anytime'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="text-green-400" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleCheckout('starter')}
                className="w-full py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
              >
                Get Started
              </button>
            </div>

            {/* Growth - Popular */}
            <div className="p-8 bg-gradient-to-br from-brand-orange/10 to-brand-pink/10 backdrop-blur-md border-2 border-brand-orange rounded-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-brand-gradient rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
              <div className="text-sm text-brand-orange mb-2">GROWTH</div>
              <div className="text-4xl font-bold mb-4">
                $499
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['10 accounts/month', 'Priority queue', 'Weekly reports', 'Slack support', 'Rollover credits'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="text-green-400" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleCheckout('growth')}
                className="w-full py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
              >
                Get Started
              </button>
            </div>


          </div>
          
          {/* Disclaimer */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
              <p className="text-sm text-gray-400 text-center leading-relaxed">
                <span className="text-brand-orange font-semibold">Important Notice:</span> While our service professionally warms up Instagram accounts following proven methodologies, we cannot guarantee specific reach or engagement outcomes. Instagram's algorithm behavior varies significantly between accounts, and a percentage of accounts may experience limited reach regardless of warming efforts. This is determined by Instagram's systems and is beyond our control. By using our service, you acknowledge that account performance depends on multiple factors including Instagram's platform changes, content quality, and algorithmic distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to warm up your accounts?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the waitlist for early access and launch day discounts
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-brand-gradient rounded-lg font-semibold text-lg hover:shadow-glow transition"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/warmup-logo.png" alt="Warmup.ai" className="w-8 h-8" />
            <span className="font-semibold">warmup.ai</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 Warmup.ai. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default LandingPage;
