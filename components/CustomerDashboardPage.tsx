import React from 'react';
import { LogoutIcon } from './common/Icons';
import { CustomerData } from '../types';

interface CustomerDashboardPageProps {
  onLogout: () => void;
  customer: CustomerData | null;
}

const ProfileDetail = ({ label, value }: { label: string; value?: string | number }) => {
    if (!value && value !== 0) return null;
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-gray-800">{value}</p>
        </div>
    );
};

const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({ onLogout, customer }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Customer Portal</h1>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Logout"
          >
            <LogoutIcon className="h-5 w-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">
              Welcome, {customer?.name || 'Valued Customer'}!
            </h2>
            
            {customer ? (
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <ProfileDetail label="Full Name" value={customer.name} />
                  <ProfileDetail label="Email Address" value={customer.email} />
                  <ProfileDetail label="Phone Number" value={customer.phone} />
                  <ProfileDetail label="Business/Brand Name" value={customer.businessName} />
                  <ProfileDetail label="Location" value={customer.location} />
                  <ProfileDetail label="Languages Spoken" value={customer.languages} />
                  <ProfileDetail label="Years of Experience" value={customer.experience ? `${customer.experience} years` : undefined} />
                
                  {customer.specializations && customer.specializations.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Design Specializations</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customer.specializations.map(spec => (
                           <span key={spec} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{spec}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {customer.bio && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Profile Bio</p>
                      <p className="text-gray-800 mt-1 whitespace-pre-wrap text-sm leading-6">{customer.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Your personal dashboard is under construction. We're working hard to bring you an amazing experience. Please check back later!
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboardPage;