import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ShoppingBag, Instagram, CheckCircle, Clock, XCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signup');
      return;
    }

    // Fetch user data
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
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
                          ${(order.amount / 100).toFixed(2)}
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
            <div className="flex items-center gap-3 mb-6">
              <Instagram className="text-brand-orange" size={24} />
              <h2 className="text-2xl font-bold">Instagram Accounts</h2>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No accounts added yet</p>
                <p className="text-sm text-gray-500 mb-6">
                  We'll email you instructions on how to submit your Instagram account details within 24 hours.
                </p>
                <div className="p-4 bg-brand-orange/10 border border-brand-orange/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    📧 Check your email at <span className="text-brand-orange font-semibold">{user?.email}</span> for next steps
                  </p>
                </div>
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
            Questions about your warmup service or need to submit Instagram account details?
          </p>
          <a 
            href="mailto:warmupai@proton.me"
            className="inline-block px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
