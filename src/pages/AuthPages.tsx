import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, signIn, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { watchHistorySync } from '../services/watchHistorySync';
import { startSessionRefresh, storeAuthData } from '../auth/authHelper';


type AuthMode = 'signin' | 'signup' | 'verify';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  // Reset form when changing modes
  useEffect(() => {
    setFormData({
      email: formData.email, // Preserve email across mode changes
      password: '',
      confirmPassword: '',
      verificationCode: ''
    });
    setError('');
  }, [mode]);

  const checkPasswordStrength = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    const feedback = score < 3 ? 'Password should include uppercase, lowercase, numbers, and special characters' : 
                    score < 4 ? 'Password strength: Moderate' : 
                    'Password strength: Strong';

    return { score, feedback };
  };

  const handlePasswordChange = (password: string) => {
    setPasswordStrength(checkPasswordStrength(password));
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const attemptKey = `auth_attempt_${mode}_${formData.email}`;
    const now = Date.now();
    try {
      const attempts = parseInt(localStorage.getItem(attemptKey) || '0');
      const lastAttemptTime = parseInt(localStorage.getItem(`${attemptKey}_time`) || '0');

      if (attempts >= 5 && now - lastAttemptTime < 300000) {
        throw new Error('Too many attempts. Please try again in a few minutes.');
      }

      if (mode === 'signin') {
        await signIn({
          username: formData.email.toLowerCase().trim(),
          password: formData.password,
        });

      const session = await fetchAuthSession();
      if (session?.tokens) {
        storeAuthData(session.tokens);
      }
        
        startSessionRefresh();
        
        // Load watch history after successful sign in
        try {
          const watchHistory = await watchHistorySync.loadWatchHistory();
          console.log('Watch history loaded:', watchHistory);
        } catch (error) {
          console.error('Error loading watch history:', error);
        }
        
        // Clear attempt counter on success
        localStorage.removeItem(attemptKey);
        localStorage.removeItem(`${attemptKey}_time`);
        
        navigate('/');
      } else if (mode === 'signup') {
        if (passwordStrength.score < 3) {
          throw new Error('Please choose a stronger password');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp({
          username: formData.email.toLowerCase().trim(),
          password: formData.password,
          options: {
            userAttributes: {
              email: formData.email.toLowerCase().trim()
            }
          }
        });
        setMode('verify');
      } else if (mode === 'verify') {
        await confirmSignUp({
          username: formData.email.toLowerCase().trim(),
          confirmationCode: formData.verificationCode.trim()
        });
        setMode('signin');
      }
    } catch (err) {
      // Update attempt counter
      const attempts = parseInt(localStorage.getItem(attemptKey) || '0');
      localStorage.setItem(attemptKey, (attempts + 1).toString());
      localStorage.setItem(`${attemptKey}_time`, now.toString());
      
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
            {mode === 'signin' ? 'Welcome Back' : 
             mode === 'signup' ? 'Create Account' : 
             'Verify Email'}
          </h1>
          <p className="text-gray-400 mt-2">
            {mode === 'signin' ? 'Sign in to access your account' : 
             mode === 'signup' ? 'Create a new account to get started' : 
             'Enter the verification code sent to your email'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {mode !== 'verify' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    email: e.target.value.trim() 
                  }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                  autoComplete={mode === 'signin' ? 'username' : 'new-username'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={8}
                />
                {mode === 'signup' && passwordStrength.feedback && (
                  <p className={`mt-1 text-sm ${
                    passwordStrength.score >= 4 ? 'text-green-400' : 
                    passwordStrength.score >= 3 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {passwordStrength.feedback}
                  </p>
                )}
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  confirmPassword: e.target.value 
                }))}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  verificationCode: e.target.value.trim() 
                }))}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="\d*"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
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