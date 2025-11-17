import React, { useState, useEffect, useRef } from 'react';
import { Category, Section, SectionContentItem, SectionTask, CategorySubcategory } from '../types';
import CategoryModal from './common/CategoryModal';
import EditSectionModal from './EditSectionModal';
import ConfirmationModal from './common/ConfirmationModal';
import { ChevronDownIcon, PlusIcon, TrashIcon, XMarkIcon, PencilIcon } from './common/Icons';


interface AddSectionModalProps {
    onClose: () => void;
    onSave: (section: Section) => void;
    categories: Category[];
    onUpdateCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}
const AddSectionModal: React.FC<AddSectionModalProps> = ({ onClose, onSave, categories, onUpdateCategories }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [content, setContent] = useState<SectionContentItem[]>([]);
    
    const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

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
        const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
            id: `sec-${Date.now()}`,
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
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            {isCategoryModalOpen && <CategoryModal onClose={() => setCategoryModalOpen(false)} onSave={handleSaveNewCategory} />}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Add New Section</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900" />
                        </div>
                         <div ref={dropdownRef} className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Categories</label>
                            <button onClick={() => setCategoryDropdownOpen(p => !p)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left flex justify-between items-center text-black">
                                <span>{selectedCategoryIds.length > 0 ? `${selectedCategoryIds.length} categor${selectedCategoryIds.length > 1 ? 'ies' : 'y'} selected` : 'Select...'}</span>
                                <ChevronDownIcon />
                            </button>
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                                            <input type="checkbox" checked={selectedCategoryIds.includes(cat.id)} onChange={() => handleToggleCategory(cat.id)} className="bg-white border-gray-300 rounded text-[#5F716B] focus:ring-[#8E9B9A]"/>
                                            <span className="text-black">{cat.name}</span>
                                        </label>
                                    ))}
                                    <div className="p-2 border-t">
                                        <button onClick={() => setCategoryModalOpen(true)} className="text-sm w-full text-center font-medium text-[#5F716B] hover:text-[#4E5C57]">Add New Category...</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8E9B9A] bg-white text-gray-900" />
                    </div>

                    <div className="pt-4 border-t space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">Section Content</h3>
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                                    placeholder="Enter task name"
                                                />
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Hours</label>
                                                    <input
                                                        type="number"
                                                        value={task.estimateHours}
                                                        onChange={e => handleContentTaskChange(catContent.categoryId, index, 'estimateHours', Number(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                                        placeholder="e.g., 2"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Cost ($)</label>
                                                    <input
                                                        type="number"
                                                        value={task.estimateCost}
                                                        onChange={e => handleContentTaskChange(catContent.categoryId, index, 'estimateCost', Number(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                                        placeholder="e.g., 150"
                                                    />
                                                </div>
                                                <button onClick={() => handleRemoveTask(catContent.categoryId, task.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pl-4">
                                    <button onClick={() => handleAddTask(catContent.categoryId)} className="text-sm font-medium text-[#5F716B] hover:text-[#4E5C57]">Add Task to {catContent.name}</button>
                                </div>

                                {catContent.subcategories.map((sub, subIndex) => (
                                    <div key={sub.id} className="p-4 bg-white rounded-md border ml-4 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input type="text" value={sub.name} readOnly className="flex-grow px-3 py-2 border-gray-300 bg-gray-100 text-gray-900 rounded-md font-semibold" />
                                            <button onClick={() => handleRemoveSubcategory(catContent.categoryId, sub.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon className="h-5 w-5" /></button>
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
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                                                placeholder="Enter task name"
                                                            />
                                                        </div>
                                                        <div className="flex items-end space-x-2">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Hours</label>
                                                                <input
                                                                    type="number"
                                                                    value={task.estimateHours}
                                                                    onChange={e => handleContentSubtaskChange(catContent.categoryId, subIndex, taskIndex, 'estimateHours', Number(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                                                    placeholder="e.g., 2"
                                                                />
                                                            </div>
                                                             <div className="flex-1">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Cost ($)</label>
                                                                <input
                                                                    type="number"
                                                                    value={task.estimateCost}
                                                                    onChange={e => handleContentSubtaskChange(catContent.categoryId, subIndex, taskIndex, 'estimateCost', Number(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                                                    placeholder="e.g., 150"
                                                                />
                                                            </div>
                                                            <button onClick={() => handleRemoveSubtask(catContent.categoryId, sub.id, task.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md">
                                                                <TrashIcon className="h-4 w-4"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pl-4">
                                                <button onClick={() => handleAddTask(catContent.categoryId, sub.id)} className="text-xs font-medium text-[#5F716B] hover:text-[#4E5C57]">Add Task</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-[#5F716B] rounded-md hover:bg-[#4E5C57]">Save Section</button>
                </div>
            </div>
        </div>
    );
};


interface SectionsPageProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    sections: Section[];
    setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

const SectionsPage: React.FC<SectionsPageProps> = ({ categories, setCategories, sections, setSections }) => {
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
                 <h2 className="text-2xl font-bold text-gray-800">Sections</h2>
                <button onClick={() => setModal({ type: 'ADD_SECTION' })} className="flex items-center space-x-2 bg-[#5F716B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#4E5C57] transition-colors">
                    <PlusIcon />
                    <span>Add Section</span>
                </button>
            </div>
            <div className="space-y-6">
                {sections.map(section => (
                     <div key={section.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-black">{section.name}</h3>
                                {section.description && <p className="text-sm text-black italic mt-1">{section.description}</p>}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setModal({ type: 'EDIT_SECTION', payload: section })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDeleteRequest(section)} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-md"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {section.content.map(item => (
                                <div key={item.categoryId} className="pt-2">
                                    <h4 className="text-lg font-bold text-black mb-2">{item.name}</h4>
                                    <ul className="list-none pl-4 space-y-1 mt-2">
                                        {item.tasks.map(task => (
                                            <li key={task.id} className="text-black">- {task.name} <span className="text-xs text-gray-600">({task.estimateHours}h, ${task.estimateCost})</span></li>
                                        ))}
                                        {item.subcategories.map(sub => (
                                            <li key={sub.id} className="pt-2">
                                                <h5 className="font-semibold text-black">{sub.name}</h5>
                                                <ul className="list-none pl-6 space-y-1 mt-2">
                                                    {sub.tasks.map(task => (
                                                        <li key={task.id} className="text-black">- {task.name} <span className="text-xs text-gray-600">({task.estimateHours}h, ${task.estimateCost})</span></li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                             {section.content.length === 0 && <p className="text-gray-500 text-sm">This section has no content yet.</p>}
                        </div>
                    </div>
                ))}
                {sections.length === 0 && <p className="text-black text-center py-4">No sections created yet. Click "Add Section" to get started.</p>}
            </div>
        </div>
    );
};

export default SectionsPage;