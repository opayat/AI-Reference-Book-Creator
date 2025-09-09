
import React from 'react';
import { SpinnerIcon } from './Icons';

interface LoadingScreenProps {
    message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh]">
            <SpinnerIcon className="h-16 w-16 text-indigo-500" />
            <p className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
                {message}
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
                Please wait, great things take time to create...
            </p>
        </div>
    );
};

export default LoadingScreen;
