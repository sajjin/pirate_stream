import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';
import { cookieSync } from '../services/cookieSync';

type AuthMode = 'signin' | 'signup' | 'verify';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        // Sign in the user
        await signIn({
          username: formData.email,
          password: formData.password,
        });
        
        // Load cookies after successful sign in
        await cookieSync.loadCookies();
        
        // Start automatic cookie syncing
        cookieSync.startAutoSync(5); // Sync every 5 minutes
        
        navigate('/');
      } else if (mode === 'signup') {

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp({
          username: formData.email,
          password: formData.password,
          options: {
            userAttributes: {
              email: formData.email
            }
          }
        });
        setMode('verify');
      } else if (mode === 'verify') {
        await confirmSignUp({
          username: formData.email,
          confirmationCode: formData.verificationCode
        });
        // After verification, redirect to sign in
        setMode('signin');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-gray-400 mt-2">
            {mode === 'signin' 
              ? 'Sign in to access your account' 
              : mode === 'signup' 
              ? 'Create a new account to get started' 
              : 'Enter the verification code sent to your email'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode !== 'verify' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm py-2 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 
              mode === 'signin' ? 'Sign In' : 
              mode === 'signup' ? 'Create Account' : 
              'Verify Email'}
          </button>
        </form>

        {mode !== 'verify' && (
          <div className="mt-6 text-center text-sm">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;