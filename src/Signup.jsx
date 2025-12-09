import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedPlan = searchParams.get('plan') || 'one_time';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(preSelectedPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    one_time: {
      name: 'One-Time Warmup',
      price: '$75',
      period: '/account',
      features: ['5-day warmup', 'Niche targeting', 'Progress tracking', 'Final report']
    },
    starter: {
      name: 'Starter Plan',
      price: '$299',
      period: '/month',
      features: ['5 accounts/month', 'Priority queue', 'Email support', 'Monthly reports', 'Cancel anytime']
    },
    growth: {
      name: 'Growth Plan',
      price: '$499',
      period: '/month',
      features: ['10 accounts/month', 'Priority queue', 'Weekly reports', 'Slack support', 'Rollover credits']
    }
  };

  useEffect(() => {
    setSelectedPlan(preSelectedPlan);
  }, [preSelectedPlan]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    // Use local backend for now (change to https://api.warm-up.me when deployed)
    const API_URL = 'http://localhost:5000';

    try {
      // Create account with backend
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(registerData.error || 'Failed to create account');
        setIsProcessing(false);
        return;
      }

      // Store token
      localStorage.setItem('token', registerData.token);

      // Create checkout session
      const checkoutResponse = await fetch(`${API_URL}/api/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${registerData.token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      });

      const checkoutData = await checkoutResponse.json();
      
      console.log('Checkout response:', checkoutData); // DEBUG

      if (checkoutData.url) {
        // Redirect to Stripe
        window.location.href = checkoutData.url;
      } else {
        setError(checkoutData.error || 'Failed to create checkout session');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error:', err); // DEBUG
      setError(`Error: ${err.message}`);
      setIsProcessing(false);
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/warmup-logo.png" alt="Warmup.ai" className="w-10 h-10" />
              <span className="text-2xl font-bold">
                <span className="inline-block bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">warmup.ai</span>
              </span>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition"
            >
              Back to Home
            </button>
          </div>
        </nav>

        {/* Signup Form */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4">
                Create Your Account
              </h1>
              <p className="text-gray-400 text-lg">
                Start warming up your Instagram accounts today
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Signup Form */}
              <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                <h2 className="text-2xl font-bold mb-6">Account Details</h2>
                
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand-orange transition"
                      required
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand-orange transition"
                      required
                      minLength={8}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Select Your Plan</label>
                    <div className="space-y-3">
                      {Object.entries(plans).map(([key, plan]) => (
                        <div
                          key={key}
                          onClick={() => setSelectedPlan(key)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                            selectedPlan === key
                              ? 'border-brand-orange bg-brand-orange/10'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{plan.name}</div>
                              <div className="text-sm text-gray-400">
                                {plan.price}<span className="text-xs">{plan.period}</span>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPlan === key ? 'border-brand-orange' : 'border-white/30'
                            }`}>
                              {selectedPlan === key && (
                                <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        Continue to Payment <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </div>

              {/* Selected Plan Details */}
              <div className="p-8 bg-gradient-to-br from-brand-orange/10 to-brand-pink/10 backdrop-blur-md border-2 border-brand-orange/50 rounded-xl">
                <h2 className="text-2xl font-bold mb-6">Your Selection</h2>
                
                <div className="mb-6">
                  <div className="text-sm text-brand-orange mb-2">
                    {selectedPlan === 'one_time' ? 'ONE-TIME' : selectedPlan === 'starter' ? 'STARTER' : 'GROWTH'}
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    {plans[selectedPlan].price}
                    <span className="text-lg text-gray-400">{plans[selectedPlan].period}</span>
                  </div>
                  <div className="text-gray-400">{plans[selectedPlan].name}</div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-sm font-semibold text-gray-300 mb-3">What's Included:</div>
                  {plans[selectedPlan].features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="text-green-400 flex-shrink-0" size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm text-gray-400 space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="text-brand-orange mt-0.5 flex-shrink-0" size={16} />
                      <span>Secure payment via Stripe</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="text-brand-orange mt-0.5 flex-shrink-0" size={16} />
                      <span>Cancel anytime (subscriptions)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="text-brand-orange mt-0.5 flex-shrink-0" size={16} />
                      <span>Email support included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
