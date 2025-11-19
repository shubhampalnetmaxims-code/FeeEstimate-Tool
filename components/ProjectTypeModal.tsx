import React, { useState } from 'react';
import { ProjectType } from '../types';
import { XMarkIcon } from './common/Icons';

interface ProjectTypeModalProps {
    onClose: () => void;
    onSave: (data: ProjectType) => void;
    initialData?: ProjectType;
}

const ProjectTypeModal: React.FC<ProjectTypeModalProps> = ({ onClose, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const isEditing = !!initialData;

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('Project Type name is required.');
            return;
        }
        onSave({ id: initialData?.id || '', name: name.trim() });
    };

    return (
        <div className="fixed inset-0 left-64 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-black">
                <div className="flex justify-between items-center p-4 border-b border-black">
                    <h2 className="text-xl font-bold text-black">{isEditing ? 'Edit Project Type' : 'Create New Project Type'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="project-type-name" className="block text-sm font-medium text-gray-700 mb-1">Project Type Name *</label>
                        <input
                            id="project-type-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-black bg-white border border-black rounded-md mr-2 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800">Save</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectTypeModal;