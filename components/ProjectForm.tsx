import React, { useState } from 'react';
import { Project, ProjectStage, Section, Category, SectionTask, SectionContentItem, ProjectType } from '../types';
import { PlusIcon, TrashIcon } from './common/Icons';

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
        <div className="grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-gray-50">
            <div className="col-span-4">
                <input type="text" value={task.name} onChange={e => onTaskChange('name', e.target.value)} className="w-full px-2 py-1 border border-black rounded-md text-sm bg-white text-black" placeholder="Task Name"/>
            </div>
            <div className="col-span-2">
                 <input type="number" min="0" value={task.estimateHours ?? ''} onChange={e => onTaskChange('estimateHours', handleNumericInputChange(e.target.value))} className="w-full px-2 py-1 border border-black rounded-md text-sm text-center bg-white text-black" placeholder="Hours"/>
            </div>
            <div className="col-span-2">
                <input type="number" min="0" value={task.estimateCost ?? ''} onChange={e => onTaskChange('estimateCost', handleNumericInputChange(e.target.value))} className="w-full px-2 py-1 border border-black rounded-md text-sm text-center bg-white text-black" placeholder="Cost"/>
            </div>
            <div className="col-span-2">
                <input type="number" min="0" value={task.actualHours ?? ''} onChange={e => onTaskChange('actualHours', handleNumericInputChange(e.target.value))} className="w-full px-2 py-1 border border-black rounded-md text-sm text-center bg-white text-black" placeholder="Hours"/>
            </div>
            <div className="col-span-1 text-center font-semibold text-sm text-black">
                ${calculateTaskTotal(task).toFixed(2)}
            </div>
            <div className="col-span-1 justify-self-center">
                <button onClick={onDeleteTask} className="p-1 text-black hover:text-gray-700"><TrashIcon/></button>
            </div>
       </div>
    );

    return (
        <div className="space-y-6 pb-24">
            <header className="mb-8">
                 <h1 className="text-3xl font-bold text-black">
                    {initialData?.id ? `Edit ${isCustomerView ? 'Project' : 'Template'}` : `Create New ${isCustomerView ? 'Project' : 'Template'}`}
                 </h1>
            </header>
            <div className="bg-white p-8 rounded-lg shadow-md border border-black space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{isCustomerView ? 'Project' : 'Template'} Name *</label>
                        <input type="text" value={project.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black" />
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                        {isCustomerView ? (
                            <input 
                                type="text" 
                                value={project.projectType} 
                                readOnly
                                className="w-full px-3 py-2 border border-black rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed" 
                            />
                        ) : projectTypes ? (
                             <select
                                value={project.projectType}
                                onChange={e => handleInputChange('projectType', e.target.value as string)}
                                className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
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
                                className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black" 
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
                        <div className="flex items-center space-x-2">
                            <input type="number" placeholder="Min" value={project.budgetMin ?? ''} onChange={e => handleInputChange('budgetMin', handleNumericInputChange(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                            <span className="text-gray-500">to</span>
                            <input type="number" placeholder="Max" value={project.budgetMax ?? ''} onChange={e => handleInputChange('budgetMax', handleNumericInputChange(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (Weeks)</label>
                        <div className="flex items-center space-x-2">
                             <input type="number" placeholder="Min" value={project.timelineMin ?? ''} onChange={e => handleInputChange('timelineMin', handleNumericInputChange(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                            <span className="text-gray-500">to</span>
                            <input type="number" placeholder="Max" value={project.timelineMax ?? ''} onChange={e => handleInputChange('timelineMax', handleNumericInputChange(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (sq ft)</label>
                        <input type="number" value={project.totalArea ?? ''} onChange={e => handleInputChange('totalArea', handleNumericInputChange(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quality Level</label>
                        <select
                            value={project.qualityLevel || ''}
                            onChange={e => handleInputChange('qualityLevel', e.target.value as Project['qualityLevel'])}
                            className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
                        >
                            <option value="" disabled>-- Select a level --</option>
                            {Object.entries(qualityLevels).map(([level, desc]) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spaces to be Designed</label>
                    <div className="p-3 border border-black rounded-md max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {designSpaces.map(space => (
                                <label key={space} className="flex items-center space-x-2 text-sm text-black">
                                    <input
                                        type="checkbox"
                                        checked={(project.spaces || []).includes(space)}
                                        onChange={() => handleSpaceChange(space)}
                                        className="bg-white rounded text-black focus:ring-black border-black"
                                    />
                                    <span>{space}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>


                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                    <input type="text" value={project.clientAddress} onChange={e => handleInputChange('clientAddress', e.target.value as string)} className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                    <textarea value={project.projectDescription} onChange={e => handleInputChange('projectDescription', e.target.value as string)} rows={3} className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-black" />
                </div>
            </div>

            <div className="space-y-4">
                 <h2 className="text-2xl font-bold text-black">Stages</h2>
                 {project.stages.map(stage => (
                     <div key={stage.id} className="bg-white p-6 rounded-lg shadow-md border border-black space-y-4">
                         <div className="flex justify-between items-center pb-2 border-b">
                             <input type="text" value={stage.name} onChange={e => handleStageChange(stage.id, e.target.value)} className="text-2xl font-bold text-black bg-white focus:outline-none focus:bg-gray-50 p-1 rounded-md w-full" />
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500">Stage Total</p>
                                    <p className="text-2xl font-bold text-black">${calculateStageTotal(stage).toFixed(2)}</p>
                                </div>
                                <button onClick={() => handleDeleteStage(stage.id)} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-black rounded-md"><TrashIcon className="h-5 w-5"/></button>
                              </div>
                         </div>
                         <div className="space-y-4">
                            {stage.sections.map(section => (
                                <div key={section.id} className="border border-black rounded-md p-4">
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">{section.name}</h3>
                                            <p className="text-sm text-gray-500 italic mb-4">{section.description}</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-medium text-gray-500">Section Total</p>
                                                <p className="text-xl font-bold text-black">${calculateSectionTotal(section).toFixed(2)}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteSectionFromStage(stage.id, section.id)} 
                                                className="p-2 text-gray-500 hover:bg-gray-200 hover:text-black rounded-md"
                                                title={`Delete section ${section.name}`}
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </div>
                                     {section.content.map((contentItem, contentIdx) => (
                                         <div key={contentItem.categoryId} className="mt-2">
                                              <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-gray-600">{contentItem.name}</h4>
                                                <button onClick={() => handleDeleteCategoryFromSection(stage.id, section.id, contentItem.categoryId)} className="p-1 text-black hover:bg-gray-200 rounded-md" title={`Remove ${contentItem.name} category`}>
                                                    <TrashIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                             <div className="grid grid-cols-12 gap-2 items-center mt-2 pl-2 pr-2 md:pl-6 md:pr-4 text-xs font-bold text-gray-500 uppercase">
                                                <div className="col-span-4">Task Name</div>
                                                <div className="col-span-2 text-center">Estimated Hours</div>
                                                <div className="col-span-2 text-center">Cost/Hr ($)</div>
                                                <div className="col-span-2 text-center">Actual Hours</div>
                                                <div className="col-span-1 text-center">Total ($)</div>
                                                <div className="col-span-1"></div>
                                            </div>

                                             <div className="pl-4 mt-1 space-y-2">
                                                 {contentItem.tasks.map((task, taskIdx) => (
                                                     <TaskRow 
                                                        key={task.id}
                                                        task={task}
                                                        onTaskChange={(field, value) => handleTaskChange(stage.id, section.id, contentIdx, taskIdx, null, field, value)}
                                                        onDeleteTask={() => handleDeleteTask(stage.id, section.id, contentIdx, task.id, null)}
                                                     />
                                                 ))}
                                                 <button onClick={() => handleAddTask(stage.id, section.id, contentIdx, null)} className="text-sm font-medium text-black hover:text-gray-700">+ Add Task</button>
                                             </div>

                                              {contentItem.subcategories.map((sub, subIdx) => (
                                                 <div key={sub.id} className="pl-4 mt-2">
                                                     <h5 className="font-medium text-gray-600">{sub.name}</h5>
                                                     <div className="pl-4 mt-1 space-y-2">
                                                         {sub.tasks.map((task, taskIdx) => (
                                                              <TaskRow 
                                                                key={task.id}
                                                                task={task}
                                                                onTaskChange={(field, value) => handleTaskChange(stage.id, section.id, contentIdx, taskIdx, subIdx, field, value)}
                                                                onDeleteTask={() => handleDeleteTask(stage.id, section.id, contentIdx, task.id, subIdx)}
                                                             />
                                                         ))}
                                                         <button onClick={() => handleAddTask(stage.id, section.id, contentIdx, subIdx)} className="text-sm font-medium text-black hover:text-gray-700">+ Add Task</button>
                                                     </div>
                                                 </div>
                                              ))}
                                         </div>
                                     ))}
                                     <div className="mt-4 pl-4">
                                        <select 
                                            onChange={e => {
                                                if (e.target.value) {
                                                    handleAddCategoryToSection(stage.id, section.id, e.target.value);
                                                }
                                                e.target.value = "";
                                            }}
                                            value=""
                                            className="text-sm bg-white text-black border border-black rounded-md focus:ring-black focus:border-black"
                                        >
                                            <option value="" disabled>-- Add category to section --</option>
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
                            <select onChange={e => {handleAddSectionToStage(stage.id, e.target.value); e.target.value = ""}} value="" className="mt-2 text-sm bg-white text-black border-black rounded-md focus:ring-black focus:border-black">
                                <option value="" disabled>-- Add a section from templates --</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                         </div>
                     </div>
                 ))}
                 <button onClick={handleAddStage} className="flex items-center space-x-2 bg-white text-black border border-black font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                     <PlusIcon />
                     <span>Add Stage</span>
                 </button>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-black z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex justify-between items-center py-4">
                        <div className="text-right flex-1">
                            <p className="text-lg font-medium text-gray-600">Overall Project Total</p>
                            <p className="text-3xl font-bold text-black">${calculateOverallTotal(project).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center ml-8">
                            <button onClick={onCancel} className="px-4 py-2 text-black bg-white border border-black rounded-md mr-2 hover:bg-gray-100">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;