import React, { useState } from 'react';
import { Project, ProjectStage, Section, Category, SectionTask, SectionContentItem, ProjectType } from '../types';
import { PlusIcon, TrashIcon, ChevronLeftIcon } from './common/Icons';

interface ProjectFormProps {
    initialData: Project | null;
    onSave: (project: Project) => void;
    onCancel: () => void;
    categories: Category[];
    sections: Section[];
    projectTypes?: ProjectType[];
    isCustomerView?: boolean;
}

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const calculateTaskTotal = (task: SectionTask) => {
    const hours = (task.actualHours !== undefined && task.actualHours !== null && !isNaN(task.actualHours) && task.actualHours > 0) 
        ? task.actualHours 
        : task.estimateHours;
    const cost = task.estimateCost || 0;
    return hours * cost;
};

const calculateSectionTotal = (section: Section) => {
    let total = 0;
    section.content.forEach(contentItem => {
        contentItem.tasks.forEach(task => {
            total += calculateTaskTotal(task);
        });
        contentItem.subcategories.forEach(sub => {
            sub.tasks.forEach(task => {
                total += calculateTaskTotal(task);
            });
        });
    });
    return total;
};

const calculateStageTotal = (stage: ProjectStage) => {
    return stage.sections.reduce((total, section) => total + calculateSectionTotal(section), 0);
};

const calculateOverallTotal = (project: Project) => {
    return project.stages.reduce((total, stage) => total + calculateStageTotal(stage), 0);
};

const designSpaces = ["Living Room", "Kitchen", "Master Bedroom", "Guest Bedroom", "Bathroom", "Home Office", "Dining Room", "Entryway", "Basement", "Outdoor Space", "Laundry", "Walk-in Closet", "Powder Room", "Family Room", "Study", "Media Room"];

const qualityLevels: Record<string, string> = { 
    'Standard': 'Quality finishes with practical solutions', 
    'Premium': 'High-end finishes with custom elements', 
    'Luxury': 'Luxury finishes with bespoke solutions' 
};


const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel, categories, sections, projectTypes, isCustomerView = false }) => {
    const [project, setProject] = useState<Project>(
        initialData ? deepCopy(initialData) : {
            id: newId('proj'),
            name: '',
            clientAddress: '',
            projectType: '',
            projectDescription: '',
            stages: [],
            spaces: [],
        }
    );

    const handleInputChange = (field: keyof Project, value: string | number | string[] | undefined) => {
        setProject(p => ({ ...p, [field]: value }));
    };

    const handleSpaceChange = (space: string) => {
        const currentSpaces = project.spaces || [];
        const newSpaces = currentSpaces.includes(space)
            ? currentSpaces.filter(s => s !== space)
            : [...currentSpaces, space];
        handleInputChange('spaces', newSpaces);
    };
    
    const handleAddStage = () => {
        const newStage: ProjectStage = {
            id: newId('stage'),
            name: `Stage ${project.stages.length + 1}`,
            sections: [],
        };
        setProject(p => ({ ...p, stages: [...p.stages, newStage] }));
    };

    const handleStageChange = (stageId: string, name: string) => {
        setProject(p => ({
            ...p,
            stages: p.stages.map(s => s.id === stageId ? { ...s, name } : s),
        }));
    };
    
    const handleDeleteStage = (stageId: string) => {
        setProject(p => ({...p, stages: p.stages.filter(s => s.id !== stageId)}));
    };

    const handleDeleteSectionFromStage = (stageId: string, sectionId: string) => {
        setProject(p => ({
            ...p,
            stages: p.stages.map(stage => 
                stage.id === stageId 
                    ? { ...stage, sections: stage.sections.filter(sec => sec.id !== sectionId) }
                    : stage
            )
        }));
    };

    const handleAddSectionToStage = (stageId: string, sectionId: string) => {
        const sectionTemplate = sections.find(s => s.id === sectionId);
        if (!sectionTemplate) return;

        const newSection = deepCopy(sectionTemplate);
        newSection.id = newId('proj-sec');
        
        newSection.content.forEach(contentItem => {
            contentItem.tasks.forEach(task => { task.id = newId('sec-task') });
            contentItem.subcategories.forEach(sub => {
                sub.id = newId('sec-sub');
                sub.tasks.forEach(task => { task.id = newId('sec-task') });
            });
        });

        setProject(p => ({
            ...p,
            stages: p.stages.map(stage => 
                stage.id === stageId ? {...stage, sections: [...stage.sections, newSection]} : stage
            )
        }));
    };

    const handleTaskChange = (stageId: string, sectionId: string, contentIndex: number, taskIndex: number, subcategoryIndex: number | null, field: keyof SectionTask, value: any) => {
        setProject(prevProject => ({
            ...prevProject,
            stages: prevProject.stages.map(stage => {
                if (stage.id !== stageId) return stage;
                return {
                    ...stage,
                    sections: stage.sections.map(section => {
                        if (section.id !== sectionId) return section;
                        
                        const newContent = section.content.map((contentItem, cIdx) => {
                            if (cIdx !== contentIndex) return contentItem;

                            if (subcategoryIndex === null) { // Task is directly under category
                                const newTasks = contentItem.tasks.map((task, tIdx) => {
                                    if (tIdx !== taskIndex) return task;
                                    return { ...task, [field]: value };
                                });
                                return { ...contentItem, tasks: newTasks };
                            } else { // Task is under a subcategory
                                const newSubcategories = contentItem.subcategories.map((sub, sIdx) => {
                                    if (sIdx !== subcategoryIndex) return sub;
                                    const newTasks = sub.tasks.map((task, tIdx) => {
                                        if (tIdx !== taskIndex) return task;
                                        return { ...task, [field]: value };
                                    });
                                    return { ...sub, tasks: newTasks };
                                });
                                return { ...contentItem, subcategories: newSubcategories };
                            }
                        });
                        return { ...section, content: newContent };
                    })
                };
            })
        }));
    };
    
    const handleAddTask = (stageId: string, sectionId: string, contentIndex: number, subcategoryIndex: number | null) => {
        const newTask: SectionTask = { id: newId('task'), name: '', estimateHours: 0, estimateCost: 0, actualHours: undefined };
        setProject(prevProject => ({
            ...prevProject,
            stages: prevProject.stages.map(stage => {
                if (stage.id !== stageId) return stage;
                return {
                    ...stage,
                    sections: stage.sections.map(section => {
                        if (section.id !== sectionId) return section;
                        const newContent = [...section.content];
                        if (subcategoryIndex === null) {
                            newContent[contentIndex] = {
                                ...newContent[contentIndex],
                                tasks: [...newContent[contentIndex].tasks, newTask]
                            };
                        } else {
                            const newSubcategories = [...newContent[contentIndex].subcategories];
                            newSubcategories[subcategoryIndex] = {
                                ...newSubcategories[subcategoryIndex],
                                tasks: [...newSubcategories[subcategoryIndex].tasks, newTask]
                            };
                            newContent[contentIndex] = {
                                ...newContent[contentIndex],
                                subcategories: newSubcategories
                            };
                        }
                        return { ...section, content: newContent };
                    })
                };
            })
        }));
    };

    const handleDeleteTask = (stageId: string, sectionId: string, contentIndex: number, taskId: string, subcategoryIndex: number | null) => {
        setProject(prevProject => ({
            ...prevProject,
            stages: prevProject.stages.map(stage => {
                if (stage.id !== stageId) return stage;
                return {
                    ...stage,
                    sections: stage.sections.map(section => {
                        if (section.id !== sectionId) return section;
                        const newContent = [...section.content];
                        if (subcategoryIndex === null) {
                            newContent[contentIndex] = {
                                ...newContent[contentIndex],
                                tasks: newContent[contentIndex].tasks.filter(t => t.id !== taskId)
                            };
                        } else {
                             const newSubcategories = [...newContent[contentIndex].subcategories];
                            newSubcategories[subcategoryIndex] = {
                                ...newSubcategories[subcategoryIndex],
                                tasks: newSubcategories[subcategoryIndex].tasks.filter(t => t.id !== taskId)
                            };
                            newContent[contentIndex] = {
                                ...newContent[contentIndex],
                                subcategories: newSubcategories
                            };
                        }
                        return { ...section, content: newContent };
                    })
                };
            })
        }));
    };
    
    const handleDeleteCategoryFromSection = (stageId: string, sectionId: string, categoryId: string) => {
        setProject(prevProject => ({
            ...prevProject,
            stages: prevProject.stages.map(stage => {
                if (stage.id !== stageId) return stage;
                return {
                    ...stage,
                    sections: stage.sections.map(section => {
                        if (section.id !== sectionId) return section;
                        return {
                            ...section,
                            content: section.content.filter(c => c.categoryId !== categoryId)
                        };
                    })
                };
            })
        }));
    };

    const handleAddCategoryToSection = (stageId: string, sectionId: string, categoryIdToAdd: string) => {
        const categoryTemplate = categories.find(c => c.id === categoryIdToAdd);
        if (!categoryTemplate) return;

        const newContentItem: SectionContentItem = {
            categoryId: categoryTemplate.id,
            name: categoryTemplate.name,
            tasks: categoryTemplate.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 0, estimateCost: 0, actualHours: undefined })),
            subcategories: categoryTemplate.subcategories.map(sub => ({
                ...deepCopy(sub),
                id: newId('sec-sub'),
                tasks: sub.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 0, estimateCost: 0, actualHours: undefined }))
            }))
        };
        
        setProject(p => ({
            ...p,
            stages: p.stages.map(stage => {
                if (stage.id !== stageId) return stage;
                return {
                    ...stage,
                    sections: stage.sections.map(section => {
                        if (section.id !== sectionId) return section;
                        if (section.content.some(c => c.categoryId === categoryIdToAdd)) return section; // Avoid duplicates
                        return { ...section, content: [...section.content, newContentItem] };
                    })
                };
            })
        }));
    };

    const handleSubmit = () => {
        if (!project.name.trim()) {
            alert('Project Name is required.');
            return;
        }
        onSave(project);
    };

    const handleNumericInputChange = (value: string): number | undefined => {
        if (value === '') return undefined;
        const num = parseFloat(value);
        return isNaN(num) || num < 0 ? 0 : num;
    };

    const TaskRow = ({ task, onTaskChange, onDeleteTask }: { task: SectionTask, onTaskChange: (field: keyof SectionTask, value: any) => void, onDeleteTask: () => void }) => (
        <div className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-white border border-stone-100 hover:border-stone-300 hover:shadow-sm transition-all mb-2">
            <div className="col-span-4">
                <input type="text" value={task.name} onChange={e => onTaskChange('name', e.target.value)} className="w-full px-2 py-1.5 border-b border-stone-200 focus:border-stone-800 bg-transparent text-sm text-stone-900 focus:outline-none" placeholder="Task Name"/>
            </div>
            <div className="col-span-2">
                 <input type="number" min="0" value={task.estimateHours ?? ''} onChange={e => onTaskChange('estimateHours', handleNumericInputChange(e.target.value))} className="w-full px-2 py-1.5 bg-stone-50 border border-transparent rounded text-sm text-center text-stone-700 focus:bg-white focus:border-stone-300 focus:outline-none" placeholder="Hrs"/>
            </div>
            <div className="col-span-2">
                <input type="number" min="0" value={task.estimateCost ?? ''} onChange={e => onTaskChange('estimateCost', handleNumericInputChange(e.target.value))} className="w-full px-2 py-1.5 bg-stone-50 border border-transparent rounded text-sm text-center text-stone-700 focus:bg-white focus:border-stone-300 focus:outline-none" placeholder="$"/>
            </div>
            <div className="col-span-2">
                <input type="number" min="0" value={task.actualHours ?? ''} onChange={e => onTaskChange('actualHours', handleNumericInputChange(e.target.value))} className="w-full px-2 py-1.5 bg-stone-50 border border-transparent rounded text-sm text-center text-stone-700 focus:bg-white focus:border-stone-300 focus:outline-none" placeholder="Act"/>
            </div>
            <div className="col-span-1 text-center font-bold text-sm text-stone-900">
                ${calculateTaskTotal(task).toFixed(0)}
            </div>
            <div className="col-span-1 justify-self-center">
                <button onClick={onDeleteTask} className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="h-4 w-4"/></button>
            </div>
       </div>
    );

    return (
        <div className="space-y-8 pb-32">
            <header className="flex items-center space-x-4 mb-8 border-b border-stone-200 pb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                 <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">
                        {initialData?.id ? `Edit ${isCustomerView ? 'Project' : 'Template'}` : `Create New ${isCustomerView ? 'Project' : 'Template'}`}
                    </h1>
                    <p className="text-stone-500 mt-1">Fill in the details below to configure your project.</p>
                 </div>
            </header>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">{isCustomerView ? 'Project' : 'Template'} Name *</label>
                        <input type="text" value={project.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 bg-stone-50 focus:bg-white text-stone-900 transition-colors" />
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-stone-700 mb-2">Project Type</label>
                        {isCustomerView ? (
                            <input 
                                type="text" 
                                value={project.projectType} 
                                readOnly
                                className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-100 text-stone-500 cursor-not-allowed" 
                            />
                        ) : projectTypes ? (
                             <select
                                value={project.projectType}
                                onChange={e => handleInputChange('projectType', e.target.value as string)}
                                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 bg-stone-50 focus:bg-white text-stone-900 cursor-pointer transition-colors"
                            >
                                <option value="">-- Select a project type --</option>
                                {projectTypes.map(pt => (
                                    <option key={pt.id} value={pt.name}>{pt.name}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                value={project.projectType} 
                                onChange={e => handleInputChange('projectType', e.target.value as string)} 
                                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 bg-stone-50 focus:bg-white text-stone-900 transition-colors" 
                            />
                        )}
                    </div>
                </div>

                {isCustomerView && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Budget (USD)</label>
                                <div className="flex items-center space-x-4">
                                    <input type="number" placeholder="Min" value={project.budgetMin ?? ''} onChange={e => handleInputChange('budgetMin', handleNumericInputChange(e.target.value))} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500"/>
                                    <span className="text-stone-400 font-serif italic">to</span>
                                    <input type="number" placeholder="Max" value={project.budgetMax ?? ''} onChange={e => handleInputChange('budgetMax', handleNumericInputChange(e.target.value))} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Timeline (Weeks)</label>
                                <div className="flex items-center space-x-4">
                                     <input type="number" placeholder="Min" value={project.timelineMin ?? ''} onChange={e => handleInputChange('timelineMin', handleNumericInputChange(e.target.value))} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500"/>
                                    <span className="text-stone-400 font-serif italic">to</span>
                                    <input type="number" placeholder="Max" value={project.timelineMax ?? ''} onChange={e => handleInputChange('timelineMax', handleNumericInputChange(e.target.value))} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500"/>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Total Area (sq ft)</label>
                                <input type="number" value={project.totalArea ?? ''} onChange={e => handleInputChange('totalArea', handleNumericInputChange(e.target.value))} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Quality Level</label>
                                <select
                                    value={project.qualityLevel || ''}
                                    onChange={e => handleInputChange('qualityLevel', e.target.value as Project['qualityLevel'])}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500 cursor-pointer"
                                >
                                    <option value="" disabled>-- Select a level --</option>
                                    {Object.entries(qualityLevels).map(([level, desc]) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                         <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Spaces to be Designed</label>
                            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50/50 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {designSpaces.map(space => (
                                        <label key={space} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={(project.spaces || []).includes(space)}
                                                onChange={() => handleSpaceChange(space)}
                                                className="h-4 w-4 text-stone-900 focus:ring-stone-500 border-stone-300 rounded"
                                            />
                                            <span className="text-sm text-stone-700">{space}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Client Address</label>
                            <input type="text" value={project.clientAddress} onChange={e => handleInputChange('clientAddress', e.target.value as string)} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500" />
                        </div>
                    </>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Project Description</label>
                    <textarea value={project.projectDescription} onChange={e => handleInputChange('projectDescription', e.target.value as string)} rows={4} className="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-500" />
                </div>
            </div>

            <div className="space-y-6">
                 <h2 className="text-2xl font-serif font-bold text-stone-900 border-b border-stone-200 pb-2">Stages</h2>
                 {project.stages.map(stage => (
                     <div key={stage.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-stone-900"></div>
                         <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                             <input type="text" value={stage.name} onChange={e => handleStageChange(stage.id, e.target.value)} className="text-2xl font-serif font-bold text-stone-900 bg-transparent focus:outline-none focus:bg-stone-50 p-2 rounded-md w-full placeholder-stone-300" placeholder="Stage Name" />
                              <div className="flex items-center space-x-6 pl-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Stage Total</p>
                                    <p className="text-2xl font-bold text-stone-900 font-serif">${calculateStageTotal(stage).toFixed(2)}</p>
                                </div>
                                <button onClick={() => handleDeleteStage(stage.id)} className="p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><TrashIcon className="h-5 w-5"/></button>
                              </div>
                         </div>
                         <div className="space-y-6">
                            {stage.sections.map(section => (
                                <div key={section.id} className="bg-stone-50/50 border border-stone-200 rounded-lg p-5">
                                     <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-serif font-bold text-stone-800">{section.name}</h3>
                                            <p className="text-sm text-stone-500 font-light italic">{section.description}</p>
                                        </div>
                                        <div className="flex items-start space-x-4">
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-medium text-stone-400 uppercase">Section Total</p>
                                                <p className="text-lg font-bold text-stone-700">${calculateSectionTotal(section).toFixed(2)}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteSectionFromStage(stage.id, section.id)} 
                                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                                title={`Delete section ${section.name}`}
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </div>
                                     {section.content.map((contentItem, contentIdx) => (
                                         <div key={contentItem.categoryId} className="mt-4 bg-white border border-stone-100 rounded-lg p-4 shadow-sm">
                                              <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-bold text-stone-600 uppercase text-xs tracking-wider">{contentItem.name}</h4>
                                                <button onClick={() => handleDeleteCategoryFromSection(stage.id, section.id, contentItem.categoryId)} className="p-1 text-stone-300 hover:text-red-500 transition-colors" title={`Remove ${contentItem.name} category`}>
                                                    <TrashIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                             <div className="grid grid-cols-12 gap-3 items-center mb-2 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                <div className="col-span-4">Task</div>
                                                <div className="col-span-2 text-center">Est Hrs</div>
                                                <div className="col-span-2 text-center">Cost/Hr</div>
                                                <div className="col-span-2 text-center">Act Hrs</div>
                                                <div className="col-span-1 text-center">Total</div>
                                                <div className="col-span-1"></div>
                                            </div>

                                             <div className="space-y-2">
                                                 {contentItem.tasks.map((task, taskIdx) => (
                                                     <TaskRow 
                                                        key={task.id}
                                                        task={task}
                                                        onTaskChange={(field, value) => handleTaskChange(stage.id, section.id, contentIdx, taskIdx, null, field, value)}
                                                        onDeleteTask={() => handleDeleteTask(stage.id, section.id, contentIdx, task.id, null)}
                                                     />
                                                 ))}
                                                 <button onClick={() => handleAddTask(stage.id, section.id, contentIdx, null)} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wide py-1">+ Add Task</button>
                                             </div>

                                              {contentItem.subcategories.map((sub, subIdx) => (
                                                 <div key={sub.id} className="mt-4 pl-4 border-l-2 border-stone-100">
                                                     <h5 className="font-medium text-stone-600 text-sm mb-2">{sub.name}</h5>
                                                     <div className="space-y-2">
                                                         {sub.tasks.map((task, taskIdx) => (
                                                              <TaskRow 
                                                                key={task.id}
                                                                task={task}
                                                                onTaskChange={(field, value) => handleTaskChange(stage.id, section.id, contentIdx, taskIdx, subIdx, field, value)}
                                                                onDeleteTask={() => handleDeleteTask(stage.id, section.id, contentIdx, task.id, subIdx)}
                                                             />
                                                         ))}
                                                         <button onClick={() => handleAddTask(stage.id, section.id, contentIdx, subIdx)} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wide py-1">+ Add Task</button>
                                                     </div>
                                                 </div>
                                              ))}
                                         </div>
                                     ))}
                                     <div className="mt-6 pt-4 border-t border-stone-200/50">
                                        <select 
                                            onChange={e => {
                                                if (e.target.value) {
                                                    handleAddCategoryToSection(stage.id, section.id, e.target.value);
                                                }
                                                e.target.value = "";
                                            }}
                                            value=""
                                            className="text-sm bg-white text-stone-700 border border-stone-300 rounded-md px-3 py-2 focus:ring-stone-500 focus:border-stone-500 w-full md:w-auto"
                                        >
                                            <option value="" disabled>+ Add Category to Section</option>
                                            {categories
                                                .filter(cat => !section.content.some(c => c.categoryId === cat.id))
                                                .map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <div>
                            <select onChange={e => {handleAddSectionToStage(stage.id, e.target.value); e.target.value = ""}} value="" className="w-full mt-2 text-sm bg-stone-50 text-stone-700 border border-stone-300 border-dashed rounded-lg py-3 px-4 hover:bg-white hover:border-stone-400 transition-colors cursor-pointer">
                                <option value="" disabled>+ Add Section from Templates</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                         </div>
                     </div>
                 ))}
                 <button onClick={handleAddStage} className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 font-medium hover:border-stone-800 hover:text-stone-800 transition-all flex justify-center items-center space-x-2 bg-stone-50 hover:bg-white">
                     <PlusIcon />
                     <span>Add New Stage</span>
                 </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 z-20 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                     <div className="flex justify-between items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">Overall Project Total</p>
                            <p className="text-3xl font-serif font-bold text-stone-900">${calculateOverallTotal(project).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={onCancel} className="px-6 py-2.5 text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 font-medium transition-colors">Cancel</button>
                            <button onClick={handleSubmit} className="px-8 py-2.5 text-white bg-stone-900 rounded-lg hover:bg-stone-800 font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">Save Project</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;