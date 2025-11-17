import React from 'react';

interface UnderConstructionPageProps {
    viewName: string;
}

const UnderConstructionPage: React.FC<UnderConstructionPageProps> = ({ viewName }) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-6 h-[60vh]">
            <h2 className="text-4xl font-bold text-gray-800">{viewName} Page</h2>
            <p className="text-gray-600 text-lg max-w-md">
                {viewName === 'Dashboard'
                    ? 'This is the main dashboard. Other widgets and stats will be shown here.'
                    : 'This section is under construction. Please check back later.'
                }
            </p>
        </div>
    );
};

export default UnderConstructionPage;
