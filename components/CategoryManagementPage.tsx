import React, { useState } from 'react';
import { Category, CategoryTask } from '../types';
import { PencilIcon, PlusIcon, TrashIcon } from './common/Icons';
import CategoryModal from './common/CategoryModal';
import ConfirmationModal from './common/ConfirmationModal';

interface CategoryManagementPageProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManagementPage: React.FC<CategoryManagementPageProps> = ({ categories, setCategories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState<{ type: string | null, payload?: any }>({ type: null });

    const handleSaveCategory = (data: Category) => {
        if (categories.some(c => c.id === data.id)) { // Editing
            setCategories(prev => prev.map(cat => cat.id === data.id ? data : cat));
        } else { // Adding
            setCategories(prev => [...prev, data]);
        }
        setModal({ type: null });
    };

    const handleDeleteRequest = (id: string, name: string) => setModal({ type: 'DELETE_ITEM', payload: { id, name } });

    const handleConfirmDelete = () => {
        if (!modal.payload?.id) return;
        const { id } = modal.payload;
        setCategories(prev => {
            let nextState = prev.filter(cat => cat.id !== id);
            nextState = nextState.map(cat => ({
                ...cat,
                tasks: cat.tasks.filter(t => t.id !== id),
                subcategories: cat.subcategories.filter(sub => sub.id !== id).map(sub => ({
                    ...sub,
                    tasks: sub.tasks.filter(t => t.id !== id)
                }))
            }));
            return nextState;
        });
        setModal({ type: null });
    };

    const ActionButtons: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => (
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} className="p-1 hover:text-blue-600 text-gray-500"><PencilIcon /></button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-600 text-gray-500"><TrashIcon /></button>
        </div>
    );

    const TaskItem: React.FC<{task: CategoryTask}> = ({ task }) => (
        <div key={task.id} className="group flex justify-between items-center text-gray-600 py-1">
            <span>- {task.name}</span>
             <ActionButtons
                onEdit={() => alert("Please edit tasks within their parent category or subcategory.")}
                onDelete={() => handleDeleteRequest(task.id, task.name)}
            />
        </div>
    );

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.tasks.some(task => task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        category.subcategories.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || sub.tasks.some(task => task.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

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
                    placeholder="Search categories or tasks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900"
                />
                <button onClick={() => setModal({ type: 'ADD_CATEGORY' })} className="flex items-center space-x-2 bg-[#5F716B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#4E5C57] transition-colors">
                    <PlusIcon />
                    <span>Add Category</span>
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
                {filteredCategories.map(category => (
                    <details key={category.id} open className="block border-b last:border-b-0 pb-2">
                        <summary className="group flex justify-between items-center cursor-pointer font-semibold text-lg text-gray-800 list-none hover:text-[#5F716B]">
                             <div className="flex items-center space-x-2">
                                <span>{category.name}</span>
                                <ActionButtons onEdit={() => setModal({ type: 'EDIT_CATEGORY', payload: category })} onDelete={() => handleDeleteRequest(category.id, category.name)} />
                             </div>
                        </summary>
                        <div className="pl-6 pt-2 space-y-2">
                             <p className="text-sm text-gray-500 italic mb-2">{category.description}</p>
                             {category.tasks.map(task => <TaskItem key={task.id} task={task} />)}
                            {category.subcategories.map(sub => (
                                <details key={sub.id} open className="block">
                                    <summary className="group flex justify-between items-center cursor-pointer font-medium text-gray-700 list-none hover:text-[#5F716B]">
                                        <div className="flex items-center space-x-2">
                                            <span>{sub.name}</span>
                                            <ActionButtons
                                                onEdit={() => alert("Please edit subcategories within their parent category.")}
                                                onDelete={() => handleDeleteRequest(sub.id, sub.name)} />
                                        </div>
                                    </summary>
                                    <div className="pl-6 pt-1">
                                        {sub.tasks.map(task => <TaskItem key={task.id} task={task} />)}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default CategoryManagementPage;
