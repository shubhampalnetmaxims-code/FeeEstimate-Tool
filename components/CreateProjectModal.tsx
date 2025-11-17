import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectType } from '../types';
import { XMarkIcon } from './common/Icons';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (template: Project | null, projectTypeName: string | null) => void;
    templates: Project[];
    projectTypes?: ProjectType[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onComplete, templates, projectTypes = [] }) => {
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
    const [customTypeName, setCustomTypeName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Project | 'BLANK' | null>(null);
    const [view, setView] = useState<'type' | 'template'>('type');

    // Reset state when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            setView('type');
            setSelectedTypeId(null);
            setCustomTypeName('');
            setSelectedTemplate(null);
        }
    }, [isOpen]);
    
    const handleTypeSelect = (typeId: string) => {
        setSelectedTypeId(typeId);
        setCustomTypeName('');
        setView('template');
    };

    const handleCustomTypeSubmit = () => {
        if (customTypeName.trim()) {
            setSelectedTypeId(null);
            setView('template');
        }
    };
    
    const handleBackToTypeSelection = () => {
        setView('type');
        setSelectedTemplate(null);
    }
    
    const filteredTemplates = useMemo(() => {
        if (!selectedTypeId) return [];
        const selectedTypeName = projectTypes.find(pt => pt.id === selectedTypeId)?.name;
        return templates.filter(t => t.projectType === selectedTypeName);
    }, [selectedTypeId, templates, projectTypes]);

    const handleSubmit = () => {
        const projectTypeName = customTypeName.trim() || projectTypes.find(pt => pt.id === selectedTypeId)?.name || null;

        if (selectedTemplate === 'BLANK') {
            onComplete(null, projectTypeName);
        } else if (selectedTemplate) {
            const templateCopy = JSON.parse(JSON.stringify(selectedTemplate));
            templateCopy.projectType = projectTypeName || templateCopy.projectType; // Ensure type is set
            onComplete(templateCopy, null);
        }
    };
    
    const currentProjectTypeName = customTypeName.trim() || projectTypes.find(pt => pt.id === selectedTypeId)?.name;

    const renderTypeSelection = () => (
        <>
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">1. Choose a Project Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {projectTypes.map(type => (
                        <button 
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className="text-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8E9B9A]"
                        >
                            <span className="font-bold text-gray-800">{type.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div>
                <label htmlFor="custom-type" className="block text-sm font-medium text-gray-700 mb-1">Define your own project type</label>
                <form onSubmit={(e) => { e.preventDefault(); handleCustomTypeSubmit(); }} className="flex gap-2">
                    <input 
                        id="custom-type"
                        type="text" 
                        placeholder="e.g., Office Refresh" 
                        value={customTypeName}
                        onChange={(e) => {
                            setCustomTypeName(e.target.value);
                            setSelectedTypeId(null);
                        }}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900"
                    />
                     <button type="submit" disabled={!customTypeName.trim()} className="px-4 py-2 text-white bg-[#5F716B] rounded-md hover:bg-[#4E5C57] disabled:bg-gray-400">
                        Next
                    </button>
                </form>
            </div>
        </>
    );

    const renderTemplateSelection = () => (
        <>
            <div>
                 <button onClick={handleBackToTypeSelection} className="text-sm font-medium text-[#5F716B] hover:text-[#4E5C57] mb-4">
                    &larr; Back to Project Types
                </button>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">2. Select a Starting Point for <span className="font-bold text-[#5F716B]">"{currentProjectTypeName}"</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-1">
                    <div 
                        onClick={() => setSelectedTemplate('BLANK')}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedTemplate === 'BLANK' ? 'border-[#5F716B] ring-2 ring-[#5F716B] bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                        <h5 className="font-bold text-gray-800">Start with a blank project</h5>
                        <p className="text-sm text-gray-600 mt-1">Build your project from the ground up.</p>
                    </div>
                    {filteredTemplates.map(template => (
                        <div 
                            key={template.id} 
                            onClick={() => setSelectedTemplate(template)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedTemplate !== 'BLANK' && selectedTemplate?.id === template.id ? 'border-[#5F716B] ring-2 ring-[#5F716B] bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                            <h5 className="font-bold text-gray-800">{template.name}</h5>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.projectDescription}</p>
                        </div>
                    ))}
                </div>
                 {selectedTypeId && filteredTemplates.length === 0 && <p className="text-gray-500 mt-4 text-center">No templates found for this project type. You can start with a blank project.</p>}
            </div>
        </>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Create a New Project</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {view === 'type' ? renderTypeSelection() : renderTemplateSelection()}
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-50">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={view === 'type' || !selectedTemplate}
                        className="px-6 py-2 text-white bg-[#5F716B] rounded-md hover:bg-[#4E5C57] disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                       Create Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectModal;