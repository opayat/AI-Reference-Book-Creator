import React from 'react';
import { SpinnerIcon } from './Icons';

interface CitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    citationResult: string;
    sourceText: string;
}

const CitationModal: React.FC<CitationModalProps> = ({ isOpen, onClose, isLoading, citationResult, sourceText }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="citation-modal-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="citation-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Citation Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Source requested for:</p>
                    <blockquote className="mt-2 text-sm text-gray-600 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
                        "{sourceText}"
                    </blockquote>
                </div>
                <div className="p-6 min-h-[150px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-center">
                            <SpinnerIcon className="h-10 w-10 text-indigo-500" />
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Searching for sources...</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Result:</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm">{citationResult}</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-right rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Close citation modal"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CitationModal;
