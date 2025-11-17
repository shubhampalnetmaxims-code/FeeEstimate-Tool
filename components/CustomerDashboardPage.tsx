import React, { useState } from 'react';
import { CustomerData, Project } from '../types';
import CustomerSidePanel from './CustomerSidePanel';
import CustomerProfilePage from './CustomerProfilePage';
import ProjectsPage from './ProjectsPage';
import { initialSections } from '../data/initialData';
import { initialCategories } from '../data/initialData';

interface CustomerDashboardPageProps {
  onLogout: () => void;
  customer: CustomerData | null;
  projectTemplates: Project[];
}

const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({ onLogout, customer, projectTemplates }) => {
  const [activeView, setActiveView] = useState('Projects');
  const [projects, setProjects] = useState<Project[]>([]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'Projects':
        return <ProjectsPage 
                  projects={projects} 
                  setProjects={setProjects} 
                  categories={initialCategories} 
                  sections={initialSections} 
                  isCustomerView={true}
                  projectTemplates={projectTemplates}
                />;
      case 'Profile':
      default:
        return <CustomerProfilePage customer={customer} />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <CustomerSidePanel onLogout={onLogout} customer={customer} activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto h-screen">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default CustomerDashboardPage;