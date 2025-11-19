import React, { useState } from 'react';
import { initialCategories, initialSections } from '../data/initialData';
import { Category, Section, Project, ProjectType } from '../types';
import SidePanel from './SidePanel';
import CategoryManagementPage from './CategoryManagementPage';
import SectionsPage from './SectionsPage';
import UnderConstructionPage from './UnderConstructionPage';
import ProjectsPage from './ProjectsPage';
import ProjectTypesPage from './ProjectTypesPage';


// --- Main Dashboard Component ---
interface DashboardPageProps {
  onLogout: () => void;
  projectTemplates: Project[];
  setProjectTemplates: React.Dispatch<React.SetStateAction<Project[]>>;
  projectTypes: ProjectType[];
  setProjectTypes: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, projectTemplates, setProjectTemplates, projectTypes, setProjectTypes }) => {
  const [activeView, setActiveView] = useState('Project Templates');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sections, setSections] = useState<Section[]>(initialSections);

  const viewDescriptions: { [key: string]: string } = {
    'Dashboard': 'Welcome back, Admin!',
    'Category Mngmt': 'Organize your project structure and tasks.',
    'Sections': 'Create and manage project sections from your categories.',
    'Project Types': 'Define the types of projects you offer.',
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
      case 'Project Types':
        return <ProjectTypesPage projectTypes={projectTypes} setProjectTypes={setProjectTypes} />;
      case 'Project Templates':
        return <ProjectsPage projects={projectTemplates} setProjects={setProjectTemplates} categories={categories} sections={sections} projectTypes={projectTypes} />;
      case 'Dashboard':
      case 'Clients':
      case 'Settings':
        return <UnderConstructionPage viewName={activeView} />;
      default:
        return <UnderConstructionPage viewName="Dashboard" />;
    }
  };

  return (
    <div className="flex bg-stone-50 min-h-screen font-sans text-stone-800">
      <SidePanel onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-10 overflow-auto h-screen">
        <header className="mb-10 flex justify-between items-center border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {activeView}
            </h1>
            <p className="text-stone-500 mt-2 font-light text-lg">
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