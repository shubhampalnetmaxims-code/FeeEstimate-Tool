import React, { useState } from 'react';
import { Category, Project, Section, ProjectType } from '../types';
import ProjectForm from './ProjectForm';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from './common/Icons';
import ConfirmationModal from './common/ConfirmationModal';
import ProjectView from './ProjectView';
import ProjectCreationWizard from './CreateProjectModal';

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

interface ProjectsPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  categories: Category[];
  sections: Section[];
  isCustomerView?: boolean;
  projectTemplates?: Project[];
  projectTypes?: ProjectType[];
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, setProjects, categories, sections, isCustomerView = false, projectTemplates = [], projectTypes }) => {
    const [view, setView] = useState<'list' | 'form' | 'view' | 'wizard'>('list');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [viewingProject, setViewingProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const pageTitle = isCustomerView ? 'Projects' : 'Project Templates';
    const pageDescription = isCustomerView ? 'Manage all your design projects.' : 'Manage templates for new client projects.';
    const createButtonText = isCustomerView ? 'Create New Project' : 'Create New Template';
    const emptyStateText = isCustomerView ? 'No projects yet.' : 'No templates yet.';
    const createFirstText = isCustomerView ? 'Create your first project' : 'Create your first template';


    const handleCreateNew = () => {
        if (isCustomerView) {
            setView('wizard');
        } else {
            setEditingProject(null);
            setView('form');
        }
    };

    const handleStartProject = (project: Project) => {
        setEditingProject(project);
        setView('form');
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setView('form');
    };
    
    const handleView = (project: Project) => {
        setViewingProject(project);
        setView('view');
    };

    const handleSaveProject = (project: Project) => {
        const isEditing = projects.some(p => p.id === project.id);
        if (isEditing) {
            setProjects(prev => prev.map(p => p.id === project.id ? project : p));
        } else {
            setProjects(prev => [...prev, project]);
        }
        setView('list');
        setEditingProject(null);
        setViewingProject(null);
    };
    
    const handleBackToList = () => {
        setView('list');
        setEditingProject(null);
        setViewingProject(null);
    };

    const handleDeleteRequest = (project: Project) => {
        setProjectToDelete(project);
    };

    const handleConfirmDelete = () => {
        if (projectToDelete) {
            setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
            setProjectToDelete(null);
        }
    };
    
    if (view === 'form') {
        return (
            <ProjectForm
                initialData={editingProject}
                onSave={handleSaveProject}
                onCancel={handleBackToList}
                categories={categories}
                sections={sections}
                isCustomerView={isCustomerView}
                projectTypes={projectTypes}
            />
        );
    }
    
    if (view === 'view' && viewingProject) {
        return <ProjectView project={viewingProject} onBack={handleBackToList} />
    }

    if (isCustomerView && view === 'wizard') {
        return (
            <ProjectCreationWizard
                onCancel={handleBackToList}
                templates={projectTemplates}
                projectTypes={projectTypes}
                onComplete={handleStartProject}
                categories={categories}
                sections={sections}
            />
        );
    }


    return (
        <div className="space-y-8 animate-fadeIn">
            {projectToDelete && (
                 <ConfirmationModal
                    onClose={() => setProjectToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title={`Confirm Deletion`}
                    message={`Are you sure you want to delete "${projectToDelete.name}"? This action is permanent.`}
                />
            )}
            <div className="flex justify-between items-center">
                 <div>
                    {/* Header is handled by parent usually but good to have context */}
                 </div>
                 <button onClick={handleCreateNew} className="flex items-center space-x-2 bg-stone-900 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-stone-800 transition-all shadow-md hover:shadow-lg">
                    <PlusIcon className="h-5 w-5 text-white"/>
                    <span>{createButtonText}</span>
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-0">
                    {projects.length === 0 ? (
                        <div className="text-center py-16 bg-stone-50">
                            <p className="text-stone-500 mb-2 text-lg font-light">{emptyStateText}</p>
                            <button onClick={handleCreateNew} className="font-medium text-stone-900 hover:text-stone-700 hover:underline underline-offset-4 decoration-stone-400">
                                {createFirstText}
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {projects.map((project, index) => (
                                <li key={project.id} className={`p-6 flex justify-between items-center hover:bg-stone-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'}`}>
                                    <div className="flex-1">
                                        <p className="text-xl font-serif font-bold text-stone-900 mb-1">{project.name}</p>
                                        <span className="inline-block bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full font-medium tracking-wide uppercase border border-stone-200">
                                            {project.projectType || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleView(project)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-full border border-transparent hover:border-stone-200 transition-all shadow-sm" title="View"><EyeIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleEdit(project)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-full border border-transparent hover:border-stone-200 transition-all shadow-sm" title="Edit"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeleteRequest(project)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-white rounded-full border border-transparent hover:border-red-100 transition-all shadow-sm" title="Delete"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;