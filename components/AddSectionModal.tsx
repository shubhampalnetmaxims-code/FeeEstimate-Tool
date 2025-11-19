import React, { useState, useEffect, useRef } from 'react';
import { Category, Section, SectionContentItem, SectionTask, CategorySubcategory } from '../types';
import CategoryModal from './common/CategoryModal';
import { ChevronDownIcon, TrashIcon, XMarkIcon } from './common/Icons';

interface AddSectionModalProps {
    onClose: () => void;
    onSave: (section: Section) => void;
    categories: Category[];
    onUpdateCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));


const AddSectionModal: React.FC<AddSectionModalProps> = ({ onClose, onSave, categories, onUpdateCategories }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState<SectionContentItem[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    
    const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const contentCategoryIds = content.map(c => c.categoryId);
        const filteredContent = content.filter(c => selectedCategoryIds.includes(c.categoryId));

        const newCatIdsToAdd = selectedCategoryIds.filter(id => !contentCategoryIds.includes(id));
        const newCatsToAdd = categories.filter(c => newCatIdsToAdd.includes(c.id));
        
        const newContentItems: SectionContentItem[] = newCatsToAdd.map(cat => ({
            categoryId: cat.id,
            name: cat.name,
            tasks: cat.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 0, estimateCost: 0 })),
            subcategories: cat.subcategories.map(sub => ({
                ...deepCopy(sub),
                id: newId('sec-sub'),
                tasks: sub.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 0, estimateCost: 0 }))
            }))
        }));

        setContent([...filteredContent, ...newContentItems]);
    }, [selectedCategoryIds, categories]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleToggleCategory = (catId: string) => {
        setSelectedCategoryIds(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
    };

    const handleSaveNewCategory = (newCategory: Category) => {
        onUpdateCategories(prev => [...prev, newCategory]);
        setSelectedCategoryIds(prev => [...prev, newCategory.id]);
        setCategoryModalOpen(false);
    };

    const handleContentTaskChange = (catId: string, taskIndex: number, field: keyof SectionTask, value: string | number) => {
        setContent(prev => prev.map(cat => {
            if (cat.categoryId !== catId) return cat;
            const newTasks = [...cat.tasks];
            newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
            return { ...cat, tasks: newTasks };
        }));
    };

    const handleContentSubtaskChange = (catId: string, subIndex: number, taskIndex: number, field: keyof SectionTask, value: string | number) => {
        setContent(prev => prev.map(cat => {
            if (cat.categoryId !== catId) return cat;
            const newSubcategories = [...cat.subcategories];
            const sub = newSubcategories[subIndex];
            const newTasks = [...sub.tasks];
            newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
            newSubcategories[subIndex] = { ...sub, tasks: newTasks };
            return { ...cat, subcategories: newSubcategories };
        }));
    };

    const handleRemoveTask = (catId: string, taskId: string) => {
      setContent(prev => prev.map(cat =>
        cat.categoryId === catId ? { ...cat, tasks: cat.tasks.filter(t => t.id !== taskId) } : cat
      ));
    };
    const handleRemoveSubcategory = (catId: string, subId: string) => {
        setContent(prev => prev.map(cat => 
            cat.categoryId === catId ? { ...cat, subcategories: cat.subcategories.filter(s => s.id !== subId) } : cat
        ));
    };
    const handleRemoveSubtask = (catId: string, subId: string, taskId: string) => {
        setContent(prev => prev.map(cat => {
            if (cat.categoryId !== catId) return cat;
            return { ...cat, subcategories: cat.subcategories.map(s => s.id === subId ? {...s, tasks: s.tasks.filter(t => t.id !== taskId)} : s) };
        }));
    };

    const handleAddTask = (catId: string, subId: string | null = null) => {
        const newTask: SectionTask = { id: newId('sec-task'), name: '', estimateHours: 0, estimateCost: 0, isNew: true };

        setContent(prev => prev.map(cat => {
            if (cat.categoryId !== catId) return cat;
            if (subId) {
                const newSubcategories = cat.subcategories.map(sub =>
                    sub.id === subId ? { ...sub, tasks: [...sub.tasks, newTask] } : sub
                );
                return { ...cat, subcategories: newSubcategories };
            } else {
                return { ...cat, tasks: [...cat.tasks, newTask] };
            }
        }));
    };
    
    const handleSubmit = () => {
        if (!name.trim()) { alert('Section name is required.'); return; }
        
        let updatedCategories = JSON.parse(JSON.stringify(categories));
        
        content.forEach(catContent => {
            const categoryToUpdate = updatedCategories.find((c: Category) => c.id === catContent.categoryId);
            if (!categoryToUpdate) return;
            
            catContent.tasks.forEach(task => {
                if (task.isNew && task.name.trim()) {
                    categoryToUpdate.tasks.push({ id: newId('task'), name: task.name.trim() });
                }
            });

            catContent.subcategories.forEach(subContent => {
                const subcategoryToUpdate = categoryToUpdate.subcategories.find((s: CategorySubcategory) => s.id === subContent.id);
                if (subcategoryToUpdate) {
                    subContent.tasks.forEach(task => {
                        if (task.isNew && task.name.trim()) {
                            subcategoryToUpdate.tasks.push({ id: newId('task'), name: task.name.trim() });
                        }
                    });
                }
            });
        });
        onUpdateCategories(updatedCategories);

        const cleanString = (str: string) => str.trim();
        const cleanTasks = (tasks: SectionTask[]) => 
            tasks.filter(t => cleanString(t.name)).map(({ isNew, ...rest }) => ({...rest, name: cleanString(rest.name)}));

        const finalSection: Section = {
            id: newId('sec'),
            name: cleanString(name),
            description: cleanString(description),
            content: content
                .map(catContent => ({
                    ...catContent,
                    tasks: cleanTasks(catContent.tasks),
                    subcategories: catContent.subcategories
                        .filter(s => cleanString(s.name))
                        .map(sub => ({
                            ...sub,
                            name: cleanString(sub.name),
                            tasks: cleanTasks(sub.tasks),
                        })),
                }))
        };
        
        onSave(finalSection);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            {isCategoryModalOpen && <CategoryModal onClose={() => setCategoryModalOpen(false)} onSave={handleSaveNewCategory} />}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-black">
                <div className="flex justify-between items-center p-4 border-b border-black">
                    <h2 className="text-xl font-bold text-black">Create New Section</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black" />
                        </div>
                         <div ref={dropdownRef} className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Categories</label>
                            <button onClick={() => setCategoryDropdownOpen(p => !p)} className="w-full px-3 py-2 border border-black rounded-md shadow-sm bg-white text-left flex justify-between items-center text-black">
                                <span>{selectedCategoryIds.length > 0 ? `${selectedCategoryIds.length} categor${selectedCategoryIds.length > 1 ? 'ies' : 'y'} selected` : 'Select...'}</span>
                                <ChevronDownIcon />
                            </button>
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-full left-0 w-full bg-white border border-black rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                                            <input type="checkbox" checked={selectedCategoryIds.includes(cat.id)} onChange={() => handleToggleCategory(cat.id)} className="bg-white border-black rounded text-black focus:ring-black"/>
                                            <span className="text-black">{cat.name}</span>
                                        </label>
                                    ))}
                                    <div className="p-2 border-t">
                                        <button onClick={() => setCategoryModalOpen(true)} className="text-sm w-full text-center font-medium text-black hover:text-gray-700">Add New Category...</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black" />
                    </div>

                    <div className="pt-4 border-t space-y-4">
                        <h3 className="text-lg font-bold text-black">Section Content</h3>
                        {content.length === 0 && <p className="text-gray-500 text-center py-4">Select categories to populate content.</p>}
                        {content.map((catContent) => (
                            <div key={catContent.categoryId} className="p-4 bg-gray-50 rounded-md border space-y-3">
                                <h4 className="font-bold text-md text-gray-700">From Category: {catContent.name}</h4>
                                {catContent.tasks.map((task, index) => (
                                    <div key={task.id} className="pl-4">
                                        <div className="flex flex-col space-y-2 bg-white p-3 rounded-md border">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Task Name</label>
                                                <input
                                                    type="text"
                                                    value={task.name}
                                                    onChange={e => handleContentTaskChange(catContent.categoryId, index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                                                    placeholder="Enter task name"
                                                />
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Suggested Hours</label>
                                                    <input
                                                        type="number"
                                                        value={task.estimateHours}
                                                        onChange={e => handleContentTaskChange(catContent.categoryId, index, 'estimateHours', Number(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                                                        placeholder="e.g., 2"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Cost ($)/Hr</label>
                                                    <input
                                                        type="number"
                                                        value={task.estimateCost}
                                                        onChange={e => handleContentTaskChange(catContent.categoryId, index, 'estimateCost', Number(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                                                        placeholder="e.g., 150"
                                                    />
                                                </div>
                                                <button onClick={() => handleRemoveTask(catContent.categoryId, task.id)} className="p-2 text-black hover:bg-gray-200 rounded-md">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pl-4">
                                    <button onClick={() => handleAddTask(catContent.categoryId)} className="text-sm font-medium text-black hover:text-gray-700">Add Task to {catContent.name}</button>
                                </div>

                                {catContent.subcategories.map((sub, subIndex) => (
                                    <div key={sub.id} className="p-4 bg-white rounded-md border ml-4 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input type="text" value={sub.name} readOnly className="flex-grow px-3 py-2 border border-gray-300 bg-gray-100 text-black rounded-md font-semibold cursor-not-allowed" />
                                            <button onClick={() => handleRemoveSubcategory(catContent.categoryId, sub.id)} className="p-2 text-black hover:bg-gray-200 rounded-md"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                        <div className="pl-4 space-y-2">
                                            {sub.tasks.map((task, taskIndex) => (
                                                <div key={task.id}>
                                                    <div className="flex flex-col space-y-2 bg-gray-50 p-3 rounded-md border">
                                                        <div>
                                                             <label className="block text-xs font-medium text-gray-600 mb-1">Task Name</label>
                                                             <input
                                                                type="text"
                                                                value={task.name}
                                                                onChange={e => handleContentSubtaskChange(catContent.categoryId, subIndex, taskIndex, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                                                                placeholder="Enter task name"
                                                            />
                                                        </div>
                                                        <div className="flex items-end space-x-2">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Suggested Hours</label>
                                                                <input
                                                                    type="number"
                                                                    value={task.estimateHours}
                                                                    onChange={e => handleContentSubtaskChange(catContent.categoryId, subIndex, taskIndex, 'estimateHours', Number(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                                                                    placeholder="e.g., 2"
                                                                />
                                                            </div>
                                                             <div className="flex-1">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Cost ($)/Hr</label>
                                                                <input
                                                                    type="number"
                                                                    value={task.estimateCost}
                                                                    onChange={e => handleContentSubtaskChange(catContent.categoryId, subIndex, taskIndex, 'estimateCost', Number(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                                                                    placeholder="e.g., 150"
                                                                />
                                                            </div>
                                                            <button onClick={() => handleRemoveSubtask(catContent.categoryId, sub.id, task.id)} className="p-2 text-black hover:bg-gray-200 rounded-md">
                                                                <TrashIcon className="h-4 w-4"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pl-4">
                                                <button onClick={() => handleAddTask(catContent.categoryId, sub.id)} className="text-xs font-medium text-black hover:text-gray-700">Add Task</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-black bg-white border border-black rounded-md mr-2 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800">Save Section</button>
                </div>
            </div>
        </div>
    );
};

export default AddSectionModal;