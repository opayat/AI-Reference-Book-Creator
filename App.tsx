import React, { useState, useCallback, useEffect } from 'react';
import { Book, AppState, BookOptions, SavedBookData } from './types';
import { generateBookOutline, generateChapterContent, generateCoverImage } from './services/geminiService';
import TopicForm from './components/TopicForm';
import LoadingScreen from './components/LoadingScreen';
import BookDisplay from './components/BookDisplay';
import { BookIcon } from './components/Icons';

const LOCAL_STORAGE_KEY = 'savedBook';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('FORM');
    const [book, setBook] = useState<Book | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [savedBookData, setSavedBookData] = useState<SavedBookData | null>(null);

    useEffect(() => {
        try {
            const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedDataString) {
                const savedData: SavedBookData = JSON.parse(savedDataString);
                setSavedBookData(savedData);
            }
        } catch (err) {
            console.error("Failed to load saved book from localStorage", err);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, []);

    const handleGenerateBook = useCallback(async (topic: string, options: BookOptions) => {
        setAppState('LOADING');
        setError(null);
        setBook(null);

        try {
            setLoadingMessage('Designing a stunning book cover...');
            const coverImageUrl = await generateCoverImage(topic, options);

            let chapterTitles: string[];

            if (options.outlineMode === 'custom' && options.customOutline && options.customOutline.trim().length > 0) {
                setLoadingMessage('Parsing your custom outline...');
                chapterTitles = options.customOutline.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            } else {
                setLoadingMessage('Crafting the table of contents...');
                chapterTitles = await generateBookOutline(topic, options);
            }
            
            if (chapterTitles.length === 0) {
                throw new Error("The book outline is empty. Please provide chapter titles or let the AI generate them.");
            }

            const newBook: Book = {
                title: topic,
                author: options.authorName,
                coverImageUrl,
                chapters: [],
            };

            let previousChapterContent: string | null = null;

            for (let i = 0; i < chapterTitles.length; i++) {
                const title = chapterTitles[i];
                setLoadingMessage(`Writing Chapter ${i + 1} of ${chapterTitles.length}: ${title}`);
                const content = await generateChapterContent(
                    topic, 
                    title, 
                    options, 
                    chapterTitles, 
                    i, 
                    previousChapterContent
                );
                newBook.chapters.push({ title, content });
                previousChapterContent = content;

                // Add a delay between requests to avoid hitting API rate limits
                if (i < chapterTitles.length - 1) {
                    await delay(1200); // 1.2-second delay
                }
            }

            setBook(newBook);
            const dataToSave: SavedBookData = { book: newBook, topic, options };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
            setSavedBookData(dataToSave); // Update saved data state
            setAppState('DISPLAYING');

        } catch (err) {
            console.error(err);
            const rawMessage = err instanceof Error ? err.message : JSON.stringify(err);
            let displayMessage: string;

            if (rawMessage.toLowerCase().includes('quota') || rawMessage.toLowerCase().includes('resource_exhausted')) {
                displayMessage = "The AI service is temporarily busy due to high demand (rate limit exceeded). Please wait a minute before trying again. Generating a book with fewer chapters can also help avoid this issue.";
            } else if (rawMessage.toLowerCase().includes('api_key')) {
                 displayMessage = "Invalid API Key. Please ensure your API key is configured correctly.";
            }
            else {
                 displayMessage = `An unexpected error occurred. Please try again. (Details: ${rawMessage})`;
            }
            
            setError(`Failed to generate book. ${displayMessage}`);
            setAppState('ERROR');
        } finally {
            setLoadingMessage('');
        }
    }, []);
    
    const handleLoadSavedBook = () => {
        if (savedBookData) {
            setBook(savedBookData.book);
            setAppState('DISPLAYING');
            setError(null);
        }
    };

    const handleReset = () => {
        setAppState('FORM');
        setBook(null);
        setError(null);
    };

    const renderContent = () => {
        if (appState === 'DISPLAYING') {
            return book ? <BookDisplay book={book} onReset={handleReset} /> : null;
        }

        return (
            <>
                <TopicForm
                    onSubmit={handleGenerateBook}
                    isLoading={appState === 'LOADING'}
                    error={error}
                    savedBookData={savedBookData}
                    onLoadSaved={handleLoadSavedBook}
                />
                {appState === 'LOADING' && <LoadingScreen message={loadingMessage} />}
            </>
        );
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-4">
                    <BookIcon className="h-10 w-10 text-indigo-500" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                        AI Reference Book Maker
                    </h1>
                </div>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    Turn any topic into a beautifully crafted reference book.
                </p>
            </header>
            <main className="max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;