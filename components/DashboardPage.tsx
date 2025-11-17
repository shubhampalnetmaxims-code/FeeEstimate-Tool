import React, { useState } from 'react';
import { initialCategories, initialSections } from '../data/initialData';
import { Category, Section, Project } from '../types';
import SidePanel from './SidePanel';
import CategoryManagementPage from './CategoryManagementPage';
import SectionsPage from './SectionsPage';
import UnderConstructionPage from './UnderConstructionPage';
import ProjectsPage from './ProjectsPage';


// --- Main Dashboard Component ---
interface DashboardPageProps {
  onLogout: () => void;
  projectTemplates: Project[];
  setProjectTemplates: React.Dispatch<React.SetStateAction<Project[]>>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, projectTemplates, setProjectTemplates }) => {
  const [activeView, setActiveView] = useState('Project Templates');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sections, setSections] = useState<Section[]>(initialSections);

  const viewDescriptions: { [key: string]: string } = {
    'Dashboard': 'Welcome back, Admin!',
    'Category Mngmt': 'Organize your project structure and tasks.',
    'Sections': 'Create and manage project sections from your categories.',
    'Project Templates': 'Manage templates for new client projects.',
    'Clients': 'Manage your client information.',
    'Settings': 'Configure application settings.'
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'Category Mngmt':
        return <CategoryManagementPage categories={categories} setCategories={setCategories} />;
      case 'Sections':
        return <SectionsPage categories={categories} setCategories={setCategories} sections={sections} setSections={setSections} />;
      case 'Project Templates':
        return <ProjectsPage projects={projectTemplates} setProjects={setProjectTemplates} categories={categories} sections={sections} />;
      case 'Dashboard':
      case 'Clients':
      case 'Settings':
        return <UnderConstructionPage viewName={activeView} />;
      default:
        return <UnderConstructionPage viewName="Dashboard" />;
    }
  };

  return (
    <div className="flex bg-gray-50">
      <SidePanel onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-10 overflow-auto h-screen">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {activeView}
            </h1>
            <p className="text-gray-500 mt-1">
              {viewDescriptions[activeView]}
            </p>
          </div>
        </header>
        {renderActiveView()}
      </main>
    </div>
  );
};

export default DashboardPage;