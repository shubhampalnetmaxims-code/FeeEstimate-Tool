import React from 'react';
import { HomeIcon, ListBulletIcon, ViewColumnsIcon, UsersIcon, CogIcon, LogoutIcon, FolderIcon, TagIcon } from './common/Icons';

interface SidePanelProps {
    onLogout: () => void;
    activeView: string;
    setActiveView: (view: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ onLogout, activeView, setActiveView }) => {
    const navItems = [
        { icon: HomeIcon, label: 'Dashboard' },
        { icon: ListBulletIcon, label: 'Category Mngmt' },
        { icon: ViewColumnsIcon, label: 'Sections' },
        { icon: TagIcon, label: 'Project Types' },
        { icon: FolderIcon, label: 'Project Templates' },
        { icon: UsersIcon, label: 'Clients' },
        { icon: CogIcon, label: 'Settings' },
    ];

    return (
        <aside className="w-64 min-h-screen bg-[#4E5C57] text-gray-200 flex flex-col shadow-lg flex-shrink-0">
            <div className="h-20 flex items-center justify-center border-b border-gray-600/50">
                <h1 className="text-2xl font-bold tracking-wider">Designer's Hub</h1>
            </div>
            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <a href="#"
                               onClick={(e) => { e.preventDefault(); setActiveView(item.label); }}
                               className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${activeView === item.label ? 'bg-[#5F716B] text-white' : 'hover:bg-gray-700/50'}`}>
                                <item.icon />
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-600/50">
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-3 mb-4 rounded-lg transition-colors duration-200 hover:bg-gray-700/50 w-full text-left"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">A</div>
                    <div>
                        <p className="font-semibold text-sm">Admin User</p>
                        <p className="text-xs text-gray-400">View Profile</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidePanel;