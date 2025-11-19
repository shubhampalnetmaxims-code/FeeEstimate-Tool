
import React from 'react';
import { Project, ProjectStage, Section, SectionTask, SpaceDetails } from '../types';
import { ChevronLeftIcon } from './common/Icons';

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
        contentItem.tasks.forEach(task => { total += calculateTaskTotal(task); });
        contentItem.subcategories.forEach(sub => {
            sub.tasks.forEach(task => { total += calculateTaskTotal(task); });
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

const TaskRowView = ({ task }: { task: SectionTask }) => (
    <tr className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50 transition-colors">
        <td className="py-3 px-4 text-stone-800">{task.name}</td>
        <td className="py-3 px-4 text-center text-stone-500">{task.estimateHours}</td>
        <td className="py-3 px-4 text-center text-stone-500">${task.estimateCost?.toFixed(2)}</td>
        <td className="py-3 px-4 text-center text-stone-500">{task.actualHours ?? '-'}</td>
        <td className="py-3 px-4 text-center font-bold text-stone-900">${calculateTaskTotal(task).toFixed(2)}</td>
    </tr>
);

const DetailItem = ({ label, value }: { label: string; value?: string | number | string[] | SpaceDetails[] }) => {
    if (!value && value !== 0) return null;

    // Handle SpaceDetails array
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        const isSpaceDetails = (val: any): val is SpaceDetails => typeof val === 'object' && 'sizeType' in val;

        if (isSpaceDetails(value[0])) {
             return (
                <div className="md:col-span-2">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(value as SpaceDetails[]).map(space => (
                            <div key={space.id} className="bg-white border border-stone-100 rounded-lg p-3 text-sm">
                                <div className="font-bold text-stone-800 flex justify-between">
                                    <span>{space.name}</span>
                                    <span className="text-stone-500 font-normal">{space.sizeType}</span>
                                </div>
                                {space.sizeType === 'Custom' && space.customDimensions && (
                                    <div className="text-xs text-stone-500 mt-1">
                                        L: {space.customDimensions.length}ft &times; W: {space.customDimensions.width}ft &times; H: {space.customDimensions.height}ft
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        // Handle simple string array
         return (
             <div className="md:col-span-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {value.map((item: any) => (
                     <span key={item} className="bg-stone-100 text-stone-800 text-xs font-medium px-3 py-1 rounded-full border border-stone-200">{item}</span>
                  ))}
                </div>
              </div>
         );
    }
    
    return (
        <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-base text-stone-900 font-medium">{value}</p>
        </div>
    );
};


interface ProjectViewProps {
    project: Project;
    onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
    const overallTotal = calculateOverallTotal(project);

    return (
        <div className="space-y-8 pb-12">
            <header className="flex justify-between items-start mb-8 border-b border-stone-200 pb-6">
                <div>
                    <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-stone-500 hover:text-stone-900 mb-4 transition-colors group">
                        <ChevronLeftIcon className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Projects</span>
                    </button>
                    <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">{project.name}</h1>
                    <p className="text-stone-500 mt-2 text-lg font-light">Project Overview</p>
                </div>
                <div className="text-right bg-stone-900 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-sm font-medium text-stone-400 uppercase tracking-wide">Overall Value</p>
                    <p className="text-4xl font-serif font-bold mt-1">${overallTotal.toFixed(2)}</p>
                </div>
            </header>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 space-y-6">
                <h2 className="text-xl font-serif font-bold text-stone-800 border-b border-stone-100 pb-2">Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <DetailItem label="Client Address" value={project.clientAddress} />
                    <DetailItem label="Project Type" value={project.projectType} />

                    <DetailItem label={`Budget (${project.currency || 'AUD'})`} value={project.budgetMin && project.budgetMax ? `${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}` : undefined} />
                    <DetailItem label="Timeline" value={project.timelineMin && project.timelineMax ? `${project.timelineMin} - ${project.timelineMax} weeks` : undefined} />
                    <DetailItem label="Total Area" value={project.totalArea ? `${project.totalArea} sq ft` : undefined} />
                    <DetailItem label="Quality Level" value={project.qualityLevel} />

                    <DetailItem label="Spaces to be Designed" value={project.spaces} />

                    <div className="md:col-span-2">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Project Description</p>
                        <p className="text-stone-800 whitespace-pre-wrap leading-relaxed">{project.projectDescription || 'Not specified'}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-stone-900">Stages & Sections</h2>
                {project.stages.map(stage => (
                    <details key={stage.id} open className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group">
                        <summary className="p-6 flex justify-between items-center cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                            <div className="flex items-center space-x-4">
                                <h3 className="text-xl font-serif font-bold text-stone-900">{stage.name}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">Stage Total</p>
                                <p className="text-xl font-bold text-stone-900 font-serif">${calculateStageTotal(stage).toFixed(2)}</p>
                            </div>
                        </summary>
                        <div className="p-6 space-y-6 bg-white">
                            {stage.sections.map(section => (
                                <div key={section.id} className="border border-stone-200 rounded-lg overflow-hidden">
                                    <div className="p-4 bg-stone-50/50 flex justify-between items-center border-b border-stone-200">
                                        <div>
                                            <h4 className="text-lg font-bold text-stone-700">{section.name}</h4>
                                            {section.description && <p className="text-sm text-stone-500 italic font-light">{section.description}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-stone-400 uppercase">Section Total</p>
                                            <p className="text-lg font-bold text-stone-700 font-serif">${calculateSectionTotal(section).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-6">
                                        {section.content.map(contentItem => (
                                            <div key={contentItem.categoryId}>
                                                <h5 className="font-bold text-stone-500 text-xs uppercase tracking-widest mb-3">{contentItem.name}</h5>
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wider">
                                                        <tr>
                                                            <th className="py-2 px-4 font-semibold rounded-l-md">Task</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Est Hrs</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Cost/Hr</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Act Hrs</th>
                                                            <th className="py-2 px-4 font-semibold text-center rounded-r-md">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {contentItem.tasks.map(task => <TaskRowView key={task.id} task={task} />)}
                                                        {contentItem.subcategories.map(sub => (
                                                            <React.Fragment key={sub.id}>
                                                                <tr className="bg-stone-50/30">
                                                                    <td colSpan={5} className="py-2 px-4 font-semibold text-stone-600 italic pl-8">{sub.name}</td>
                                                                </tr>
                                                                {sub.tasks.map(task => <TaskRowView key={task.id} task={task} />)}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                             {stage.sections.length === 0 && <p className="text-center text-stone-400 py-6 italic">This stage has no sections.</p>}
                        </div>
                    </details>
                ))}
                {project.stages.length === 0 && <p className="text-center text-stone-500 py-12 bg-white rounded-xl border border-stone-200">This project has no stages defined.</p>}
            </div>
        </div>
    );
};

export default ProjectView;
