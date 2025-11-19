import React from 'react';

interface SignUpData {
    name: string;
    email: string;
}

interface CoachCompleteProfilePageProps {
  initialData: SignUpData;
  onComplete: () => void;
}

const specializationGroups: Record<string, string[]> = {
  "Project Type": ["Residential", "Commercial", "Hospitality"],
  "Room/Space": ["Kitchen", "Bedroom", "Living room", "Office", "Retail"],
  "Service Level": ["Renovation", "Styling", "Full-service design"],
  "Budget": ["Budget-focused design", "Luxury design"],
  "Special Focus": ["Sustainable or eco-friendly design"],
};

const CoachCompleteProfilePage: React.FC<CoachCompleteProfilePageProps> = ({ initialData, onComplete }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically save the profile data
        console.log('Coach profile completed!');
        onComplete();
    };
    
    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-black">
                <div className="p-8 md:p-12 space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-black">Complete Your Coach Profile</h1>
                        <p className="text-gray-600 mt-2">Tell us a bit more about your practice.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={initialData.name} readOnly className="w-full px-3 py-2 border border-black rounded-md bg-gray-100 text-gray-700 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" value={initialData.email} readOnly className="w-full px-3 py-2 border border-black rounded-md bg-gray-100 text-gray-700 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" placeholder="+1 (555) 123-4567" className="w-full px-3 py-2 border border-black rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business/Brand Name</label>
                            <input type="text" placeholder="e.g., 'Creative Spaces Inc.'" className="w-full px-3 py-2 border border-black rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country)</label>
                            <input type="text" placeholder="e.g., 'New York, USA'" className="w-full px-3 py-2 border border-black rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                            <input type="text" placeholder="e.g., 'English, Spanish'" className="w-full px-3 py-2 border border-black rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Years of professional experience</label>
                            <input type="number" min="0" placeholder="e.g., 5" className="w-full px-3 py-2 border border-black rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Design Specializations</label>
                            <div className="space-y-3 p-3 border border-black rounded-md max-h-48 overflow-y-auto">
                                {Object.entries(specializationGroups).map(([groupName, options]) => (
                                    <div key={groupName}>
                                        <h4 className="font-semibold text-gray-600 text-xs uppercase tracking-wider">{groupName}</h4>
                                        <div className="mt-2 space-y-1">
                                            {options.map(option => (
                                                <label key={option} className="flex items-center space-x-2 font-normal text-black">
                                                    <input type="checkbox" className="bg-white rounded text-black focus:ring-black border-black" />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Bio (50-200 words)</label>
                            <textarea rows={4} placeholder="Describe your design philosophy and unique selling points..." className="w-full px-3 py-2 border border-black rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 ease-in-out">
                                Complete Profile & Enter Dashboard
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default CoachCompleteProfilePage;