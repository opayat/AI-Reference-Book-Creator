export interface Chapter {
  title: string;
  content: string;
}

export interface Book {
  title: string;
  author: string;
  coverImageUrl: string;
  chapters: Chapter[];
}

export interface BookOptions {
  numChapters: number;
  audience: string;
  tone: string;
  authorName: string;
  outlineMode?: 'ai' | 'custom';
  customOutline?: string;
  contentStyle?: 'standard' | 'rich_sourced';
}

export type AppState = 'FORM' | 'LOADING' | 'DISPLAYING' | 'ERROR';

export interface SavedBookData {
  book: Book;
  topic: string;
  options: BookOptions;
}