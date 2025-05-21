import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message || 'Failed to sign up');
        return;
      }
      
      // Redirect to chat on successful signup
      navigate('/chat');
    } catch (err) {
      console.error('Registration error:', err);
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
              <h2 className="text-3xl font-playfair font-semibold mb-2 text-text-primary">Create Your Account</h2>
              <p className="text-text-secondary text-lg">Start your legal journey with Aegis</p>
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
                <label htmlFor="password" className="block text-text-primary mb-1 text-base font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field font-mono text-base py-2"
                  placeholder="Create a password"
                  required
                />
                <p className="mt-1 text-text-tertiary text-xs">
                  Must be at least 8 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-text-primary mb-1 text-base font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field font-mono text-base py-2"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-2"
                    required
                  />
                  <span className="text-sm text-text-secondary">
                    I agree to the{' '}
                    <Link to="/terms" className="text-teal-600 hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-teal-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full py-2 text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-text-secondary text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;