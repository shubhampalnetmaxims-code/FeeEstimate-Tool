import React, { useState } from 'react';
import { Category, Section } from '../types';
import AddSectionModal from './AddSectionModal';
import EditSectionModal from './EditSectionModal';
import ConfirmationModal from './common/ConfirmationModal';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon } from './common/Icons';
import SectionView from './SectionView';


interface SectionsPageProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    sections: Section[];
    setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

const SectionsPage: React.FC<SectionsPageProps> = ({ categories, setCategories, sections, setSections }) => {
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
    const [modal, setModal] = useState<{ type: string | null, payload?: any }>({ type: null });

    const handleSaveSection = (newSection: Section) => {
        setSections(prev => [...prev, newSection]);
        setModal({ type: null });
    };

    const handleUpdateSection = (updatedSection: Section) => {
        setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
        setModal({ type: null });
    };
    
    const handleDeleteRequest = (section: Section) => {
        setModal({ type: 'DELETE_SECTION', payload: section });
    };

    const handleConfirmDelete = () => {
        if (!modal.payload?.id) return;
        setSections(prev => prev.filter(s => s.id !== modal.payload.id));
        setModal({ type: null });
    };
    
    const handleToggleExpand = (sectionId: string) => {
        setExpandedSectionId(prevId => (prevId === sectionId ? null : sectionId));
    };

    return (
        <div className="space-y-6">
            {modal.type === 'ADD_SECTION' && <AddSectionModal onClose={() => setModal({ type: null })} onSave={handleSaveSection} categories={categories} onUpdateCategories={setCategories}/>}
            {modal.type === 'EDIT_SECTION' && <EditSectionModal onClose={() => setModal({ type: null })} onSave={handleUpdateSection} categories={categories} onUpdateCategories={setCategories} initialData={modal.payload} />}
            {modal.type === 'DELETE_SECTION' && (
                <ConfirmationModal
                    onClose={() => setModal({ type: null })}
                    onConfirm={handleConfirmDelete}
                    title="Delete Section"
                    message={`Are you sure you want to delete the section "${modal.payload.name}"? This cannot be undone.`}
                />
            )}

            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-black">Sections</h2>
                <button onClick={() => setModal({ type: 'ADD_SECTION' })} className="flex items-center space-x-2 bg-black text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <PlusIcon />
                    <span>Add Section</span>
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-black">
                 <ul className="divide-y divide-black">
                    {sections.map(section => (
                         <li key={section.id} className="p-4 group">
                             <div className="flex justify-between items-center">
                                <div className="flex-1 cursor-pointer" onClick={() => handleToggleExpand(section.id)}>
                                    <p className="font-semibold text-black group-hover:text-gray-700">{section.name}</p>
                                    <p className="text-sm text-gray-600 truncate">{section.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleToggleExpand(section.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="View"><EyeIcon className="h-5 w-5"/></button>
                                    <button onClick={() => setModal({ type: 'EDIT_SECTION', payload: section })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Edit"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDeleteRequest(section)} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-black rounded-md" title="Delete"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                            {expandedSectionId === section.id && <SectionView section={section} />}
                        </li>
                    ))}
                    {sections.length === 0 && <p className="text-black text-center py-8">No sections created yet. Click "Add Section" to get started.</p>}
                </ul>
            </div>
        </div>
    );
};

export default SectionsPage;