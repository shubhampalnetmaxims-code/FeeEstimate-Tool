import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { XMarkIcon } from './common/Icons';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (template: Project | null, customProjectType: string | null) => void;
    templates: Project[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onComplete, templates }) => {
    const [selectedType, setSelectedType] = useState<string>('');
    const [customType, setCustomType] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Project | null>(null);

    const projectTypes = useMemo(() => {
        const types = new Set(templates.map(t => t.projectType));
        return Array.from(types);
    }, [templates]);
    
    const filteredTemplates = useMemo(() => {
        return templates.filter(t => t.projectType === selectedType);
    }, [selectedType, templates]);

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setCustomType('');
        setSelectedTemplate(null);
    };

    const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomType(e.target.value);
        setSelectedType('');
        setSelectedTemplate(null);
    };

    const handleTemplateSelect = (template: Project) => {
        setSelectedTemplate(template);
        setCustomType('');
    };

    const handleSubmit = () => {
        if (selectedTemplate) {
            onComplete(selectedTemplate, null);
        } else if (customType.trim()) {
            onComplete(null, customType.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Create a New Project</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Start from a Template</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                <select 
                                    value={selectedType} 
                                    onChange={(e) => handleTypeChange(e.target.value)} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900"
                                >
                                    <option value="" disabled>-- Select a type --</option>
                                    {projectTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Or, start with your own project type</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Office Refresh" 
                                    value={customType}
                                    onChange={handleCustomTypeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {selectedType && (
                        <div className="space-y-3">
                            <h4 className="text-md font-semibold text-gray-700">Available Templates for '{selectedType}'</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-1">
                                {filteredTemplates.length > 0 ? filteredTemplates.map(template => (
                                    <div 
                                        key={template.id} 
                                        onClick={() => handleTemplateSelect(template)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedTemplate?.id === template.id ? 'border-[#5F716B] ring-2 ring-[#5F716B] bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'}`}
                                    >
                                        <h5 className="font-bold text-gray-800">{template.name}</h5>
                                        <p className="text-sm text-gray-600 mt-1">{template.projectDescription}</p>
                                    </div>
                                )) : <p className="text-gray-500">No templates found for this type.</p>}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-50">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!selectedTemplate && !customType.trim()}
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
