import React from 'react';
import { CustomerData } from '../types';

interface CustomerProfilePageProps {
  customer: CustomerData | null;
}

const ProfileDetail = ({ label, value }: { label: string; value?: string | number | string[] }) => {
    if (!value && value !== 0) return null;

    if (Array.isArray(value)) {
         return (
             <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {value.map(spec => (
                     <span key={spec} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{spec}</span>
                  ))}
                </div>
              </div>
         );
    }
    
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-gray-800">{value}</p>
        </div>
    );
};

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customer }) => {
  return (
    <div>
        <header className="mb-8">
             <h1 className="text-3xl font-bold text-gray-800">
              Profile
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage your personal information.
            </p>
        </header>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 space-y-6">
          {customer ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileDetail label="Full Name" value={customer.name} />
                <ProfileDetail label="Email Address" value={customer.email} />
                <ProfileDetail label="Phone Number" value={customer.phone} />
                <ProfileDetail label="Business/Brand Name" value={customer.businessName} />
                <ProfileDetail label="Location" value={customer.location} />
                <ProfileDetail label="Languages Spoken" value={customer.languages} />
                <ProfileDetail label="Years of Experience" value={customer.experience ? `${customer.experience} years` : undefined} />
                <ProfileDetail label="Design Specializations" value={customer.specializations} />

                {customer.bio && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Profile Bio</p>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap text-sm leading-6">{customer.bio}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Could not load customer profile information.
              </p>
            </div>
          )}
        </div>
    </div>
  );
};

export default CustomerProfilePage;
