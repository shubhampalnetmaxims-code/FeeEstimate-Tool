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
        <div className="fixed inset-0 left-64 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-black">
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                         <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                            <WarningIcon className="h-6 w-6 text-black" />
                        </div>
                        <div className="mt-0 text-left">
                            <h3 className="text-lg font-bold leading-6 text-black">{title}</h3>
                            <div className="mt-2"><p className="text-sm text-gray-600">{message}</p></div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t border-black bg-gray-50 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-black bg-white border border-black rounded-md hover:bg-gray-100">Cancel</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;