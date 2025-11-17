import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import CustomerPortal from './components/CustomerPortal';
import CustomerDashboardPage from './components/CustomerDashboardPage';
import CoachCompleteProfilePage from './components/CoachCompleteProfilePage';
import { CustomerData, Project } from './types';
import { initialProjects as initialProjectTemplates } from './data/initialProjects';


type CoachOnboardingStep = 'completeProfile' | null;
interface SignUpData {
    name: string;
    email: string;
}

const App: React.FC = () => {
  // Designer/Coach state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coachOnboardingStep, setCoachOnboardingStep] = useState<CoachOnboardingStep>(null);
  const [coachSignUpData, setCoachSignUpData] = useState<SignUpData | null>(null);

  // Customer state
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  // Shared state
  const [projectTemplates, setProjectTemplates] = useState<Project[]>(initialProjectTemplates);


  // Coach/Designer handlers
  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const handleCoachSignUpSuccess = useCallback((data: SignUpData) => {
    setCoachSignUpData(data);
    setCoachOnboardingStep('completeProfile');
  }, []);
  
  const handleCoachProfileComplete = useCallback(() => {
    setCoachOnboardingStep(null);
    setCoachSignUpData(null);
    setIsLoggedIn(true); // Log in the coach after profile completion
  }, []);


  // Customer handlers
  const handleCustomerLogin = useCallback((data: CustomerData) => {
    setCustomerData(data);
    setShowCustomerPortal(false);
    setIsCustomerLoggedIn(true);
  }, []);

  const handleCustomerProfileComplete = useCallback(() => {
    setShowCustomerPortal(false);
    setIsCustomerLoggedIn(true);
  }, []);

  const handleCustomerLogout = useCallback(() => {
    setIsCustomerLoggedIn(false);
    setCustomerData(null);
  }, []);


  // Render logic
  if (isLoggedIn) {
    return <DashboardPage onLogout={handleLogout} projectTemplates={projectTemplates} setProjectTemplates={setProjectTemplates} />;
  }
  if (isCustomerLoggedIn) {
    return <CustomerDashboardPage customer={customerData} onLogout={handleCustomerLogout} projectTemplates={projectTemplates} />;
  }
  if (coachOnboardingStep === 'completeProfile' && coachSignUpData) {
    return <CoachCompleteProfilePage initialData={coachSignUpData} onComplete={handleCoachProfileComplete} />;
  }

  return (
    <div className="min-h-screen">
      <LoginPage 
        onLogin={handleLogin} 
        onShowCustomerPortal={() => setShowCustomerPortal(true)} 
        onCoachSignUpSuccess={handleCoachSignUpSuccess}
      />
      {showCustomerPortal && <CustomerPortal onClose={() => setShowCustomerPortal(false)} onProfileComplete={handleCustomerProfileComplete} onLoginSuccess={handleCustomerLogin} />}
    </div>
  );
};

export default App;