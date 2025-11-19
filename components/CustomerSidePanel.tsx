import React from 'react';
import { UserIcon, ViewColumnsIcon, LogoutIcon } from './common/Icons';
import { CustomerData } from '../types';

interface CustomerSidePanelProps {
    onLogout: () => void;
    customer: CustomerData | null;
    activeView: string;
    setActiveView: (view: string) => void;
}

const CustomerSidePanel: React.FC<CustomerSidePanelProps> = ({ onLogout, customer, activeView, setActiveView }) => {
    const navItems = [
        { icon: UserIcon, label: 'Profile' },
        { icon: ViewColumnsIcon, label: 'Projects' },
    ];

    return (
        <aside className="w-64 min-h-screen bg-white text-black flex flex-col shadow-lg flex-shrink-0 border-r border-black">
            <div className="h-20 flex items-center justify-center border-b border-black">
                <h1 className="text-2xl font-bold tracking-wider">Customer Portal</h1>
            </div>
            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <a href="#"
                               onClick={(e) => { e.preventDefault(); setActiveView(item.label); }}
                               className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${activeView === item.label ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                                <item.icon className="h-6 w-6" />
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-black">
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-3 mb-4 rounded-lg transition-colors duration-200 hover:bg-gray-100 w-full text-left"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                        {customer?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{customer?.name || 'Customer'}</p>
                        <p className="text-xs text-gray-600">{customer?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CustomerSidePanel;