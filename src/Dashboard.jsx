import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ShoppingBag, Instagram, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const API_URL = 'https://api.warm-up.me';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signup');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = () => {
    const token = localStorage.getItem('token');
    
    Promise.all([
      fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`${API_URL}/api/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ])
    .then(([userData, ordersData, accountsData]) => {
      setUser(userData);
      setOrders(ordersData);
      setAccounts(accountsData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      localStorage.removeItem('token');
      navigate('/signup');
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const addAccount = async (accountData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });
      
      if (response.ok) {
        loadData();
        setShowAddAccount(false);
        alert('Instagram account added! We\'ll start warming it within 24 hours.');
      } else {
        const data = await response.json();
        alert(data.error || 'Error adding account');
      }
    } catch (err) {
      console.error('Error adding account:', err);
      alert('Error adding account');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-400',
      'paid': 'text-green-400',
      'warming': 'text-blue-400',
      'completed': 'text-green-400',
      'failed': 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock size={16} />,
      'paid': <CheckCircle size={16} />,
      'warming': <Clock size={16} />,
      'completed': <CheckCircle size={16} />,
      'failed': <XCircle size={16} />
    };
    return icons[status] || <Clock size={16} />;
  };

  const hasPaidOrder = orders.some(o => o.status === 'paid');

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 pointer-events-none"></div>
      
      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/warmup-logo.png" alt="Warmup.ai" className="w-10 h-10" />
            <span className="text-2xl font-bold">
              <span className="inline-block bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">warmup.ai</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <User size={20} />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-12">Manage your warmup accounts and orders</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Plan */}
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="text-brand-orange" size={24} />
              <h2 className="text-2xl font-bold">Your Plan</h2>
            </div>

            {orders.length === 0 ? (
              <p className="text-gray-400">No plan selected yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold capitalize">{order.plan.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-400">
                          ${order.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm capitalize">{order.status}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instagram Accounts */}
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Instagram className="text-brand-orange" size={24} />
                <h2 className="text-2xl font-bold">Instagram Accounts</h2>
              </div>
              {hasPaidOrder && (
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition text-sm"
                >
                  <Plus size={16} />
                  Add Account
                </button>
              )}
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-8">
                {hasPaidOrder ? (
                  <>
                    <p className="text-gray-400 mb-4">No accounts added yet</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Click "Add Account" above to submit your Instagram account for warming
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 mb-4">No accounts added yet</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Purchase a plan to start warming your Instagram accounts
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
                    >
                      View Plans
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map(account => (
                  <div key={account.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">@{account.username}</div>
                        <div className="text-sm text-gray-400 capitalize">{account.niche}</div>
                      </div>
                      <div className={`flex items-center gap-2 ${getStatusColor(account.status)}`}>
                        {getStatusIcon(account.status)}
                        <span className="text-sm capitalize">{account.status}</span>
                      </div>
                    </div>
                    {account.current_day && (
                      <div className="text-xs text-gray-500">
                        Day {account.current_day} • {account.progress_percentage}% complete
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-gradient-to-br from-brand-orange/10 to-brand-pink/10 border-2 border-brand-orange/30 rounded-xl">
          <h3 className="text-xl font-bold mb-3">Need Help?</h3>
          <p className="text-gray-300 mb-4">
            Questions about your warmup service or need assistance?
          </p>
          <a 
            href="mailto:warmupai@proton.me"
            className="inline-block px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <AddAccountModal
          onClose={() => setShowAddAccount(false)}
          onSubmit={addAccount}
        />
      )}
    </div>
  );
};

// Add Account Modal Component
const AddAccountModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    niche: ''
  });

  const niches = [
    'Fitness & Health',
    'Tech & Gadgets',
    'Crypto & Finance',
    'Fashion & Beauty',
    'Food & Cooking',
    'Travel & Adventure',
    'Business & Entrepreneurship',
    'Gaming & Esports',
    'Art & Design',
    'Music & Entertainment',
    'Education & Learning',
    'Lifestyle & Wellness',
    'Sports & Athletics',
    'Photography',
    'Adult Content',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.niche) {
      alert('Please fill in all fields');
      return;
    }
    
    // Remove @ symbol if user included it
    const cleanUsername = formData.username.replace('@', '');
    onSubmit({ ...formData, username: cleanUsername });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Add Instagram Account</h2>
        <p className="text-sm text-gray-400 mb-6">We'll start warming your account within 24 hours</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Instagram Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand-orange transition"
                placeholder="your_username"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Don't include the @ symbol</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Niche / Category</label>
            <select
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand-orange transition"
            >
              <option value="">Select your niche...</option>
              {niches.map(niche => (
                <option key={niche} value={niche.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}>
                  {niche}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the category that best matches your content</p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
            >
              Add Account
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-gray-300">
            💡 <strong>Tip:</strong> Make sure your account is set to public before warming begins for best results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
