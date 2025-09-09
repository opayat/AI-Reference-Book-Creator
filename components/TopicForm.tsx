import React, { useState } from 'react';
import { BookOptions, SavedBookData } from '../types';
import { AUDIENCE_OPTIONS, TONE_OPTIONS, CHAPTER_COUNT_OPTIONS, CONTENT_STYLE_OPTIONS } from '../constants';
import { GenerateIcon, AlertIcon, LoadIcon } from './Icons';

interface TopicFormProps {
    onSubmit: (topic: string, options: BookOptions) => void;
    isLoading: boolean;
    error: string | null;
    savedBookData: SavedBookData | null;
    onLoadSaved: () => void;
}

const TopicForm: React.FC<TopicFormProps> = ({ onSubmit, isLoading, error, savedBookData, onLoadSaved }) => {
    const [topic, setTopic] = useState<string>('');
    const [options, setOptions] = useState<BookOptions>({
        numChapters: CHAPTER_COUNT_OPTIONS[1],
        audience: AUDIENCE_OPTIONS[0],
        tone: TONE_OPTIONS[0],
        authorName: '',
        outlineMode: 'ai',
        customOutline: '',
        contentStyle: 'standard',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim() && !isLoading) {
            if (options.outlineMode === 'custom' && !(options.customOutline || '').trim()) {
                // Prevent submission if custom outline is selected but empty
                return;
            }
            onSubmit(topic.trim(), options);
        }
    };
    
    const handleOptionChange = <K extends keyof BookOptions,>(key: K, value: BookOptions[K]) => {
      setOptions(prev => ({...prev, [key]: value}));
    }

    return (
        <div className="max-w-2xl mx-auto">
            {savedBookData && !isLoading && !error && (
                <div className="bg-indigo-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-center shadow-sm border border-indigo-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        You have a previously generated book: <strong className="font-semibold text-indigo-700 dark:text-indigo-300">{savedBookData.topic}</strong>
                    </p>
                    <button
                        onClick={onLoadSaved}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 font-semibold rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                        <LoadIcon className="h-5 w-5" />
                        Load Last Book
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 space-y-6 transition-all duration-300 hover:shadow-indigo-500/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="topic" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Book Topic
                        </label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., The History of Ancient Rome"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="authorName" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Author's Name <span className="text-sm font-normal text-gray-500">(Optional)</span>
                        </label>
                        <input
                            id="authorName"
                            type="text"
                            value={options.authorName}
                            onChange={(e) => handleOptionChange('authorName', e.target.value)}
                            placeholder="e.g., Jane Doe"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Book Outline</h3>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="outlineMode"
                                value="ai"
                                checked={options.outlineMode === 'ai'}
                                onChange={() => handleOptionChange('outlineMode', 'ai')}
                                className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">AI Generated</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="outlineMode"
                                value="custom"
                                checked={options.outlineMode === 'custom'}
                                onChange={() => handleOptionChange('outlineMode', 'custom')}
                                className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Custom Outline</span>
                        </label>
                    </div>

                    {options.outlineMode === 'custom' && (
                        <div>
                            <label htmlFor="customOutline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Custom Chapter Titles
                            </label>
                            <textarea
                                id="customOutline"
                                rows={8}
                                value={options.customOutline}
                                onChange={(e) => handleOptionChange('customOutline', e.target.value)}
                                placeholder="Enter one chapter title per line..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                required
                            />
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {options.outlineMode === 'ai' && (
                        <div>
                            <label htmlFor="numChapters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Chapters
                            </label>
                            <select
                                id="numChapters"
                                value={options.numChapters}
                                onChange={(e) => handleOptionChange('numChapters', parseInt(e.target.value, 10))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            >
                                {CHAPTER_COUNT_OPTIONS.map(num => <option key={num} value={num}>{num} Chapters</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Audience
                        </label>
                        <select
                            id="audience"
                            value={options.audience}
                            onChange={(e) => handleOptionChange('audience', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        >
                            {AUDIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tone
                        </label>
                        <select
                            id="tone"
                            value={options.tone}
                            onChange={(e) => handleOptionChange('tone', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        >
                            {TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="contentStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content Style
                        </label>
                        <select
                            id="contentStyle"
                            value={options.contentStyle}
                            onChange={(e) => handleOptionChange('contentStyle', e.target.value as 'standard' | 'rich_sourced')}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        >
                            {Object.entries(CONTENT_STYLE_OPTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                        </select>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                        <div className="flex">
                            <div className="py-1"><AlertIcon className="h-6 w-6 text-red-500 mr-4"/></div>
                            <div>
                                <p className="font-bold">Generation Failed</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}


                <button
                    type="submit"
                    disabled={isLoading || !topic.trim()}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                    <GenerateIcon className="h-6 w-6"/>
                    {isLoading ? 'Generating...' : 'Create My Book'}
                </button>
            </form>
        </div>
    );
};

export default TopicForm;