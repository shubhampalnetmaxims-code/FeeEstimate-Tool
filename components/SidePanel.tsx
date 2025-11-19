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
        <aside className="w-64 min-h-screen bg-stone-900 text-stone-200 flex flex-col shadow-2xl flex-shrink-0 transition-all">
            <div className="h-24 flex items-center justify-center border-b border-stone-800">
                <h1 className="text-2xl font-serif font-bold tracking-wide text-stone-50">Designer's Hub</h1>
            </div>
            <nav className="flex-1 px-4 py-8">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <a href="#"
                               onClick={(e) => { e.preventDefault(); setActiveView(item.label); }}
                               className={`flex items-center space-x-3 p-3 rounded-md transition-all duration-200 group ${activeView === item.label ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'}`}>
                                <item.icon className={`h-5 w-5 transition-colors ${activeView === item.label ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`} />
                                <span className="font-medium text-sm tracking-wide">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-stone-800 bg-stone-900">
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-3 mb-4 rounded-md transition-colors duration-200 hover:bg-stone-800 w-full text-left text-stone-400 hover:text-white"
                >
                    <LogoutIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
                <div className="flex items-center space-x-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-stone-700 text-white flex items-center justify-center font-serif font-bold border border-stone-600">A</div>
                    <div>
                        <p className="font-semibold text-sm text-stone-200">Admin User</p>
                        <p className="text-xs text-stone-500 hover:text-stone-400 cursor-pointer">View Profile</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidePanel;