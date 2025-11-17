import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  return (
    <div className="min-h-screen">
      {isLoggedIn ? <DashboardPage onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  );
};

export default App;
