import React from 'react';
import { Section, SectionTask } from '../types';

const calculateTaskCost = (task: SectionTask) => {
    return (task.estimateHours || 0) * (task.estimateCost || 0);
};

const TaskRowView = ({ task }: { task: SectionTask }) => (
    <tr className="border-b border-gray-200 last:border-b-0">
        <td className="py-2 px-4 text-gray-800">{task.name}</td>
        <td className="py-2 px-4 text-center text-gray-600">{task.estimateHours}</td>
        <td className="py-2 px-4 text-center text-gray-600">${task.estimateCost?.toFixed(2)}</td>
        <td className="py-2 px-4 text-center font-semibold text-gray-800">${calculateTaskCost(task).toFixed(2)}</td>
    </tr>
);

interface SectionViewProps {
    section: Section;
}

const SectionView: React.FC<SectionViewProps> = ({ section }) => {
    return (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <h2 className="text-xl font-bold text-gray-700">Section Content</h2>
            {section.content.map(contentItem => (
                <div key={contentItem.categoryId} className="border border-gray-200 rounded-md">
                    <div className="p-3 bg-gray-50/50 border-b">
                        <h4 className="text-lg font-semibold text-gray-700">{contentItem.name}</h4>
                    </div>
                    <div className="p-3 space-y-3">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="py-2 px-4 font-semibold">Task Name</th>
                                    <th className="py-2 px-4 font-semibold text-center">Suggested Hours</th>
                                    <th className="py-2 px-4 font-semibold text-center">Cost/Hr</th>
                                    <th className="py-2 px-4 font-semibold text-center">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contentItem.tasks.map(task => <TaskRowView key={task.id} task={task} />)}
                                {contentItem.subcategories.map(sub => (
                                    <React.Fragment key={sub.id}>
                                        <tr className="bg-gray-50">
                                            <td colSpan={4} className="py-2 px-4 font-semibold text-gray-600">{sub.name}</td>
                                        </tr>
                                        {sub.tasks.map(task => <TaskRowView key={task.id} task={task} />)}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
            {section.content.length === 0 && <p className="text-center text-gray-500 py-4">This section has no content.</p>}
        </div>
    );
};

export default SectionView;