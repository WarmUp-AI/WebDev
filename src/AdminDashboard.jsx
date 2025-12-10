import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, ShoppingBag, Instagram, Plus, Edit, Trash2, Search, Key, UserPlus, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const API_URL = 'https://api.warm-up.me';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (!data.is_admin) {
        navigate('/');
        return;
      }
      loadData();
    })
    .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const loadData = () => {
    const token = localStorage.getItem('token');
    
    Promise.all([
      fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ])
    .then(([usersData, ordersData, accountsData]) => {
      setUsers(usersData);
      setOrders(ordersData);
      setAccounts(accountsData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading data:', err);
      setLoading(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
      setEditingOrder(null);
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const updateAccountStatus = async (accountId, updates) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/admin/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      loadData();
      setEditingAccount(null);
    } catch (err) {
      console.error('Error updating account:', err);
    }
  };

  const addAccount = async (accountData) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/admin/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });
      loadData();
      setShowAddAccount(false);
    } catch (err) {
      console.error('Error adding account:', err);
    }
  };

  const deleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/admin/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure? This will delete the user and all their orders/accounts.')) return;
    
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting user');
    }
  };

  const createManualOrder = async (orderData) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/admin/orders/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      loadData();
      setShowCreateOrder(false);
      alert('Order created successfully!');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Error creating order');
    }
  };

  const changePassword = async (newPassword) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
      });
      if (response.ok) {
        alert('Password changed successfully!');
        setShowChangePassword(false);
      } else {
        alert('Error changing password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Error changing password');
    }
  };

  const createAdmin = async (adminData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/admin/users/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });
      if (response.ok) {
        alert('Admin created successfully!');
        loadData();
        setShowCreateAdmin(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Error creating admin');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      alert('Error creating admin');
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
    return <span className="w-2 h-2 rounded-full bg-current inline-block mr-2"></span>;
  };

  const filteredOrders = orders.filter(order =>
    order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAccounts = accounts.filter(account =>
    account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-orange-900/20 pointer-events-none"></div>
      
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Users className="text-red-500" size={24} />
            </div>
            <div>
              <span className="text-2xl font-bold text-red-500">Admin Panel</span>
              <div className="text-xs text-gray-400">warmup.ai</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition text-sm"
            >
              <Key size={16} />
              Change Password
            </button>
            <button
              onClick={() => setShowCreateAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition text-sm"
            >
              <UserPlus size={16} />
              New Admin
            </button>
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold">Total Users</h3>
            </div>
            <div className="text-3xl font-bold">{users.length}</div>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="text-green-400" size={24} />
              <h3 className="text-lg font-semibold">Total Orders</h3>
            </div>
            <div className="text-3xl font-bold">{orders.length}</div>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Instagram className="text-pink-400" size={24} />
              <h3 className="text-lg font-semibold">Active Accounts</h3>
            </div>
            <div className="text-3xl font-bold">{accounts.filter(a => a.status === 'warming').length}</div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'orders'
                ? 'border-b-2 border-brand-orange text-brand-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'accounts'
                ? 'border-b-2 border-brand-orange text-brand-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            IG Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'users'
                ? 'border-b-2 border-brand-orange text-brand-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {activeTab !== 'users' && (
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'orders' ? 'Search orders...' : 'Search accounts...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-orange focus:outline-none transition"
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <button
              onClick={() => setShowCreateOrder(true)}
              className="mb-6 px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition flex items-center gap-2"
            >
              <DollarSign size={20} />
              Create Manual Order (Crypto)
            </button>

            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-lg font-semibold">{order.user_email}</div>
                      <div className="text-sm text-gray-400 capitalize">{order.plan.replace('_', ' ')} - ${order.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {editingOrder === order.id ? (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="warming">Warming</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      ) : (
                        <>
                          <span className={`px-3 py-1 bg-white/10 rounded text-sm capitalize flex items-center ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                          <button
                            onClick={() => setEditingOrder(order.id)}
                            className="p-2 hover:bg-white/10 rounded transition"
                          >
                            <Edit size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'accounts' && (
          <>
            <button
              onClick={() => setShowAddAccount(true)}
              className="mb-6 px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add Instagram Account
            </button>

            <div className="space-y-4">
              {filteredAccounts.map(account => (
                <div key={account.id} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-lg font-semibold">@{account.username}</div>
                      <div className="text-sm text-gray-400">{account.user_email}</div>
                      <div className="text-sm text-gray-500 mt-1 capitalize">Niche: {account.niche}</div>
                      {account.current_day && (
                        <div className="text-xs text-gray-500 mt-1">Day {account.current_day}/5</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {editingAccount === account.id ? (
                        <div className="space-y-2">
                          <select
                            value={account.status}
                            onChange={(e) => updateAccountStatus(account.id, { status: e.target.value })}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm w-full"
                          >
                            <option value="pending">Pending</option>
                            <option value="warming">Warming</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                          </select>
                          <button
                            onClick={() => setEditingAccount(null)}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`px-3 py-1 bg-white/10 rounded text-sm capitalize flex items-center ${getStatusColor(account.status)}`}>
                            {getStatusIcon(account.status)}
                            {account.status}
                          </span>
                          <button
                            onClick={() => setEditingAccount(account.id)}
                            className="p-2 hover:bg-white/10 rounded transition"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteAccount(account.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{user.email}</div>
                    <div className="text-sm text-gray-400">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user.is_admin ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-semibold">ADMIN</span>
                    ) : (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddAccount && (
          <AddAccountModal
            onClose={() => setShowAddAccount(false)}
            onSubmit={addAccount}
            users={users}
          />
        )}

        {showCreateOrder && (
          <CreateOrderModal
            onClose={() => setShowCreateOrder(false)}
            onSubmit={createManualOrder}
            users={users}
          />
        )}

        {showChangePassword && (
          <ChangePasswordModal
            onClose={() => setShowChangePassword(false)}
            onSubmit={changePassword}
          />
        )}

        {showCreateAdmin && (
          <CreateAdminModal
            onClose={() => setShowCreateAdmin(false)}
            onSubmit={createAdmin}
          />
        )}
      </div>
    </div>
  );
};

// Modal Components
const AddAccountModal = ({ onClose, onSubmit, users }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    niche: '',
    status: 'pending'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Add Instagram Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
            >
              <option value="">Choose user...</option>
              {users.filter(u => !u.is_admin).map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instagram Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Niche</label>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="e.g., fitness, tech, crypto"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
            >
              Add Account
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateOrderModal = ({ onClose, onSubmit, users }) => {
  const [createNewUser, setCreateNewUser] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
    password: '',
    plan: 'one_time',
    payment_method: 'crypto'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (createNewUser && (!formData.email || !formData.password)) {
      alert('Email and password required for new user');
      return;
    }
    if (!createNewUser && !formData.user_id) {
      alert('Please select a user');
      return;
    }
    onSubmit({ ...formData, create_new_user: createNewUser });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Create Manual Order</h2>
        <p className="text-sm text-gray-400 mb-6">For crypto or offline payments</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <input
              type="checkbox"
              id="createNewUser"
              checked={createNewUser}
              onChange={(e) => setCreateNewUser(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="createNewUser" className="text-sm font-medium cursor-pointer">
              Create new user account
            </label>
          </div>

          {createNewUser ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
                  placeholder="Min 8 characters"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Select Existing User</label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required={!createNewUser}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              >
                <option value="">Choose user...</option>
                {users.filter(u => !u.is_admin).map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
            >
              <option value="one_time">One-Time ($75)</option>
              <option value="starter">Starter ($299/mo)</option>
              <option value="growth">Growth ($499/mo)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
            >
              <option value="crypto">Crypto</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
            >
              {createNewUser ? 'Create User & Order' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Change Admin Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="Re-enter password"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateAdminModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onSubmit({ email: formData.email, password: formData.password });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Create New Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              placeholder="Re-enter password"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
            >
              Create Admin
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
