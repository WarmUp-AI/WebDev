import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from token
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://api.warm-up.me/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.email) {
          setUserEmail(data.email);
        }
      })
      .catch(err => console.error('Error fetching user:', err));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Payment Successful! 🎉</h1>
        <p className="text-gray-300 mb-8">
          Thank you for your purchase! Check your email {userEmail && `(${userEmail})`} for next steps.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          We'll send you instructions on how to submit your Instagram account details within 24 hours.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-500 mb-8">
            Order ID: {sessionId.substring(0, 20)}...
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <a 
            href="/dashboard"
            className="inline-block px-8 py-3 bg-brand-gradient rounded-lg font-semibold hover:shadow-glow transition"
          >
            Go to Dashboard
          </a>
          <a 
            href="/"
            className="inline-block px-8 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Success;
