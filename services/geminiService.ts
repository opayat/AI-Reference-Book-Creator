import { GoogleGenAI, Type } from "@google/genai";
import { BookOptions } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBookOutline = async (topic: string, options: BookOptions): Promise<string[]> => {
    const prompt = `You are an expert author and researcher. Create a comprehensive table of contents for a reference book on the topic of "${topic}". The book should be for a "${options.audience}" audience and have a "${options.tone}" tone. Generate exactly ${options.numChapters} chapter titles. Each chapter should have a concise and descriptive title.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    chapters: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse && Array.isArray(jsonResponse.chapters)) {
            return jsonResponse.chapters;
        }
        throw new Error('Invalid JSON structure for outline.');
    } catch (e) {
        console.error("Failed to parse book outline:", response.text, e);
        throw new Error("Could not generate a valid book outline. The AI's response was not in the expected format.");
    }
};

export const generateCoverImage = async (topic: string, options: BookOptions): Promise<string> => {
    const authorText = options.authorName ? ` by ${options.authorName}` : '';
    const prompt = `Create a visually stunning and thematic book cover for a reference book titled "${topic}"${authorText}. The style should be professional, minimalist, and academic. The title${options.authorName ? " and author's name" : ""} should be elegantly integrated into the design.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error('Failed to generate cover image.');
};

export const generateChapterContent = async (
    topic: string, 
    chapterTitle: string, 
    options: BookOptions, 
    allChapterTitles: string[],
    chapterIndex: number,
    previousChapterContent: string | null
): Promise<string> => {
    const bookOutline = allChapterTitles.map((title, index) => `${index + 1}. ${title}`).join('\n');
    
    let contextPrompt: string;

    const previousChapterTitle = chapterIndex > 0 ? allChapterTitles[chapterIndex - 1] : null;
    const nextChapterTitle = chapterIndex < allChapterTitles.length - 1 ? allChapterTitles[chapterIndex + 1] : null;

    if (chapterIndex === 0) {
        contextPrompt = `This is the first chapter. It must serve as a strong introduction to the topic of "${topic}" and set the stage for the entire book.`;
        if (nextChapterTitle) {
            contextPrompt += ` It should smoothly lead into the next chapter, "${nextChapterTitle}".`;
        }
    } else {
        contextPrompt = `This chapter follows "${previousChapterTitle}". It is crucial to create a seamless transition from the previous chapter's content.`;
        if (nextChapterTitle) {
            contextPrompt += ` The chapter should also build anticipation and provide a foundation for the next chapter, "${nextChapterTitle}".`;
        }

        contextPrompt += `

To achieve this, you must reference the full content of the previous chapter provided below:
--- PREVIOUS CHAPTER CONTENT START ---
${previousChapterContent}
--- PREVIOUS CHAPTER CONTENT END ---

Your primary task is to write the full, detailed content for the current chapter, "${chapterTitle}".
Your writing must:
- Logically progress from the previous chapter.
- Build upon previously presented ideas without being repetitive.
- Create a coherent narrative or informational flow.`;
        if (nextChapterTitle) {
            contextPrompt += `
- Conclude by setting the stage for the next chapter: "${nextChapterTitle}".`;
        }
    }

    let enrichmentPrompt = '';
    if (options.contentStyle === 'rich_sourced') {
        enrichmentPrompt = `

**Content Enrichment Instructions:**
Your writing must be enriched with the following elements to create a high-quality reference work:
1.  **Data and Sources:** Act as a diligent researcher. Use Google Search to find factual information, data, and sources to make the content accurate and verifiable.
2.  **Structured Information:** Where relevant, present information using markdown tables, lists, or blockquotes to improve readability and structure. For example, you can create tables for comparisons, timelines, or data sets.
3.  **Expert Quotes:** Include at least one relevant quote from a recognized expert, historical figure, or primary source within this chapter. The quote must be directly related to the chapter's topic.
4.  **Quote Formatting:** Present the quote as follows:
    - If the quote is in English, use a markdown blockquote.
    - If the quote is from another language, first present it in its original language in a blockquote, then provide an English translation on the next line, and finally, a brief explanation of its context and significance.
    - Always attribute the quote to its source.

*Example for a non-English quote:*
> *"Veni, vidi, vici."*
> (Translation: "I came, I saw, I conquered.")
> - Julius Caesar. This famous phrase was reportedly written in a letter to the Roman Senate around 47 BC after a swift victory. It signifies a quick, conclusive victory.
`;
    }

    const prompt = `You are an expert author writing a reference book on "${topic}".
The full table of contents for the book is:
${bookOutline}

You are now writing Chapter ${chapterIndex + 1}: "${chapterTitle}".
${contextPrompt}
${enrichmentPrompt}
Write the chapter content now. The content must be well-structured, informative, and suitable for a "${options.audience}" audience.
The tone should be strictly "${options.tone}".
Use markdown for formatting (e.g., # for headers, * for lists, ** for bold).
Ensure the content is substantial and comprehensive, as expected in a reference book.`;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
        temperature: 0.7
    };

    if (options.contentStyle === 'rich_sourced') {
        config.tools = [{ googleSearch: {} }];
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: config
    });

    return response.text;
};

export const generateCitation = async (topic: string, textToCite: string): Promise<string> => {
    const prompt = `Based on real-world information from Google Search, provide a citation in APA format for the following text which comes from a book about '${topic}': '${textToCite}'. If a direct source can be found, provide the citation. If no direct source can be found, explain that the information is a general summary and does not have a single attributable source.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Citation generation failed:", error);
        return "Sorry, an error occurred while trying to generate a citation. Please try again.";
    }
};