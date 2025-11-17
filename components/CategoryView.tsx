import React from 'react';
import { Category } from '../types';
import { ChevronLeftIcon } from './common/Icons';

interface CategoryViewProps {
    category: Category;
    onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, onBack }) => {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                 <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-[#5F716B] hover:text-[#4E5C57] mb-2">
                    <ChevronLeftIcon />
                    <span>Back to Categories</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
                <p className="text-gray-500 mt-1">{category.description}</p>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
                <h2 className="text-xl font-bold text-gray-700">Tasks</h2>
                {category.tasks.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        {category.tasks.map(task => <li key={task.id}>{task.name}</li>)}
                    </ul>
                ) : (
                    <p className="text-gray-500">No direct tasks for this category.</p>
                )}

                {category.subcategories.length > 0 && (
                    <div className="pt-4 border-t">
                        <h2 className="text-xl font-bold text-gray-700">Subcategories</h2>
                        <div className="mt-2 space-y-3">
                            {category.subcategories.map(sub => (
                                <div key={sub.id} className="p-3 bg-gray-50 rounded-md border">
                                    <h3 className="font-semibold text-gray-700">{sub.name}</h3>
                                    {sub.tasks.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 text-gray-800 mt-1 pl-4">
                                            {sub.tasks.map(task => <li key={task.id}>{task.name}</li>)}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1 pl-4">No tasks in this subcategory.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryView;
