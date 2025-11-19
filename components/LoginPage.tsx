import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, LockIcon, MailIcon, UserCircleIcon, UserIcon } from './common/Icons';

interface LoginPageProps {
  onLogin: () => void;
  onShowCustomerPortal: () => void;
  onCoachSignUpSuccess: (data: { name: string; email: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onShowCustomerPortal, onCoachSignUpSuccess }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('feetool@gmail.com');
  const [loginPassword, setLoginPassword] = useState('feetool@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');


  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'feetool@gmail.com' && loginPassword === 'feetool@123') {
      setError('');
      onLogin();
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    if (!signupName || !signupEmail || !signupPassword) {
        alert("Please fill all required fields.");
        return;
    }
    // On successful signup, pass data to parent
    onCoachSignUpSuccess({ name: signupName, email: signupEmail });
  };
  
  const LoginView = (
    <form onSubmit={handleLoginSubmit} className="space-y-6">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <MailIcon className="h-5 w-5 text-stone-400" />
        </span>
        <input
          type="email"
          placeholder="Email Address"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 transition duration-300"
          required
        />
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <LockIcon className="h-5 w-5 text-stone-400" />
        </span>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 transition duration-300"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-stone-400 hover:text-stone-600" />
          ) : (
            <EyeIcon className="h-5 w-5 text-stone-400 hover:text-stone-600" />
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <button
          type="submit"
          className="w-full bg-stone-900 text-white font-medium py-3 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
        >
          Login
        </button>
      </div>
       <p className="text-sm text-center text-stone-500">
          Don't have a coach account?{' '}
          <button type="button" onClick={() => setView('signup')} className="font-medium text-stone-900 hover:text-stone-700 underline">
              Sign Up
          </button>
      </p>
    </form>
  );

  const SignUpView = (
    <form onSubmit={handleSignUpSubmit} className="space-y-4">
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-stone-400" /></span>
          <input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500" required />
      </div>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-stone-400" /></span>
          <input type="email" placeholder="Email Address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500" required />
      </div>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-stone-400" /></span>
          <input type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500" required />
      </div>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-stone-400" /></span>
          <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500" required />
      </div>
      <div className="pt-2">
        <button
            type="submit"
            className="w-full bg-stone-900 text-white font-medium py-3 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
        >
          Create Account
        </button>
      </div>
      <p className="text-sm text-center text-stone-500">
          Already have an account?{' '}
          <button type="button" onClick={() => setView('login')} className="font-medium text-stone-900 hover:text-stone-700 underline">
              Login
          </button>
      </p>
    </form>
  );

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 bg-stone-100">
       {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-stone-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <button
        onClick={onShowCustomerPortal}
        className="absolute top-6 right-6 flex items-center space-x-2 bg-white text-stone-800 font-medium px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-50 transition-all shadow-sm hover:shadow-md z-10"
      >
        <UserCircleIcon className="h-5 w-5 text-stone-600" />
        <span>Customer Portal</span>
      </button>

      <div className="w-full max-w-md z-10">
        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12 space-y-8 border border-stone-100">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {view === 'login' ? "Designer's Hub" : "Coach Sign Up"}
            </h1>
            <p className="text-stone-500 font-light">
              {view === 'login' ? 'Curate your projects with elegance.' : 'Start your journey in professional design.'}
            </p>
          </div>

          {view === 'login' ? LoginView : SignUpView}
          
          <div className="border-t border-stone-100 pt-6">
            <p className="text-center text-xs text-stone-400">
                © {new Date().getFullYear()} Interior Creations Inc.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;