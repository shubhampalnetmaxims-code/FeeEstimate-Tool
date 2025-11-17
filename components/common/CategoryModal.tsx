import React, { useState } from 'react';
import { Category, CategoryFormData } from '../../types';
import { PlusIcon, TrashIcon, XMarkIcon } from './Icons';

interface CategoryModalProps {
    onClose: () => void;
    onSave: (data: Category) => void;
    initialData?: Category;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<CategoryFormData>(() => {
        const defaultData = { name: '', description: '', tasks: [{ name: '' }], subcategories: [] };
        return initialData ? { ...initialData, tasks: initialData.tasks.length > 0 ? initialData.tasks : [{ name: '' }] } : defaultData;
    });
    const isEditing = !!initialData;

    const handleTaskChange = (index: number, value: string) => {
        const newTasks = [...formData.tasks];
        newTasks[index] = { ...newTasks[index], name: value };
        setFormData(prev => ({ ...prev, tasks: newTasks }));
    };
    const handleAddTask = () => setFormData(prev => ({ ...prev, tasks: [...prev.tasks, { name: '' }] }));
    const handleRemoveTask = (index: number) => setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));

    const handleAddSubcategory = () => setFormData(prev => ({ ...prev, subcategories: [...prev.subcategories, { name: '', tasks: [{ name: '' }] }] }));
    const handleRemoveSubcategory = (subIndex: number) => setFormData(prev => ({ ...prev, subcategories: prev.subcategories.filter((_, i) => i !== subIndex) }));
    
    const handleSubcategoryChange = (subIndex: number, value: string) => {
        const newSubcategories = [...formData.subcategories];
        newSubcategories[subIndex] = { ...newSubcategories[subIndex], name: value };
        setFormData(prev => ({ ...prev, subcategories: newSubcategories }));
    };

    const handleSubcategoryTaskChange = (subIndex: number, taskIndex: number, value: string) => {
        const newSubcategories = [...formData.subcategories];
        const newTasks = [...newSubcategories[subIndex].tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], name: value };
        newSubcategories[subIndex] = { ...newSubcategories[subIndex], tasks: newTasks };
        setFormData(prev => ({...prev, subcategories: newSubcategories}));
    };

    const handleAddSubcategoryTask = (subIndex: number) => {
        const newSubcategories = [...formData.subcategories];
        newSubcategories[subIndex].tasks.push({ name: '' });
        setFormData(prev => ({...prev, subcategories: newSubcategories}));
    };
    
    const handleRemoveSubcategoryTask = (subIndex: number, taskIndex: number) => {
        const newSubcategories = [...formData.subcategories];
        newSubcategories[subIndex].tasks = newSubcategories[subIndex].tasks.filter((_, i) => i !== taskIndex);
        setFormData(prev => ({ ...prev, subcategories: newSubcategories }));
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) { alert('Category name is required.'); return; }
        
        const cleanString = (str: string) => str.trim();
        const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const finalData: Category = {
            id: initialData?.id || newId('cat'),
            name: cleanString(formData.name),
            description: cleanString(formData.description),
            tasks: formData.tasks
                .filter(t => cleanString(t.name))
                .map(t => ({ ...t, id: t.id || newId('task'), name: cleanString(t.name) })),
            subcategories: formData.subcategories
                .filter(s => cleanString(s.name))
                .map(s => ({
                    id: s.id || newId('sub'),
                    name: cleanString(s.name),
                    tasks: s.tasks
                        .filter(t => cleanString(t.name))
                        .map(t => ({ ...t, id: t.id || newId('task'), name: cleanString(t.name) }))
                })),
        };
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Category' : 'Create New Category'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900" />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <h3 className="text-md font-semibold text-gray-700">Tasks for this Category</h3>
                        {formData.tasks.map((task, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input type="text" value={task.name} onChange={e => handleTaskChange(index, e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" placeholder="Task Name" />
                                <button onClick={() => handleRemoveTask(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        ))}
                        <button onClick={handleAddTask} className="text-sm font-medium text-[#5F716B] hover:text-[#4E5C57]">Add Task</button>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-bold text-gray-800">Subcategories</h3>
                        {formData.subcategories.map((sub, subIndex) => (
                            <div key={subIndex} className="p-4 bg-gray-50 rounded-md border space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input type="text" value={sub.name} onChange={e => handleSubcategoryChange(subIndex, e.target.value)} placeholder={`Subcategory Name ${subIndex + 1}`} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                                    <button onClick={() => handleRemoveSubcategory(subIndex)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                                <div className="pl-4 space-y-2">
                                    {sub.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="flex items-center space-x-2">
                                           <input type="text" value={task.name} onChange={e => handleSubcategoryTaskChange(subIndex, taskIndex, e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" placeholder="Task Name" />
                                            <button onClick={() => handleRemoveSubcategoryTask(subIndex, taskIndex)} className="p-1 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddSubcategoryTask(subIndex)} className="text-xs font-medium text-[#5F716B] hover:text-[#4E5C57]">Add Task</button>
                                </div>
                            </div>
                        ))}
                         <button onClick={handleAddSubcategory} className="text-sm font-semibold text-white bg-[#5F716B] hover:bg-[#4E5C57] px-3 py-1.5 rounded-md flex items-center space-x-1">
                            <PlusIcon className="h-4 w-4"/><span>Add Subcategory</span>
                        </button>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#5F716B] rounded-md hover:bg-[#4E5C57]">Save Category</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
