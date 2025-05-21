import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
        return;
      }
      
      // Redirect to chat on successful login
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex items-center justify-center -mt-20">
        <div className="container-custom">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-custom p-6">
            <div className="mb-4 text-center">
              <h2 className="text-3xl font-playfair font-semibold mb-2 text-text-primary">Welcome Back</h2>
              <p className="text-text-secondary text-lg">Log in to access your Aegis</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-text-primary mb-1 text-base font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field font-mono text-base py-2"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-text-primary text-base font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-teal-600 text-sm hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field font-mono text-base py-2"
                  placeholder="Your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full py-2 text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Logging in...
                  </span>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-text-secondary text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-teal-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;