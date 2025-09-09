import React, { useState, useCallback } from 'react';
import { Book } from '../types';
import { ResetIcon, AlertIcon, CiteIcon } from './Icons';
import { generateCitation } from '../services/geminiService';
import CitationModal from './CitationModal';

// These are loaded from CDNs in index.html, so we declare them here to satisfy TypeScript
declare const ReactMarkdown: any;
declare const remarkGfm: any;

interface BookDisplayProps {
    book: Book;
    onReset: () => void;
}

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const BookDisplay: React.FC<BookDisplayProps> = ({ book, onReset }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        isLoading: false,
        result: '',
        sourceText: ''
    });

    const handleRequestCitation = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setModalState({ isOpen: true, isLoading: true, result: '', sourceText: text });
        try {
            const citation = await generateCitation(book.title, text);
            setModalState(prev => ({ ...prev, isLoading: false, result: citation }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setModalState(prev => ({ ...prev, isLoading: false, result: `Failed to get citation: ${errorMessage}` }));
        }
    }, [book.title]);

    const handleCloseModal = () => {
        setModalState({ isOpen: false, isLoading: false, result: '', sourceText: '' });
    };

    const CustomParagraph = ({ children }: { children: React.ReactNode[] }) => {
        // Extract text content from children for the citation request
        const getTextContent = (nodes: React.ReactNode[]): string => {
            return React.Children.map(nodes, node => {
                if (typeof node === 'string') return node;
                if (typeof node === 'number') return node.toString();
                // FIX: Cast node.props to safely access children.
                // The type of node.props can be inferred as 'unknown' in some contexts,
                // so we cast it to an object with an optional children property to fix the type error.
                if (React.isValidElement(node)) {
                    const props = node.props as { children?: React.ReactNode };
                    if (props.children) {
                        return getTextContent(React.Children.toArray(props.children));
                    }
                }
                return '';
            }).join('');
        };
        const paragraphText = getTextContent(children);
        
        // Render nothing if paragraph is empty or just whitespace
        if (!paragraphText.trim()) return null;

        return (
            <div className="relative group">
                <p>{children}</p>
                <button
                    onClick={() => handleRequestCitation(paragraphText)}
                    className="absolute top-0 -right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-indigo-500 focus:outline-none"
                    aria-label="Get citation for this paragraph"
                    title="Get Citation"
                >
                    <CiteIcon className="h-5 w-5" />
                </button>
            </div>
        );
    };

    return (
        <>
        <CitationModal 
            isOpen={modalState.isOpen}
            onClose={handleCloseModal}
            isLoading={modalState.isLoading}
            citationResult={modalState.result}
            sourceText={modalState.sourceText}
        />
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 sm:p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column: Cover & ToC */}
                <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <div className="sticky top-8">
                        <img 
                          src={book.coverImageUrl} 
                          alt={`Cover for ${book.title}`} 
                          className="w-full rounded-lg shadow-lg aspect-[3/4] object-cover"
                        />
                        <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white capitalize">Table of Contents</h2>
                        <nav>
                            <ul className="space-y-2">
                                {book.chapters.map((chapter, index) => (
                                    <li key={index}>
                                        <a 
                                            href={`#${slugify(chapter.title)}`}
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                        >
                                           {index + 1}. {chapter.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                         <button 
                            onClick={onReset}
                            className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                        >
                            <ResetIcon className="h-5 w-5"/>
                            Create New Book
                        </button>
                    </div>
                </aside>

                {/* Right Column: Book Content */}
                <main className="w-full md:w-2/3 lg:w-3/4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300 p-4 rounded-md mb-8" role="alert">
                        <div className="flex">
                            <div className="py-1"><AlertIcon className="h-6 w-6 text-yellow-500 mr-4"/></div>
                            <div>
                                <p className="font-bold">AI-Generated Content</p>
                                <p className="text-sm">This content is generated by an AI and may contain inaccuracies. Please verify important information.</p>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2 capitalize font-serif text-center">
                        {book.title}
                    </h1>
                    {book.author && (
                        <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-8 text-center font-serif">
                            by {book.author}
                        </p>
                    )}
                    <div className="prose prose-lg dark:prose-invert max-w-none font-serif text-justify">
                        {book.chapters.map((chapter, index) => (
                            <section key={index} id={slugify(chapter.title)} className="mb-12 scroll-mt-20">
                                <h2 className="text-3xl font-bold !mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
                                    {chapter.title}
                                </h2>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: CustomParagraph,
                                    }}
                                >
                                    {chapter.content}
                                </ReactMarkdown>
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </div>
        </>
    );
};

export default BookDisplay;