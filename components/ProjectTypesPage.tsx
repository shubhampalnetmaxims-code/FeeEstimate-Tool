import React, { useState } from 'react';
import { ProjectType } from '../types';
import { PencilIcon, PlusIcon, TrashIcon } from './common/Icons';
import ConfirmationModal from './common/ConfirmationModal';
import ProjectTypeModal from './ProjectTypeModal';

interface ProjectTypesPageProps {
    projectTypes: ProjectType[];
    setProjectTypes: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}

const ProjectTypesPage: React.FC<ProjectTypesPageProps> = ({ projectTypes, setProjectTypes }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState<{ type: string | null, payload?: any }>({ type: null });

    const handleSaveProjectType = (data: ProjectType) => {
        const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        if (projectTypes.some(pt => pt.id === data.id)) { // Editing
            setProjectTypes(prev => prev.map(pt => pt.id === data.id ? data : pt));
        } else { // Adding
            setProjectTypes(prev => [...prev, { ...data, id: newId('pt') }]);
        }
        setModal({ type: null });
    };

    const handleDeleteRequest = (projectType: ProjectType) => {
        setModal({ type: 'DELETE_ITEM', payload: projectType });
    };

    const handleConfirmDelete = () => {
        if (!modal.payload?.id) return;
        setProjectTypes(prev => prev.filter(pt => pt.id !== modal.payload.id));
        setModal({ type: null });
    };

    const filteredProjectTypes = projectTypes.filter(pt =>
        pt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {modal.type === 'ADD_ITEM' && <ProjectTypeModal onClose={() => setModal({type: null})} onSave={handleSaveProjectType} />}
            {modal.type === 'EDIT_ITEM' && <ProjectTypeModal onClose={() => setModal({type: null})} onSave={handleSaveProjectType} initialData={modal.payload} />}
            {modal.type === 'DELETE_ITEM' && (
                <ConfirmationModal
                    onClose={() => setModal({ type: null })}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete "${modal.payload.name}"? This action is permanent.`}
                />
            )}
            
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search project types..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900"
                />
                <button onClick={() => setModal({ type: 'ADD_ITEM' })} className="flex items-center space-x-2 bg-[#5F716B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#4E5C57] transition-colors">
                    <PlusIcon />
                    <span>Add Project Type</span>
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {filteredProjectTypes.length > 0 ? filteredProjectTypes.map(pt => (
                        <li key={pt.id} className="p-4 flex justify-between items-center">
                            <span className="text-gray-800 font-medium">{pt.name}</span>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setModal({ type: 'EDIT_ITEM', payload: pt })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Edit">
                                    <PencilIcon className="h-5 w-5"/>
                                </button>
                                <button onClick={() => handleDeleteRequest(pt)} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-md" title="Delete">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        </li>
                    )) : (
                        <p className="text-center text-gray-500 py-8">No project types found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ProjectTypesPage;