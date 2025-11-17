import React from 'react';
import { WarningIcon } from './Icons';

interface ConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm, title, message }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                         <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <WarningIcon />
                        </div>
                        <div className="mt-0 text-left">
                            <h3 className="text-lg font-bold leading-6 text-gray-900">{title}</h3>
                            <div className="mt-2"><p className="text-sm text-gray-500">{message}</p></div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
