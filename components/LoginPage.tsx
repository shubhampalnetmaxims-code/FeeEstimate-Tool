import React, { useState } from 'react';
// FIX: Import icons from shared component.
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
          <MailIcon className="h-5 w-5 text-gray-400" />
        </span>
        <input
          type="email"
          placeholder="Email Address"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] focus:border-transparent transition duration-300"
          required
        />
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <LockIcon className="h-5 w-5 text-gray-400" />
        </span>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] focus:border-transparent transition duration-300"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <button
          type="submit"
          className="w-full bg-[#5F716B] text-white font-semibold py-3 rounded-lg hover:bg-[#4E5C57] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F716B] transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Login
        </button>
      </div>
       <p className="text-sm text-center">
          Don't have a coach account?{' '}
          <button type="button" onClick={() => setView('signup')} className="font-medium text-[#5F716B] hover:text-[#4E5C57] underline">
              Sign Up
          </button>
      </p>
    </form>
  );

  const SignUpView = (
    <form onSubmit={handleSignUpSubmit} className="space-y-4">
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
      </div>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="email" placeholder="Email Address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
      </div>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
      </div>
      <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
          <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
      </div>
      <div className="pt-2">
        <button
            type="submit"
            className="w-full bg-[#5F716B] text-white font-semibold py-3 rounded-lg hover:bg-[#4E5C57] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F716B] transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Create Account
        </button>
      </div>
      <p className="text-sm text-center">
          Already have an account?{' '}
          <button type="button" onClick={() => setView('login')} className="font-medium text-[#5F716B] hover:text-[#4E5C57] underline">
              Login
          </button>
      </p>
    </form>
  );

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4">
      <button
        onClick={onShowCustomerPortal}
        className="absolute top-4 right-4 flex items-center space-x-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm z-10"
      >
        <UserCircleIcon className="h-5 w-5" />
        <span>Customer Portal</span>
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 space-y-6 border border-gray-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {view === 'login' ? "Designer's Hub" : "Coach Sign Up"}
            </h1>
            <p className="text-gray-500 mt-2">
              {view === 'login' ? 'Welcome back to your creative space' : 'Create your professional account'}
            </p>
          </div>

          {view === 'login' ? LoginView : SignUpView}
          
          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} Interior Creations Inc. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
