import React, { useState } from 'react';
import { Category } from '../types';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from './common/Icons';
import CategoryModal from './common/CategoryModal';
import ConfirmationModal from './common/ConfirmationModal';
import CategoryView from './CategoryView';

interface CategoryManagementPageProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManagementPage: React.FC<CategoryManagementPageProps> = ({ categories, setCategories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'list' | 'view'>('list');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modal, setModal] = useState<{ type: string | null, payload?: any }>({ type: null });

    const handleSaveCategory = (data: Category) => {
        if (categories.some(c => c.id === data.id)) { // Editing
            setCategories(prev => prev.map(cat => cat.id === data.id ? data : cat));
        } else { // Adding
            setCategories(prev => [...prev, data]);
        }
        setModal({ type: null });
    };

    const handleDeleteRequest = (category: Category) => setModal({ type: 'DELETE_ITEM', payload: category });

    const handleConfirmDelete = () => {
        if (!modal.payload?.id) return;
        setCategories(prev => prev.filter(cat => cat.id !== modal.payload.id));
        setModal({ type: null });
    };
    
    const handleViewCategory = (category: Category) => {
        setSelectedCategory(category);
        setView('view');
    };

    const handleBackToList = () => {
        setSelectedCategory(null);
        setView('list');
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'view' && selectedCategory) {
        return <CategoryView category={selectedCategory} onBack={handleBackToList} />;
    }

    return (
        <div className="space-y-6">
            {modal.type === 'ADD_CATEGORY' && <CategoryModal onClose={() => setModal({type: null})} onSave={handleSaveCategory} />}
            {modal.type === 'EDIT_CATEGORY' && <CategoryModal onClose={() => setModal({type: null})} onSave={handleSaveCategory} initialData={modal.payload} />}
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
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900"
                />
                <button onClick={() => setModal({ type: 'ADD_CATEGORY' })} className="flex items-center space-x-2 bg-[#5F716B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#4E5C57] transition-colors">
                    <PlusIcon />
                    <span>Add Category</span>
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                 <ul className="divide-y divide-gray-200">
                    {filteredCategories.length > 0 ? filteredCategories.map(category => (
                        <li key={category.id} className="p-4 flex justify-between items-center group">
                            <div className="flex-1 cursor-pointer" onClick={() => handleViewCategory(category)}>
                                <p className="font-semibold text-gray-800 group-hover:text-[#5F716B]">{category.name}</p>
                                <p className="text-sm text-gray-500 truncate">{category.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleViewCategory(category)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="View"><EyeIcon className="h-5 w-5"/></button>
                                <button onClick={() => setModal({ type: 'EDIT_CATEGORY', payload: category })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Edit"><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDeleteRequest(category)} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-md" title="Delete"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </li>
                    )) : (
                         <p className="text-center text-gray-500 py-8">No categories found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CategoryManagementPage;