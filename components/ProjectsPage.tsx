import React, { useState } from 'react';
import { Category, Project, Section, ProjectType } from '../types';
import ProjectForm from './ProjectForm';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from './common/Icons';
import ConfirmationModal from './common/ConfirmationModal';
import ProjectView from './ProjectView';
import CreateProjectModal from './CreateProjectModal';

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
    const [view, setView] = useState<'list' | 'form' | 'view'>('list');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [viewingProject, setViewingProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const pageTitle = isCustomerView ? 'Projects' : 'Project Templates';
    const pageDescription = isCustomerView ? 'Manage all your design projects.' : 'Manage templates for new client projects.';
    const createButtonText = isCustomerView ? 'Create New Project' : 'Create New Template';
    const emptyStateText = isCustomerView ? 'No projects yet.' : 'No templates yet.';
    const createFirstText = isCustomerView ? 'Create your first project' : 'Create your first template';


    const handleCreateNew = () => {
        if (isCustomerView) {
            setIsCreateModalOpen(true);
        } else {
            setEditingProject(null);
            setView('form');
        }
    };

    const handleStartProject = (template: Project | null, customProjectType: string | null) => {
        let newProject: Project;
        if (template) {
            newProject = deepCopy(template);
            newProject.id = newId('proj');
            // Keep the name for context, but clear client-specific details
            newProject.clientAddress = '';
        } else {
            newProject = {
                id: newId('proj'),
                name: 'Untitled Project',
                clientAddress: '',
                projectType: customProjectType || 'Custom',
                projectDescription: '',
                stages: [],
            };
        }
        setEditingProject(newProject);
        setView('form');
        setIsCreateModalOpen(false);
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
                projectTypes={projectTypes}
            />
        );
    }
    
    if (view === 'view' && viewingProject) {
        return <ProjectView project={viewingProject} onBack={handleBackToList} />
    }

    return (
        <div className="space-y-6">
            {isCustomerView && (
                <CreateProjectModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)}
                    templates={projectTemplates}
                    projectTypes={projectTypes}
                    onComplete={handleStartProject}
                />
            )}

            {projectToDelete && (
                 <ConfirmationModal
                    onClose={() => setProjectToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title={`Confirm Deletion`}
                    message={`Are you sure you want to delete "${projectToDelete.name}"? This action is permanent.`}
                />
            )}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
                    <p className="text-gray-500 mt-1">{pageDescription}</p>
                </div>
                 <button onClick={handleCreateNew} className="flex items-center space-x-2 bg-[#5F716B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#4E5C57] transition-colors">
                    <PlusIcon />
                    <span>{createButtonText}</span>
                </button>
            </header>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 space-y-4">
                    {projects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">{emptyStateText}</p>
                            <button onClick={handleCreateNew} className="mt-2 font-semibold text-[#5F716B] hover:underline">
                                {createFirstText}
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {projects.map(project => (
                                <li key={project.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-800">{project.name}</p>
                                        <p className="text-sm text-gray-500">{isCustomerView ? project.clientAddress : project.projectType}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleView(project)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="View"><EyeIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleEdit(project)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Edit"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeleteRequest(project)} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-md" title="Delete"><TrashIcon className="h-5 w-5"/></button>
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