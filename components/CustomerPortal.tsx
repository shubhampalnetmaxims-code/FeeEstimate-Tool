import React, { useState } from 'react';
import { XMarkIcon, MailIcon, LockIcon, UserIcon, EyeIcon, EyeSlashIcon } from './common/Icons';
import { CustomerData } from '../types';

interface SignUpData {
    name: string;
    email: string;
}

const specializationGroups: Record<string, string[]> = {
  "Project Type": ["Residential", "Commercial", "Hospitality"],
  "Room/Space": ["Kitchen", "Bedroom", "Living room", "Office", "Retail"],
  "Service Level": ["Renovation", "Styling", "Full-service design"],
  "Budget": ["Budget-focused design", "Luxury design"],
  "Special Focus": ["Sustainable or eco-friendly design"],
};

const FormButton: React.FC<{ children: React.ReactNode, onClick?: () => void }> = ({ children, onClick }) => (
    <button type="submit" onClick={onClick} className="w-full bg-[#5F716B] text-white font-semibold py-3 rounded-lg hover:bg-[#4E5C57] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5F716B] transition-all duration-300 ease-in-out">
        {children}
    </button>
);

const LoginView = ({ onSwitchToSignUp, onSwitchToForgot, onLoginSuccess }: { onSwitchToSignUp: () => void; onSwitchToForgot: () => void; onLoginSuccess: (data: CustomerData) => void; }) => {
    const [email, setEmail] = useState('shubham@gmail.com');
    const [password, setPassword] = useState('Shubham@123');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === 'shubham@gmail.com' && password === 'Shubham@123') {
            setError('');
            const dummyCustomerData: CustomerData = {
                name: 'Shubham Sharma',
                email: 'shubham@gmail.com',
                phone: '+91 98765 43210',
                businessName: 'Modern Aesthetics',
                location: 'Mumbai, India',
                languages: 'English, Hindi, Marathi',
                experience: 7,
                specializations: ['Residential', 'Kitchen', 'Luxury design', 'Sustainable or eco-friendly design'],
                bio: 'A passionate interior designer with over 7 years of experience in creating beautiful and functional living spaces. My design philosophy is centered around understanding the client\'s vision and bringing it to life with a touch of elegance and modernity. I specialize in luxury residential projects and bespoke kitchen remodels that are both timeless and innovative.'
            };
            onLoginSuccess(dummyCustomerData);
        } else {
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="p-8 md:p-12 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Customer Portal</h1>
                <p className="text-gray-500 mt-2">Access your project details</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                </div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div><FormButton>Login</FormButton></div>
                <div className="text-sm text-center flex justify-between">
                    <button type="button" onClick={onSwitchToForgot} className="font-medium text-[#5F716B] hover:text-[#4E5C57]">Forgot Password?</button>
                    <button type="button" onClick={onSwitchToSignUp} className="font-medium text-[#5F716B] hover:text-[#4E5C57]">Sign Up</button>
                </div>
            </form>
        </div>
    );
};

const SignUpView = ({ onSwitchToLogin, onSignUpSuccess }: { onSwitchToLogin: () => void, onSignUpSuccess: (data: SignUpData) => void; }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match.");
            return;
        }
        if (!name || !email || !password) {
            alert("Please fill all fields.");
            return;
        }
        onSignUpSuccess({ name, email });
    };

    return (
        <div className="p-8 md:p-12 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                <p className="text-gray-500 mt-2">Join our client community</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                </div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                </div>
                <div className="pt-2"><FormButton>Sign Up</FormButton></div>
                <div className="text-sm text-center">
                    <button type="button" onClick={onSwitchToLogin} className="font-medium text-[#5F716B] hover:text-[#4E5C57]">Already have an account? Login</button>
                </div>
            </form>
        </div>
    );
};

const ForgotPasswordView = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Password reset link sent! (mock)');
        onSwitchToLogin();
    };

    return (
        <div className="p-8 md:p-12 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
                <p className="text-gray-500 mt-2">We'll send you a recovery link</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="email" placeholder="Your Email Address" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]" required />
                </div>
                <div><FormButton>Send Reset Link</FormButton></div>
                <div className="text-sm text-center">
                    <button type="button" onClick={onSwitchToLogin} className="font-medium text-[#5F716B] hover:text-[#4E5C57]">Back to Login</button>
                </div>
            </form>
        </div>
    );
};

const CompleteProfileView = ({ initialData, onComplete }: { initialData: SignUpData, onComplete: () => void }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile completed! Welcome aboard.');
        onComplete();
    };
    
    return (
        <div className="p-8 md:p-12 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
                <p className="text-gray-500 mt-2">Tell us a bit more about yourself.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={initialData.name} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={initialData.email} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business/Brand Name</label>
                    <input type="text" placeholder="e.g., 'Creative Spaces Inc.'" className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country)</label>
                    <input type="text" placeholder="e.g., 'New York, USA'" className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                    <input type="text" placeholder="e.g., 'English, Spanish'" className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of professional experience</label>
                    <input type="number" min="0" placeholder="e.g., 5" className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white" required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Design Specializations</label>
                    <div className="space-y-3 p-3 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                        {Object.entries(specializationGroups).map(([groupName, options]) => (
                            <div key={groupName}>
                                <h4 className="font-semibold text-gray-600 text-xs uppercase tracking-wider">{groupName}</h4>
                                <div className="mt-2 space-y-1">
                                    {options.map(option => (
                                        <label key={option} className="flex items-center space-x-2 font-normal text-gray-800">
                                            <input type="checkbox" className="rounded text-[#5F716B] focus:ring-[#8E9B9A] border-gray-300" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Bio (50-200 words)</label>
                    <textarea rows={4} placeholder="Describe your design philosophy and unique selling points..." className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white" required />
                </div>
                <div className="pt-2">
                    <FormButton>Complete Profile & Enter Portal</FormButton>
                </div>
            </form>
        </div>
    );
};

interface CustomerPortalProps {
  onClose: () => void;
  onProfileComplete: () => void;
  onLoginSuccess: (data: CustomerData) => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onClose, onProfileComplete, onLoginSuccess }) => {
    const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'completeProfile'>('login');
    const [signUpData, setSignUpData] = useState<SignUpData | null>(null);

    const handleSignUpSuccess = (data: SignUpData) => {
        setSignUpData(data);
        setView('completeProfile');
    };

    const renderView = () => {
        switch(view) {
            case 'signup':
                return <SignUpView onSwitchToLogin={() => setView('login')} onSignUpSuccess={handleSignUpSuccess} />;
            case 'forgot':
                return <ForgotPasswordView onSwitchToLogin={() => setView('login')} />;
            case 'completeProfile':
                return <CompleteProfileView initialData={signUpData!} onComplete={onProfileComplete} />;
            case 'login':
            default:
                return <LoginView onSwitchToSignUp={() => setView('signup')} onSwitchToForgot={() => setView('forgot')} onLoginSuccess={onLoginSuccess} />;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${view === 'completeProfile' ? 'max-w-2xl' : 'max-w-md'} relative border border-gray-200 max-h-[90vh] flex flex-col`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-500 hover:bg-gray-200 rounded-full z-10">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="overflow-y-auto">
                    {renderView()}
                </div>
            </div>
        </div>
    );
}

export default CustomerPortal;