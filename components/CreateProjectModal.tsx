
import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStage, ProjectType, Category, Section, SectionTask, SectionContentItem, SpaceDetails, SpaceSizeType } from '../types';
import { PlusIcon, TrashIcon, ChevronDownIcon } from './common/Icons';

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
const currencies = ['AUD', 'USD', 'EUR', 'GBP', 'CAD', 'NZD'];
const spaceSizes: SpaceSizeType[] = ['Small', 'Medium', 'Large', 'Custom'];

// Calculations
const calculateTaskTotal = (task: SectionTask) => {
    const userHours = task.actualHours;
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
        <div className="flex items-center justify-center mb-10 px-4">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center z-10">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${index + 1 <= currentStep ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-300 text-stone-400'}`}>
                            <span className="font-serif font-bold">{index + 1}</span>
                        </div>
                        <span className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${index + 1 <= currentStep ? 'text-stone-900' : 'text-stone-400'}`}>{step}</span>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 -mt-6 transition-colors duration-500 ${index + 1 < currentStep ? 'bg-stone-900' : 'bg-stone-200'}`}></div>}
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
        <div className="grid grid-cols-12 gap-2 items-center p-3 rounded-md bg-white border border-stone-100 hover:border-stone-300 hover:shadow-sm mb-1 transition-all">
            <div className="col-span-4 md:col-span-3">
                <input type="text" value={task.name} onChange={e => onTaskChange('name', e.target.value)} className="w-full px-2 py-1.5 border border-stone-200 rounded-md text-sm bg-white text-stone-900 focus:ring-1 focus:ring-stone-900 focus:border-stone-900" placeholder="Task Name"/>
            </div>
            <div className="col-span-2 md:col-span-2 text-center">
                 <div className="w-full px-2 py-1.5 bg-stone-50 border border-transparent rounded-md text-sm text-stone-500 cursor-not-allowed font-medium" title="Suggested Hours (from Template)">
                    {task.estimateHours}
                 </div>
            </div>
            <div className="col-span-2 md:col-span-2">
                 <input 
                    type="number" 
                    min="0" 
                    value={task.actualHours ?? ''} 
                    onChange={e => onTaskChange('actualHours', handleNumericInputChange(e.target.value))} 
                    className="w-full px-2 py-1.5 border border-stone-200 rounded-md text-sm text-center bg-white text-stone-900 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 placeholder-stone-300" 
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
                    className="w-full px-2 py-1.5 border border-stone-200 rounded-md text-sm text-center bg-white text-stone-900 focus:ring-1 focus:ring-stone-900 focus:border-stone-900" 
                    placeholder="$"
                />
            </div>
            <div className="col-span-2 md:col-span-2 text-center font-bold text-sm text-stone-900">
                ${calculateTaskTotal(task).toFixed(0)}
            </div>
            <div className="col-span-1 justify-self-center">
                <button onClick={onDeleteTask} className="p-1 text-stone-400 hover:text-red-600 transition-colors"><TrashIcon className="h-4 w-4"/></button>
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
        <tr className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50 transition-colors">
            <td className="py-2 px-2 text-stone-800 text-sm">{task.name}</td>
            <td className="py-2 px-2 text-center text-stone-500 text-sm">{task.estimateHours}</td>
            <td className="py-2 px-2 text-center text-sm">
                {hasUserHours ? (
                    <span className="font-bold text-stone-900">{userHours}</span>
                ) : (
                    <span className="text-stone-300 italic" title="Using Suggested">{task.estimateHours}</span>
                )}
            </td>
            <td className="py-2 px-2 text-center text-stone-500 text-sm">${task.estimateCost?.toFixed(0)}</td>
            <td className="py-2 px-2 text-center font-bold text-stone-900 text-sm">${(hoursUsed * (task.estimateCost || 0)).toFixed(0)}</td>
        </tr>
    );
};

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({ onCancel, onComplete, templates, projectTypes = [], categories, sections }) => {
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [projectName, setProjectName] = useState('');
    const [currency, setCurrency] = useState('AUD');
    const [budgetMin, setBudgetMin] = useState<number | ''>('');
    const [budgetMax, setBudgetMax] = useState<number | ''>('');
    const [timelineMin, setTimelineMin] = useState<number | ''>('');
    const [timelineMax, setTimelineMax] = useState<number | ''>('');

    // Step 2 State
    const [spaces, setSpaces] = useState<SpaceDetails[]>([]);
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
    // ... (Keep stage handlers same as before)
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

    // --- Spaces Handlers ---

    const handleAddSpace = (spaceName: string) => {
        setSpaces(prev => [
            ...prev,
            {
                id: newId('space'),
                name: spaceName,
                sizeType: 'Medium' // Default
            }
        ]);
    };

    const handleRemoveSpace = (spaceId: string) => {
        setSpaces(prev => prev.filter(s => s.id !== spaceId));
    };

    const handleSpaceUpdate = (spaceId: string, field: keyof SpaceDetails, value: any) => {
        setSpaces(prev => prev.map(s => s.id === spaceId ? { ...s, [field]: value } : s));
    };

    const handleDimensionUpdate = (spaceId: string, dim: 'length' | 'width' | 'height', value: number) => {
        setSpaces(prev => prev.map(s => {
            if (s.id !== spaceId) return s;
            const newDims = s.customDimensions || { length: 0, width: 0, height: 0 };
            return { ...s, customDimensions: { ...newDims, [dim]: value } };
        }));
    };


    const isStep1Valid = projectName && budgetMin !== '' && budgetMax !== '' && timelineMin !== '' && timelineMax !== '';
    const isStep2Valid = spaces.length > 0 && totalArea !== '' && qualityLevel;
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
            currency: currency,
            timelineMin: Number(timelineMin),
            timelineMax: Number(timelineMax),
            spaces: spaces,
            totalArea: Number(totalArea),
            qualityLevel: qualityLevel!,
        };
    
        onComplete(finalProject);
    };

    const renderStep1 = () => (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Basic Information</h3>
            <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Project Name *</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800 transition-colors" placeholder="e.g., Seaside Villa Renovation" />
            </div>
            <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Total Budget *</label>
                <div className="flex items-center space-x-4">
                    <div className="w-24 flex-shrink-0">
                        <select 
                            value={currency} 
                            onChange={e => setCurrency(e.target.value)}
                            className="w-full px-2 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800 font-medium"
                        >
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <input type="number" placeholder="Min" value={budgetMin} onChange={e => setBudgetMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800"/>
                    </div>
                    <span className="text-stone-400 font-serif italic">to</span>
                    <div className="flex-1">
                        <input type="number" placeholder="Max" value={budgetMax} onChange={e => setBudgetMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800"/>
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Timeline (Weeks) *</label>
                <div className="flex items-center space-x-4">
                     <input type="number" placeholder="Min" value={timelineMin} onChange={e => setTimelineMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800"/>
                    <span className="text-stone-400 font-serif italic">to</span>
                    <input type="number" placeholder="Max" value={timelineMax} onChange={e => setTimelineMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800"/>
                </div>
            </div>
        </div>
    );
    
    const renderStep2 = () => (
         <div className="space-y-6 max-w-3xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Spaces & Details</h3>
            <div>
                 <label className="block text-sm font-bold text-stone-700 mb-2">Spaces to be Designed *</label>
                 <div className="mb-4 relative">
                    <select 
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-stone-800 appearance-none cursor-pointer"
                        onChange={(e) => {
                            if (e.target.value) {
                                handleAddSpace(e.target.value);
                                e.target.value = "";
                            }
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>Add a space...</option>
                        {designSpaces.filter(ds => !spaces.some(s => s.name === ds)).map(space => (
                            <option key={space} value={space}>{space}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700">
                        <ChevronDownIcon className="h-5 w-5" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    {spaces.map((space, index) => (
                        <div key={space.id} className="p-4 border border-stone-200 rounded-lg bg-white animate-fadeIn">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-stone-900">{space.name}</h4>
                                <button onClick={() => handleRemoveSpace(space.id)} className="text-stone-400 hover:text-red-500">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 mb-1">Size Type</label>
                                    <select 
                                        value={space.sizeType} 
                                        onChange={(e) => handleSpaceUpdate(space.id, 'sizeType', e.target.value)}
                                        className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-stone-800 text-sm"
                                    >
                                        {spaceSizes.map(size => <option key={size} value={size}>{size}</option>)}
                                    </select>
                                </div>
                                {space.sizeType === 'Custom' && (
                                    <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-2 bg-white p-3 rounded-md border border-stone-200">
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">Length (ft)</label>
                                            <input 
                                                type="number" 
                                                value={space.customDimensions?.length || ''} 
                                                onChange={(e) => handleDimensionUpdate(space.id, 'length', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-stone-300 rounded text-sm bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">Width (ft)</label>
                                            <input 
                                                type="number" 
                                                value={space.customDimensions?.width || ''} 
                                                onChange={(e) => handleDimensionUpdate(space.id, 'width', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-stone-300 rounded text-sm bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">Height (ft)</label>
                                            <input 
                                                type="number" 
                                                value={space.customDimensions?.height || ''} 
                                                onChange={(e) => handleDimensionUpdate(space.id, 'height', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-stone-300 rounded text-sm bg-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {spaces.length === 0 && <p className="text-stone-500 italic text-sm text-center py-4">No spaces added yet. Select from dropdown above.</p>}
                 </div>
            </div>
            <div className="border-t border-stone-200 pt-4 mt-4">
                <label className="block text-sm font-bold text-stone-700 mb-2">Total Area (sq ft) *</label>
                <input type="number" value={totalArea} onChange={e => setTotalArea(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white text-stone-900 focus:outline-none focus:border-stone-800"/>
            </div>
            <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Quality Level *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(qualityLevels).map(([level, desc]) => (
                         <label key={level} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all text-center h-full justify-center hover:shadow-md ${qualityLevel === level ? 'border-stone-900 bg-stone-900 text-white shadow-lg transform scale-105' : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'}`}>
                            <input type="radio" name="quality" value={level} checked={qualityLevel === level} onChange={() => setQualityLevel(level as any)} className="hidden"/>
                            <span className="font-serif font-bold text-lg mb-1">{level}</span>
                            <p className={`text-xs ${qualityLevel === level ? 'text-stone-300' : 'text-stone-500'}`}>{desc}</p>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200">
                 <h3 className="text-xl font-serif font-bold text-stone-900">3. Project Stages</h3>
                 {selectedTemplate && (
                     <button onClick={() => {setSelectedTemplate(null); setStage3View('template');}} className="text-sm text-stone-500 hover:text-stone-900 underline">Change Template</button>
                 )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
            {stage3View === 'type' ? (
                <div className="max-w-2xl mx-auto">
                    <h4 className="font-medium text-stone-600 mb-4 text-center">Choose a Project Type</h4>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {projectTypes.map(type => (
                            <button key={type.id} onClick={() => { setSelectedTypeId(type.id); setCustomTypeName(''); setStage3View('template'); }} className="text-center p-6 border border-stone-200 rounded-xl hover:shadow-lg hover:border-stone-400 hover:bg-white transition-all bg-stone-50 group">
                                <span className="font-serif font-bold text-lg text-stone-800 group-hover:text-stone-900">{type.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-stone-200"></div>
                        <span className="flex-shrink-0 mx-4 text-stone-400 text-sm font-serif italic">OR</span>
                        <div className="flex-grow border-t border-stone-200"></div>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); if(customTypeName.trim()){ setSelectedTypeId(null); setStage3View('template');} }} className="flex gap-3">
                        <input type="text" placeholder="Define a custom type..." value={customTypeName} onChange={(e) => setCustomTypeName(e.target.value)} className="flex-grow px-4 py-3 border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-stone-800"/>
                        <button type="submit" disabled={!customTypeName.trim()} className="px-6 py-3 text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:bg-stone-300 transition-colors">Next</button>
                    </form>
                </div>
            ) : !selectedTemplate ? (
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => setStage3View('type')} className="text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 flex items-center space-x-1">
                        <span>&larr;</span><span>Back to Types</span>
                    </button>
                    <h4 className="font-serif font-medium text-stone-800 text-xl mb-6 text-center">Select a Starting Point for <span className="font-bold italic">"{currentProjectTypeName}"</span></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onClick={() => setSelectedTemplate('BLANK')} className={`p-6 border-2 border-stone-200 rounded-xl cursor-pointer hover:border-stone-800 hover:bg-white hover:shadow-md transition-all bg-stone-50 group`}>
                            <h5 className="font-serif font-bold text-lg text-stone-900 mb-2 group-hover:text-stone-800">Start with a blank project</h5>
                            <p className="text-sm text-stone-500">Build your project from the ground up.</p>
                        </div>
                        {filteredTemplates.map(template => (
                            <div key={template.id} onClick={() => setSelectedTemplate(template)} className={`p-6 border-2 border-stone-200 rounded-xl cursor-pointer hover:border-stone-800 hover:bg-white hover:shadow-md transition-all bg-stone-50 group`}>
                                <h5 className="font-serif font-bold text-lg text-stone-900 mb-2 group-hover:text-stone-800">{template.name}</h5>
                                <p className="text-sm text-stone-500 line-clamp-2">{template.projectDescription}</p>
                            </div>
                        ))}
                        {selectedTypeId && filteredTemplates.length === 0 && <p className="text-stone-400 text-center col-span-2 italic py-8">No templates found for this type. Start blank.</p>}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                     {/* Full Editor UI */}
                     {stages.map((stage, stageIdx) => (
                         <div key={stage.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6">
                             <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                                 <input type="text" value={stage.name} onChange={e => handleStageNameChange(stageIdx, e.target.value)} className="text-xl font-serif font-bold text-stone-900 bg-transparent focus:outline-none focus:bg-stone-50 p-2 rounded-md w-full" placeholder="Stage Name"/>
                                 <div className="flex items-center space-x-4">
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total</p>
                                        <p className="text-lg font-bold text-stone-900 font-serif">${calculateStageTotal(stage).toFixed(0)}</p>
                                    </div>
                                    <button onClick={() => handleDeleteStage(stageIdx)} className="p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="h-5 w-5"/></button>
                                 </div>
                             </div>
                             
                             {/* Sections List */}
                             <div className="space-y-6">
                                {stage.sections.map((section, sectionIdx) => (
                                    <div key={section.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50/30">
                                         <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-md font-serif font-bold text-stone-800">{section.name}</h4>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-bold text-stone-700">${calculateSectionTotal(section).toFixed(0)}</span>
                                                <button onClick={() => handleDeleteSectionFromStage(stageIdx, sectionIdx)} className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><TrashIcon className="h-4 w-4"/></button>
                                            </div>
                                        </div>
                                        
                                        {/* Categories/Tasks */}
                                         <div className="space-y-4">
                                             {section.content.map((contentItem, contentIdx) => (
                                                 <div key={contentItem.categoryId} className="bg-white border border-stone-100 rounded-lg p-3 shadow-sm">
                                                      <div className="flex justify-between items-center mb-2 border-b border-stone-50 pb-1">
                                                            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{contentItem.name}</span>
                                                            <button onClick={() => handleDeleteCategoryFromSection(stageIdx, sectionIdx, contentIdx)} className="text-stone-300 hover:text-red-500 transition-colors"><TrashIcon className="h-3 w-3"/></button>
                                                      </div>
                                                      
                                                      <div className="space-y-2">
                                                          {contentItem.tasks.map((task, taskIdx) => (
                                                              <TaskRow 
                                                                key={task.id} 
                                                                task={task} 
                                                                onTaskChange={(field, val) => handleTaskChange(stageIdx, sectionIdx, contentIdx, taskIdx, null, field, val)}
                                                                onDeleteTask={() => handleDeleteTask(stageIdx, sectionIdx, contentIdx, taskIdx, null)}
                                                              />
                                                          ))}
                                                           <button onClick={() => handleAddTask(stageIdx, sectionIdx, contentIdx, null)} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wide py-1">+ Add Task</button>
                                                      </div>
                                                      
                                                      {/* Subcategories */}
                                                       {contentItem.subcategories.map((sub, subIdx) => (
                                                         <div key={sub.id} className="mt-4 pl-4 border-l-2 border-stone-100">
                                                             <span className="text-xs font-bold text-stone-400 mb-2 block">{sub.name}</span>
                                                             <div className="space-y-2 mt-1">
                                                                 {sub.tasks.map((task, taskIdx) => (
                                                                      <TaskRow 
                                                                        key={task.id} 
                                                                        task={task} 
                                                                        onTaskChange={(field, val) => handleTaskChange(stageIdx, sectionIdx, contentIdx, taskIdx, subIdx, field, val)}
                                                                        onDeleteTask={() => handleDeleteTask(stageIdx, sectionIdx, contentIdx, taskIdx, subIdx)}
                                                                      />
                                                                 ))}
                                                                 <button onClick={() => handleAddTask(stageIdx, sectionIdx, contentIdx, subIdx)} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wide py-1">+ Add Task</button>
                                                             </div>
                                                         </div>
                                                      ))}
                                                 </div>
                                             ))}
                                             <div className="mt-3 pt-3 border-t border-stone-200/50">
                                                <select 
                                                    onChange={e => { if (e.target.value) handleAddCategoryToSection(stageIdx, sectionIdx, e.target.value); e.target.value=""; }} 
                                                    className="text-xs border border-stone-300 rounded-md p-2 w-full md:w-auto bg-white text-stone-700 focus:ring-stone-500 focus:border-stone-500"
                                                >
                                                    <option value="">+ Add Category to Section</option>
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
                                    className="w-full text-sm border border-dashed border-stone-300 rounded-lg p-3 bg-stone-50 text-stone-600 hover:bg-white hover:border-stone-400 cursor-pointer transition-colors"
                                >
                                    <option value="">+ Add Section from Templates</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                             </div>
                         </div>
                     ))}

                     <button onClick={handleAddStage} className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 font-medium hover:border-stone-800 hover:text-stone-800 hover:bg-white transition-all flex justify-center items-center space-x-2">
                         <PlusIcon />
                         <span>Add New Stage</span>
                     </button>
                </div>
            )}
            </div>
        </div>
    );
    
    const renderStep4 = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Preview & Confirm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-6 border border-stone-200 rounded-xl bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b border-stone-100 pb-2 mb-2">
                        <div><h4 className="font-serif font-bold text-stone-800 text-lg">Basic Information</h4></div>
                        <button onClick={() => setStep(1)} className="text-xs font-bold text-stone-400 hover:text-stone-900 uppercase tracking-wide">Edit</button>
                    </div>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Project Name:</strong> {projectName}</p>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Budget:</strong> {currency} {Number(budgetMin).toLocaleString()} - {Number(budgetMax).toLocaleString()}</p>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Timeline:</strong> {timelineMin} - {timelineMax} weeks</p>
                </div>
                <div className="space-y-3 p-6 border border-stone-200 rounded-xl bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b border-stone-100 pb-2 mb-2">
                        <div><h4 className="font-serif font-bold text-stone-800 text-lg">Details</h4></div>
                        <button onClick={() => setStep(2)} className="text-xs font-bold text-stone-400 hover:text-stone-900 uppercase tracking-wide">Edit</button>
                    </div>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Spaces:</strong> {spaces.map(s => s.name).join(', ')}</p>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Total Area:</strong> {totalArea} sq ft</p>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Quality:</strong> {qualityLevel}</p>
                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Type:</strong> {currentProjectTypeName}</p>
                </div>
            </div>
            
             <div className="space-y-6 pt-6 border-t border-stone-200">
                <div className="flex justify-between items-center">
                    <h4 className="text-xl font-serif font-bold text-stone-900">Project Stages Breakdown</h4>
                    <button onClick={() => setStep(3)} className="text-xs font-bold text-stone-400 hover:text-stone-900 uppercase tracking-wide">Edit Stages</button>
                </div>
                
                {stages.length > 0 ? (
                    <div className="space-y-4">
                         {stages.map((stage, index) => (
                             <details key={index} open className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm group">
                                 <summary className="flex justify-between items-center p-4 bg-stone-50 cursor-pointer group-hover:bg-stone-100 transition-colors">
                                     <span className="font-serif font-bold text-stone-900 text-lg">{stage.name}</span>
                                     <span className="font-bold text-stone-900 text-lg">${calculateStageTotal(stage).toFixed(0)}</span>
                                 </summary>
                                 <div className="p-4 space-y-4">
                                     {stage.sections.map(section => (
                                         <div key={section.id}>
                                             <div className="flex justify-between items-center border-b border-stone-100 pb-2 mb-2">
                                                 <span className="font-bold text-stone-700">{section.name}</span>
                                                 <span className="font-medium text-stone-600">${calculateSectionTotal(section).toFixed(0)}</span>
                                             </div>
                                             <div className="pl-2 space-y-3">
                                                 {section.content.map(content => (
                                                     <div key={content.categoryId}>
                                                         <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{content.name}</h5>
                                                         <table className="w-full text-left">
                                                             <thead className="text-[10px] text-stone-400 uppercase bg-stone-50/50">
                                                                <tr>
                                                                    <th className="font-normal px-2 py-1">Task</th>
                                                                    <th className="font-normal px-2 py-1 text-center">Sugg. Hrs</th>
                                                                    <th className="font-normal px-2 py-1 text-center">Est. Hrs</th>
                                                                    <th className="font-normal px-2 py-1 text-center">Cost</th>
                                                                    <th className="font-normal px-2 py-1 text-center">Total</th>
                                                                </tr>
                                                             </thead>
                                                             <tbody>
                                                                {content.tasks.map(task => <PreviewTaskRow key={task.id} task={task}/>)}
                                                                {content.subcategories.map(sub => (
                                                                    <React.Fragment key={sub.id}>
                                                                        <tr><td colSpan={5} className="py-2 px-2 text-xs font-bold text-stone-500 pl-4">{sub.name}</td></tr>
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
                                     {stage.sections.length === 0 && <p className="text-sm text-stone-400 italic text-center py-2">No sections in this stage.</p>}
                                 </div>
                             </details>
                         ))}
                         <div className="flex justify-end pt-4">
                             <div className="text-right bg-stone-900 text-white p-6 rounded-xl shadow-lg">
                                 <p className="text-sm font-bold text-stone-400 uppercase tracking-wide mb-1">Total Estimated Value</p>
                                 <p className="text-3xl font-serif font-bold">
                                     ${stages.reduce((acc, stage) => acc + calculateStageTotal(stage), 0).toFixed(2)}
                                 </p>
                             </div>
                         </div>
                    </div>
                ) : (
                    <p className="text-sm text-stone-500 p-8 border-2 border-dashed border-stone-200 rounded-xl text-center italic">No stages defined for this project.</p>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-8 h-full flex flex-col">
            <header className="flex-shrink-0">
                <h1 className="text-3xl font-serif font-bold text-stone-900">Create a New Project</h1>
                <p className="text-stone-500 mt-1 font-light">Follow the steps to define your new masterpiece.</p>
            </header>
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full flex flex-col flex-1 overflow-hidden">
                <div className="p-8 overflow-y-auto flex-1">
                    <Stepper currentStep={step} />
                    <div className="animate-fadeIn">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </div>
                </div>
                <div className="flex justify-between items-center p-6 border-t border-stone-100 bg-stone-50 flex-shrink-0">
                    <button onClick={onCancel} className="px-6 py-2.5 text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 hover:text-stone-900 font-medium transition-colors">Cancel</button>
                    <div className="flex items-center space-x-3">
                        {step > 1 && <button onClick={prevStep} className="px-6 py-2.5 text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 font-medium transition-colors">Back</button>}
                        {step < 4 && <button onClick={nextStep} disabled={ (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid) } className="px-8 py-2.5 text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed font-medium shadow-md transition-all">Next</button>}
                        {step === 4 && <button onClick={handleSubmit} className="px-8 py-2.5 text-white bg-stone-900 rounded-lg hover:bg-stone-800 font-medium shadow-lg transition-all transform hover:-translate-y-0.5">Create Project</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCreationWizard;
