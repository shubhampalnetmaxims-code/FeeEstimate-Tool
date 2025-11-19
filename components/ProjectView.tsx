import React from 'react';
import { Project, ProjectStage, Section, SectionTask } from '../types';
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
    <tr className="border-b border-gray-200 last:border-b-0">
        <td className="py-2 px-4 text-black">{task.name}</td>
        <td className="py-2 px-4 text-center text-gray-600">{task.estimateHours}</td>
        <td className="py-2 px-4 text-center text-gray-600">${task.estimateCost?.toFixed(2)}</td>
        <td className="py-2 px-4 text-center text-gray-600">{task.actualHours ?? '-'}</td>
        <td className="py-2 px-4 text-center font-semibold text-black">${calculateTaskTotal(task).toFixed(2)}</td>
    </tr>
);

const DetailItem = ({ label, value }: { label: string; value?: string | number | string[] }) => {
    if (!value && value !== 0) return null;

    if (Array.isArray(value)) {
         return (
             <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {value.map(item => (
                     <span key={item} className="bg-gray-100 text-black text-xs font-medium px-2.5 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
         );
    }
    
    return (
        <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-1 text-black">{value}</p>
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
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-black hover:text-gray-700 mb-2">
                        <ChevronLeftIcon />
                        <span>Back to Projects</span>
                    </button>
                    <h1 className="text-3xl font-bold text-black">{project.name}</h1>
                    <p className="text-gray-600 mt-1">Project Details</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium text-gray-600">Overall Project Total</p>
                    <p className="text-4xl font-bold text-black">${overallTotal.toFixed(2)}</p>
                </div>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md border border-black space-y-4">
                <h2 className="text-xl font-bold text-gray-700">Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <DetailItem label="Client Address" value={project.clientAddress} />
                    <DetailItem label="Project Type" value={project.projectType} />

                    <DetailItem label="Budget (USD)" value={project.budgetMin && project.budgetMax ? `$${project.budgetMin.toLocaleString()} - $${project.budgetMax.toLocaleString()}` : undefined} />
                    <DetailItem label="Timeline" value={project.timelineMin && project.timelineMax ? `${project.timelineMin} - ${project.timelineMax} weeks` : undefined} />
                    <DetailItem label="Total Area" value={project.totalArea ? `${project.totalArea} sq ft` : undefined} />
                    <DetailItem label="Quality Level" value={project.qualityLevel} />

                    <DetailItem label="Spaces to be Designed" value={project.spaces} />

                    <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Project Description</p>
                        <p className="text-black whitespace-pre-wrap">{project.projectDescription || 'Not specified'}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-black">Stages</h2>
                {project.stages.map(stage => (
                    <details key={stage.id} open className="bg-white rounded-lg shadow-md border border-black overflow-hidden">
                        <summary className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <h3 className="text-xl font-bold text-black">{stage.name}</h3>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500">Stage Total</p>
                                <p className="text-xl font-bold text-black">${calculateStageTotal(stage).toFixed(2)}</p>
                            </div>
                        </summary>
                        <div className="p-4 space-y-4">
                            {stage.sections.map(section => (
                                <div key={section.id} className="border border-black rounded-md">
                                    <div className="p-3 bg-gray-50/50 flex justify-between items-center border-b">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-700">{section.name}</h4>
                                            {section.description && <p className="text-sm text-gray-500 italic">{section.description}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-gray-500">Section Total</p>
                                            <p className="text-lg font-bold text-gray-700">${calculateSectionTotal(section).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {section.content.map(contentItem => (
                                            <div key={contentItem.categoryId}>
                                                <h5 className="font-semibold text-gray-600 mb-2">{contentItem.name}</h5>
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                                                        <tr>
                                                            <th className="py-2 px-4 font-semibold">Task Name</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Estimated Hrs</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Cost/Hr</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Actual Hrs</th>
                                                            <th className="py-2 px-4 font-semibold text-center">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {contentItem.tasks.map(task => <TaskRowView key={task.id} task={task} />)}
                                                        {contentItem.subcategories.map(sub => (
                                                            <React.Fragment key={sub.id}>
                                                                <tr className="bg-gray-50">
                                                                    <td colSpan={5} className="py-2 px-4 font-semibold text-gray-600">{sub.name}</td>
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
                             {stage.sections.length === 0 && <p className="text-center text-gray-500 py-4">This stage has no sections.</p>}
                        </div>
                    </details>
                ))}
                {project.stages.length === 0 && <p className="text-center text-gray-500 py-8">This project has no stages defined.</p>}
            </div>

            {project.stages.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-black flex justify-end">
                    <div className="text-right">
                        <p className="text-lg font-medium text-gray-600">Overall Project Total</p>
                        <p className="text-4xl font-bold text-black">${overallTotal.toFixed(2)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectView;