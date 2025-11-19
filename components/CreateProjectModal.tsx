import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStage, ProjectType, Category, Section, SectionTask, SectionContentItem } from '../types';
import { PlusIcon, TrashIcon } from './common/Icons';

interface ProjectCreationWizardProps {
    onCancel: () => void;
    onComplete: (project: Project) => void;
    templates: Project[];
    projectTypes?: ProjectType[];
    categories: Category[];
    sections: Section[];
}

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const designSpaces = ["Living Room", "Kitchen", "Master Bedroom", "Guest Bedroom", "Bathroom", "Home Office", "Dining Room", "Entryway", "Basement", "Outdoor Space", "Laundry", "Walk-in Closet", "Powder Room", "Family Room", "Study", "Media Room"];
const qualityLevels: { [key: string]: string } = {
    'Standard': 'Quality finishes with practical solutions',
    'Premium': 'High-end finishes with custom elements',
    'Luxury': 'Luxury finishes with bespoke solutions'
};

// Calculations
const calculateTaskTotal = (task: SectionTask) => {
    // Logic: If user enters estimated hours (actualHours), use it. Otherwise use suggested (estimateHours).
    const userHours = task.actualHours;
    // Check if user has entered a value (number or 0, but not undefined/null/empty)
    const hasUserHours = userHours !== undefined && userHours !== null; 
    const hours = hasUserHours ? Number(userHours) : (task.estimateHours || 0);
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

const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = ['Basic Information', 'Spaces & Details', 'Project Stages', 'Preview'];
    return (
        <div className="flex items-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index + 1 <= currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {index + 1}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${index + 1 <= currentStep ? 'text-black' : 'text-gray-500'}`}>{step}</span>
                    </div>
                    {index < steps.length - 1 && <div className="flex-auto border-t-2 transition duration-500 ease-in-out mx-4 border-gray-300"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

// Task Row Component for Editor
const TaskRow = ({ task, onTaskChange, onDeleteTask }: { task: SectionTask, onTaskChange: (field: keyof SectionTask, value: any) => void, onDeleteTask: () => void }) => {
    const handleNumericInputChange = (value: string): number | undefined => {
        if (value === '') return undefined;
        const num = parseFloat(value);
        return isNaN(num) || num < 0 ? 0 : num;
    };

    return (
        <div className="grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-gray-50 bg-white border border-gray-100 mb-1">
            <div className="col-span-4 md:col-span-3">
                <input type="text" value={task.name} onChange={e => onTaskChange('name', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm bg-white text-black focus:ring-1 focus:ring-black focus:border-black" placeholder="Task Name"/>
            </div>
            <div className="col-span-2 md:col-span-2 text-center">
                 <div className="w-full px-2 py-1 bg-gray-100 border border-transparent rounded-md text-sm text-gray-600 cursor-not-allowed font-medium" title="Suggested Hours (from Template)">
                    {task.estimateHours}
                 </div>
            </div>
            <div className="col-span-2 md:col-span-2">
                 <input 
                    type="number" 
                    min="0" 
                    value={task.actualHours ?? ''} 
                    onChange={e => onTaskChange('actualHours', handleNumericInputChange(e.target.value))} 
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-center bg-white text-black focus:ring-1 focus:ring-black focus:border-black placeholder-gray-300" 
                    placeholder={task.estimateHours.toString()}
                    title="Your Estimate (Leave blank to use Suggested)"
                 />
            </div>
            <div className="col-span-2 md:col-span-2">
                <input 
                    type="number" 
                    min="0" 
                    value={task.estimateCost ?? ''} 
                    onChange={e => onTaskChange('estimateCost', handleNumericInputChange(e.target.value))} 
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-center bg-white text-black focus:ring-1 focus:ring-black focus:border-black" 
                    placeholder="$"
                />
            </div>
            <div className="col-span-2 md:col-span-2 text-center font-bold text-sm text-black">
                ${calculateTaskTotal(task).toFixed(0)}
            </div>
            <div className="col-span-1 justify-self-center">
                <button onClick={onDeleteTask} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="h-4 w-4"/></button>
            </div>
       </div>
    );
};

// Read-only Task Row for Preview
const PreviewTaskRow = ({ task }: { task: SectionTask }) => {
    const userHours = task.actualHours;
    const hasUserHours = userHours !== undefined && userHours !== null;
    const hoursUsed = hasUserHours ? Number(userHours) : (task.estimateHours || 0);

    return (
        <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
            <td className="py-2 px-2 text-black text-sm">{task.name}</td>
            <td className="py-2 px-2 text-center text-gray-600 text-sm">{task.estimateHours}</td>
            <td className="py-2 px-2 text-center text-sm">
                {hasUserHours ? (
                    <span className="font-bold text-black">{userHours}</span>
                ) : (
                    <span className="text-gray-400 italic" title="Using Suggested">{task.estimateHours}</span>
                )}
            </td>
            <td className="py-2 px-2 text-center text-gray-600 text-sm">${task.estimateCost?.toFixed(0)}</td>
            <td className="py-2 px-2 text-center font-bold text-black text-sm">${(hoursUsed * (task.estimateCost || 0)).toFixed(0)}</td>
        </tr>
    );
};

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({ onCancel, onComplete, templates, projectTypes = [], categories, sections }) => {
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [projectName, setProjectName] = useState('');
    const [budgetMin, setBudgetMin] = useState<number | ''>('');
    const [budgetMax, setBudgetMax] = useState<number | ''>('');
    const [timelineMin, setTimelineMin] = useState<number | ''>('');
    const [timelineMax, setTimelineMax] = useState<number | ''>('');

    // Step 2 State
    const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
    const [totalArea, setTotalArea] = useState<number | ''>('');
    const [qualityLevel, setQualityLevel] = useState<'Standard' | 'Premium' | 'Luxury' | null>(null);

    // Step 3 State
    const [stage3View, setStage3View] = useState<'type' | 'template'>('type');
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
    const [customTypeName, setCustomTypeName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Project | 'BLANK' | null>(null);
    const [stages, setStages] = useState<ProjectStage[]>([]);

    useEffect(() => {
        if (selectedTemplate) {
            if (selectedTemplate === 'BLANK') {
                setStages([]);
            } else {
                setStages(deepCopy(selectedTemplate.stages));
            }
        }
    }, [selectedTemplate]);
    
    // --- Stage Manipulation Handlers ---
    
    const handleStageNameChange = (index: number, newName: string) => {
        setStages(prevStages => 
            prevStages.map((stage, i) => i === index ? { ...stage, name: newName } : stage)
        );
    };

    const handleDeleteStage = (index: number) => {
        setStages(prevStages => prevStages.filter((_, i) => i !== index));
    };

    const handleAddStage = () => {
        const newStage: ProjectStage = {
            id: newId('stage-temp'),
            name: `Stage ${stages.length + 1}`,
            sections: [],
        };
        setStages(prevStages => [...prevStages, newStage]);
    };

    const handleAddSectionToStage = (stageIndex: number, sectionId: string) => {
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

        setStages(prevStages => prevStages.map((stage, i) => 
            i === stageIndex ? {...stage, sections: [...stage.sections, newSection]} : stage
        ));
    };

    const handleDeleteSectionFromStage = (stageIndex: number, sectionIndex: number) => {
        setStages(prevStages => prevStages.map((stage, i) => 
            i === stageIndex ? { ...stage, sections: stage.sections.filter((_, si) => si !== sectionIndex) } : stage
        ));
    };

    const handleAddCategoryToSection = (stageIndex: number, sectionIndex: number, categoryIdToAdd: string) => {
        const categoryTemplate = categories.find(c => c.id === categoryIdToAdd);
        if (!categoryTemplate) return;

        const newContentItem: SectionContentItem = {
            categoryId: categoryTemplate.id,
            name: categoryTemplate.name,
            tasks: categoryTemplate.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 0, estimateCost: 0 })),
            subcategories: categoryTemplate.subcategories.map(sub => ({
                ...deepCopy(sub),
                id: newId('sec-sub'),
                tasks: sub.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 0, estimateCost: 0 }))
            }))
        };

        setStages(prevStages => prevStages.map((stage, i) => {
            if (i !== stageIndex) return stage;
            return {
                ...stage,
                sections: stage.sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
                    if (section.content.some(c => c.categoryId === categoryIdToAdd)) return section; 
                    return { ...section, content: [...section.content, newContentItem] };
                })
            };
        }));
    };

    const handleDeleteCategoryFromSection = (stageIndex: number, sectionIndex: number, contentIndex: number) => {
        setStages(prevStages => prevStages.map((stage, i) => {
            if (i !== stageIndex) return stage;
            return {
                ...stage,
                sections: stage.sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
                    return { ...section, content: section.content.filter((_, ci) => ci !== contentIndex) };
                })
            };
        }));
    };

    const handleAddTask = (stageIndex: number, sectionIndex: number, contentIndex: number, subcategoryIndex: number | null) => {
        const newTask: SectionTask = { id: newId('task'), name: '', estimateHours: 0, estimateCost: 0 };
        setStages(prevStages => prevStages.map((stage, i) => {
            if (i !== stageIndex) return stage;
            return {
                ...stage,
                sections: stage.sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
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
                        newContent[contentIndex] = { ...newContent[contentIndex], subcategories: newSubcategories };
                    }
                    return { ...section, content: newContent };
                })
            };
        }));
    };

    const handleDeleteTask = (stageIndex: number, sectionIndex: number, contentIndex: number, taskIndex: number, subcategoryIndex: number | null) => {
        setStages(prevStages => prevStages.map((stage, i) => {
            if (i !== stageIndex) return stage;
            return {
                ...stage,
                sections: stage.sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
                    const newContent = [...section.content];
                    if (subcategoryIndex === null) {
                        newContent[contentIndex] = {
                            ...newContent[contentIndex],
                            tasks: newContent[contentIndex].tasks.filter((_, ti) => ti !== taskIndex)
                        };
                    } else {
                        const newSubcategories = [...newContent[contentIndex].subcategories];
                        newSubcategories[subcategoryIndex] = {
                            ...newSubcategories[subcategoryIndex],
                            tasks: newSubcategories[subcategoryIndex].tasks.filter((_, ti) => ti !== taskIndex)
                        };
                        newContent[contentIndex] = { ...newContent[contentIndex], subcategories: newSubcategories };
                    }
                    return { ...section, content: newContent };
                })
            };
        }));
    };

    const handleTaskChange = (stageIndex: number, sectionIndex: number, contentIndex: number, taskIndex: number, subcategoryIndex: number | null, field: keyof SectionTask, value: any) => {
        setStages(prevStages => prevStages.map((stage, i) => {
            if (i !== stageIndex) return stage;
            return {
                ...stage,
                sections: stage.sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
                    const newContent = [...section.content];
                    if (subcategoryIndex === null) {
                        const newTasks = [...newContent[contentIndex].tasks];
                        newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
                        newContent[contentIndex] = { ...newContent[contentIndex], tasks: newTasks };
                    } else {
                        const newSubcategories = [...newContent[contentIndex].subcategories];
                        const newTasks = [...newSubcategories[subcategoryIndex].tasks];
                        newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
                        newSubcategories[subcategoryIndex] = { ...newSubcategories[subcategoryIndex], tasks: newTasks };
                        newContent[contentIndex] = { ...newContent[contentIndex], subcategories: newSubcategories };
                    }
                    return { ...section, content: newContent };
                })
            };
        }));
    };

    // --- End Stage Handlers ---

    const handleSpaceToggle = (space: string) => {
        setSelectedSpaces(prev => prev.includes(space) ? prev.filter(s => s !== space) : [...prev, space]);
    };

    const isStep1Valid = projectName && budgetMin !== '' && budgetMax !== '' && timelineMin !== '' && timelineMax !== '';
    const isStep2Valid = selectedSpaces.length > 0 && totalArea !== '' && qualityLevel;
    const isStep3Valid = !!selectedTemplate;
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const filteredTemplates = useMemo(() => {
        if (!selectedTypeId) return [];
        const selectedTypeName = projectTypes.find(pt => pt.id === selectedTypeId)?.name;
        return templates.filter(t => t.projectType === selectedTypeName);
    }, [selectedTypeId, templates, projectTypes]);

    const currentProjectTypeName = customTypeName.trim() || projectTypes.find(pt => pt.id === selectedTypeId)?.name;

    const handleSubmit = () => {
        if (!currentProjectTypeName) {
            alert("Project type is not defined.");
            return;
        }
    
        const templateDescription = (selectedTemplate && selectedTemplate !== 'BLANK')
            ? (selectedTemplate as Project).projectDescription
            : '';
    
        const finalProject: Project = {
            id: newId('proj'),
            name: projectName,
            clientAddress: '',
            projectType: currentProjectTypeName!,
            projectDescription: templateDescription,
            stages: stages.map(stage => ({ ...stage, id: newId('stage') })),
            budgetMin: Number(budgetMin),
            budgetMax: Number(budgetMax),
            timelineMin: Number(timelineMin),
            timelineMax: Number(timelineMax),
            spaces: selectedSpaces,
            totalArea: Number(totalArea),
            qualityLevel: qualityLevel!,
        };
    
        onComplete(finalProject);
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">1. Basic Information</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (USD) *</label>
                <div className="flex items-center space-x-2">
                    <input type="number" placeholder="Min" value={budgetMin} onChange={e => setBudgetMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                    <span className="text-gray-500">to</span>
                    <input type="number" placeholder="Max" value={budgetMax} onChange={e => setBudgetMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (Weeks) *</label>
                <div className="flex items-center space-x-2">
                     <input type="number" placeholder="Min" value={timelineMin} onChange={e => setTimelineMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                    <span className="text-gray-500">to</span>
                    <input type="number" placeholder="Max" value={timelineMax} onChange={e => setTimelineMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
                </div>
            </div>
        </div>
    );
    
    const renderStep2 = () => (
         <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">2. Spaces & Project Details</h3>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Spaces to be Designed *</label>
                 <div className="p-3 border border-black rounded-md max-h-40 overflow-y-auto">
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {designSpaces.map(space => (
                             <label key={space} className="flex items-center space-x-2 text-sm">
                                 <input type="checkbox" checked={selectedSpaces.includes(space)} onChange={() => handleSpaceToggle(space)} className="bg-white rounded text-black focus:ring-black border-black"/>
                                 <span className="text-black">{space}</span>
                             </label>
                         ))}
                     </div>
                 </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (sq ft) *</label>
                <input type="number" value={totalArea} onChange={e => setTotalArea(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-black rounded-md bg-white text-black"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Level *</label>
                <div className="space-y-2">
                    {Object.entries(qualityLevels).map(([level, desc]) => (
                         <label key={level} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${qualityLevel === level ? 'border-black ring-1 ring-black' : 'border-black'}`}>
                            <input type="radio" name="quality" value={level} checked={qualityLevel === level} onChange={() => setQualityLevel(level as any)} className="h-4 w-4 text-black focus:ring-black border-black"/>
                            <div className="ml-3">
                                <span className="font-semibold text-black">{level}</span>
                                <p className="text-xs text-gray-600">{desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold text-gray-700">3. Project Stages</h3>
                 {selectedTemplate && (
                     <button onClick={() => {setSelectedTemplate(null); setStage3View('template');}} className="text-sm text-blue-600 hover:underline">Change Template</button>
                 )}
            </div>
            
            {stage3View === 'type' ? (
                <>
                    <h4 className="font-medium text-gray-600">Choose a Project Type</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {projectTypes.map(type => (
                            <button key={type.id} onClick={() => { setSelectedTypeId(type.id); setCustomTypeName(''); setStage3View('template'); }} className="text-center p-3 border border-black rounded-lg hover:shadow-md hover:bg-gray-50">
                                <span className="font-semibold text-black">{type.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="text-center my-2 text-gray-500 text-sm">OR</div>
                    <form onSubmit={(e) => { e.preventDefault(); if(customTypeName.trim()){ setSelectedTypeId(null); setStage3View('template');} }} className="flex gap-2">
                        <input type="text" placeholder="Define a custom type..." value={customTypeName} onChange={(e) => setCustomTypeName(e.target.value)} className="flex-grow px-3 py-2 border border-black rounded-md bg-white text-black"/>
                        <button type="submit" disabled={!customTypeName.trim()} className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400">Next</button>
                    </form>
                </>
            ) : !selectedTemplate ? (
                <>
                    <button onClick={() => setStage3View('type')} className="text-sm font-medium text-black hover:text-gray-700 mb-2">&larr; Back to Types</button>
                    <h4 className="font-medium text-gray-600">Select a Starting Point for <span className="font-bold">"{currentProjectTypeName}"</span></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-1">
                        <div onClick={() => setSelectedTemplate('BLANK')} className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50`}>
                            <h5 className="font-bold text-black">Start with a blank project</h5>
                            <p className="text-sm text-gray-600">Build your project from the ground up.</p>
                        </div>
                        {filteredTemplates.map(template => (
                            <div key={template.id} onClick={() => setSelectedTemplate(template)} className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50`}>
                                <h5 className="font-bold text-black">{template.name}</h5>
                                <p className="text-sm text-gray-600 line-clamp-2">{template.projectDescription}</p>
                            </div>
                        ))}
                        {selectedTypeId && filteredTemplates.length === 0 && <p className="text-gray-500 text-center col-span-2">No templates found. Start blank or go back.</p>}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                     {/* Full Editor UI */}
                     {stages.map((stage, stageIdx) => (
                         <div key={stage.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-300 space-y-4">
                             <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                 <input type="text" value={stage.name} onChange={e => handleStageNameChange(stageIdx, e.target.value)} className="text-lg font-bold text-black bg-white focus:outline-none focus:bg-gray-50 p-1 rounded-md w-full" placeholder="Stage Name"/>
                                 <div className="flex items-center space-x-4">
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-medium text-gray-500">Total</p>
                                        <p className="text-lg font-bold text-black">${calculateStageTotal(stage).toFixed(0)}</p>
                                    </div>
                                    <button onClick={() => handleDeleteStage(stageIdx)} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-black rounded-md"><TrashIcon className="h-5 w-5"/></button>
                                 </div>
                             </div>
                             
                             {/* Sections List */}
                             <div className="space-y-4">
                                {stage.sections.map((section, sectionIdx) => (
                                    <div key={section.id} className="border border-gray-300 rounded-md p-3 bg-gray-50/50">
                                         <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-md font-semibold text-gray-700">{section.name}</h4>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-bold text-gray-700">${calculateSectionTotal(section).toFixed(0)}</span>
                                                <button onClick={() => handleDeleteSectionFromStage(stageIdx, sectionIdx)} className="p-1 text-gray-500 hover:text-red-600 rounded-md"><TrashIcon className="h-4 w-4"/></button>
                                            </div>
                                        </div>
                                        
                                        {/* Categories/Tasks */}
                                         <div className="space-y-2">
                                             {section.content.map((contentItem, contentIdx) => (
                                                 <div key={contentItem.categoryId} className="bg-white border border-gray-200 rounded p-2">
                                                      <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-gray-600 uppercase">{contentItem.name}</span>
                                                            <button onClick={() => handleDeleteCategoryFromSection(stageIdx, sectionIdx, contentIdx)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-3 w-3"/></button>
                                                      </div>
                                                      {/* Tasks Header */}
                                                       { (contentItem.tasks.length > 0 || contentItem.subcategories.some(s => s.tasks.length > 0)) &&
                                                            <div className="grid grid-cols-12 gap-2 px-2 py-2 mb-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-50 rounded-t-md border-b border-gray-200">
                                                                <div className="col-span-4 md:col-span-3">Task</div>
                                                                <div className="col-span-2 text-center">Sugg. Hrs</div>
                                                                <div className="col-span-2 text-center">Your Est.</div>
                                                                <div className="col-span-2 text-center">Cost/Hr</div>
                                                                <div className="col-span-2 text-center">Total</div>
                                                                <div className="col-span-1"></div>
                                                            </div>
                                                       }
                                                      
                                                      <div className="space-y-1">
                                                          {contentItem.tasks.map((task, taskIdx) => (
                                                              <TaskRow 
                                                                key={task.id} 
                                                                task={task} 
                                                                onTaskChange={(field, val) => handleTaskChange(stageIdx, sectionIdx, contentIdx, taskIdx, null, field, val)}
                                                                onDeleteTask={() => handleDeleteTask(stageIdx, sectionIdx, contentIdx, taskIdx, null)}
                                                              />
                                                          ))}
                                                           <button onClick={() => handleAddTask(stageIdx, sectionIdx, contentIdx, null)} className="text-xs text-blue-600 hover:underline px-2">+ Add Task</button>
                                                      </div>
                                                      
                                                      {/* Subcategories */}
                                                       {contentItem.subcategories.map((sub, subIdx) => (
                                                         <div key={sub.id} className="mt-2 pl-2 border-l-2 border-gray-100">
                                                             <span className="text-xs font-semibold text-gray-500">{sub.name}</span>
                                                             <div className="space-y-1 mt-1">
                                                                 {sub.tasks.map((task, taskIdx) => (
                                                                      <TaskRow 
                                                                        key={task.id} 
                                                                        task={task} 
                                                                        onTaskChange={(field, val) => handleTaskChange(stageIdx, sectionIdx, contentIdx, taskIdx, subIdx, field, val)}
                                                                        onDeleteTask={() => handleDeleteTask(stageIdx, sectionIdx, contentIdx, taskIdx, subIdx)}
                                                                      />
                                                                 ))}
                                                                 <button onClick={() => handleAddTask(stageIdx, sectionIdx, contentIdx, subIdx)} className="text-xs text-blue-600 hover:underline px-2">+ Add Task</button>
                                                             </div>
                                                         </div>
                                                      ))}
                                                 </div>
                                             ))}
                                             <div className="mt-2">
                                                <select 
                                                    onChange={e => { if (e.target.value) handleAddCategoryToSection(stageIdx, sectionIdx, e.target.value); e.target.value=""; }} 
                                                    className="text-xs border border-gray-300 rounded p-1 w-full"
                                                >
                                                    <option value="">+ Add Category</option>
                                                    {categories.filter(cat => !section.content.some(c => c.categoryId === cat.id)).map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                             </div>
                                         </div>
                                    </div>
                                ))}
                                <select 
                                    onChange={e => { if (e.target.value) handleAddSectionToStage(stageIdx, e.target.value); e.target.value=""; }} 
                                    className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                                >
                                    <option value="">+ Add Section from Templates</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </div>
                         </div>
                     ))}

                     <button onClick={handleAddStage} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-black hover:text-black transition-colors flex justify-center items-center space-x-2">
                         <PlusIcon />
                         <span>Add New Stage</span>
                     </button>
                </div>
            )}
        </div>
    );
    
    const renderStep4 = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">4. Preview & Confirm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 border rounded-md bg-gray-50/50">
                    <div className="flex justify-between items-start">
                        <div><h4 className="font-semibold text-black">Basic Information</h4></div>
                        <button onClick={() => setStep(1)} className="text-sm font-medium text-black hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-black"><strong>Project Name:</strong> {projectName}</p>
                    <p className="text-sm text-black"><strong>Budget:</strong> ${Number(budgetMin).toLocaleString()} - ${Number(budgetMax).toLocaleString()}</p>
                    <p className="text-sm text-black"><strong>Timeline:</strong> {timelineMin} - {timelineMax} weeks</p>
                </div>
                <div className="space-y-2 p-4 border rounded-md bg-gray-50/50">
                    <div className="flex justify-between items-start">
                        <div><h4 className="font-semibold text-black">Details</h4></div>
                        <button onClick={() => setStep(2)} className="text-sm font-medium text-black hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-black"><strong>Spaces:</strong> {selectedSpaces.join(', ')}</p>
                    <p className="text-sm text-black"><strong>Total Area:</strong> {totalArea} sq ft</p>
                    <p className="text-sm text-black"><strong>Quality:</strong> {qualityLevel}</p>
                    <p className="text-sm text-black"><strong>Type:</strong> {currentProjectTypeName}</p>
                </div>
            </div>
            
             <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-black">Project Staging & Estimates</h4>
                    <button onClick={() => setStep(3)} className="text-sm font-medium text-black hover:underline">Edit Stages</button>
                </div>
                
                {stages.length > 0 ? (
                    <div className="space-y-4">
                         {stages.map((stage, index) => (
                             <details key={index} open className="bg-white border border-black rounded-lg overflow-hidden">
                                 <summary className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer">
                                     <span className="font-bold text-black">{stage.name}</span>
                                     <span className="font-bold text-black">${calculateStageTotal(stage).toFixed(0)}</span>
                                 </summary>
                                 <div className="p-4 space-y-4">
                                     {stage.sections.map(section => (
                                         <div key={section.id}>
                                             <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-2">
                                                 <span className="font-semibold text-gray-700">{section.name}</span>
                                                 <span className="font-medium text-gray-700">${calculateSectionTotal(section).toFixed(0)}</span>
                                             </div>
                                             <div className="pl-2 space-y-2">
                                                 {section.content.map(content => (
                                                     <div key={content.categoryId}>
                                                         <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">{content.name}</h5>
                                                         <table className="w-full text-left">
                                                             <thead className="text-[10px] text-gray-400 uppercase">
                                                                <tr>
                                                                    <th className="font-normal px-2">Task</th>
                                                                    <th className="font-normal px-2 text-center">Sugg. Hrs</th>
                                                                    <th className="font-normal px-2 text-center">Est. Hrs</th>
                                                                    <th className="font-normal px-2 text-center">Cost</th>
                                                                    <th className="font-normal px-2 text-center">Total</th>
                                                                </tr>
                                                             </thead>
                                                             <tbody>
                                                                {content.tasks.map(task => <PreviewTaskRow key={task.id} task={task}/>)}
                                                                {content.subcategories.map(sub => (
                                                                    <React.Fragment key={sub.id}>
                                                                        <tr><td colSpan={5} className="py-1 px-2 text-xs font-semibold text-gray-500 italic">{sub.name}</td></tr>
                                                                        {sub.tasks.map(task => <PreviewTaskRow key={task.id} task={task}/>)}
                                                                    </React.Fragment>
                                                                ))}
                                                             </tbody>
                                                         </table>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                     {stage.sections.length === 0 && <p className="text-sm text-gray-500 italic">No sections in this stage.</p>}
                                 </div>
                             </details>
                         ))}
                         <div className="flex justify-end pt-2">
                             <div className="text-right">
                                 <p className="text-sm text-gray-500">Total Estimated Project Value</p>
                                 <p className="text-2xl font-bold text-black">
                                     ${stages.reduce((acc, stage) => acc + calculateStageTotal(stage), 0).toFixed(2)}
                                 </p>
                             </div>
                         </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 p-4 border border-dashed rounded-lg text-center">No stages defined for this project.</p>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-black">Create a New Project</h1>
                <p className="text-gray-600 mt-1">Follow the steps to define your new project.</p>
            </header>
            <div className="bg-white rounded-lg shadow-md border border-black w-full flex flex-col h-[80vh]">
                <div className="p-6 overflow-y-auto flex-1">
                    <Stepper currentStep={step} />
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>
                <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
                    <button onClick={onCancel} className="px-4 py-2 text-black bg-white border border-black rounded-md hover:bg-gray-100">Cancel</button>
                    <div className="flex items-center space-x-2">
                        {step > 1 && <button onClick={prevStep} className="px-4 py-2 text-black bg-white border border-black rounded-md hover:bg-gray-100">Back</button>}
                        {step < 4 && <button onClick={nextStep} disabled={ (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid) } className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400">Next</button>}
                        {step === 4 && <button onClick={handleSubmit} className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800">Create Project</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCreationWizard;