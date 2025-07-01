// Define book type
type BookData = {
  id: string;
  title: string;
  profileIds: string[];
  theme: string;
  qualities: string[];
  magicalDetails?: string;
  magicalImage?: string;
  specialMemories?: string;
  specialMemoriesImage?: string;
  narrativeStyle: string;
  content: string[];
  status?: string;
  pictures?: string[];
  color?: string;
  createdAt?: number; // Add timestamp to control when the book was created
};

export function createExampleBooks(profileId: string) {
  // Check if we already have books
  const existingBooksJson = localStorage.getItem('books');
  const books: BookData[] = existingBooksJson
    ? JSON.parse(existingBooksJson)
    : [];

  // Only add example books if there are none for this profile
  const hasProfileBooks = books.some(book =>
    book.profileIds.includes(profileId)
  );
  if (hasProfileBooks) return;

  // Current timestamp
  const now = Date.now();

  // Create a ready-to-read book
  const readyBook: BookData = {
    id: `book-${now}`,
    title: "Emma's Magical Adventure",
    profileIds: [profileId],
    theme: 'Adventure',
    qualities: ['Courage', 'Creativity'],
    magicalDetails:
      'Emma discovers a magical key that opens doors to other worlds.',
    // Remove magical image
    specialMemories: "Based on Emma's love for exploring the backyard.",
    // Remove special memories image
    narrativeStyle: 'Rhyming',
    content: [
      'Once upon a time, there was a girl named Emma,',
      'She found a golden key that sparkled like a gamma.',
      "The key fit in a door she'd never seen before,",
      'It opened with a click, and Emma stepped through the door.',
      'A magical world awaited, full of wonder and delight,',
      'With talking animals and trees that glowed at night.',
      'Emma made new friends and had adventures galore,',
      'And promised to return through that magical door.',
    ],
    status: 'ready',
    pictures: [
      '/child-and-fox.png',
      '/child-and-fox-sky.png',
      '/child-and-fox-wings.png',
    ],
    color: '#FFB6C1', // Light pink
    createdAt: now,
  };

  // Create a book that will ALWAYS stay in processing state
  // Use a special ID format that won't trigger the auto-transition
  const processingBook: BookData = {
    id: `processing-book-${now + 1}`, // Use a different ID format that won't be processed by the auto-transition logic
    title: 'Emma Saves the Day',
    profileIds: [profileId],
    theme: 'Healthy Habits',
    qualities: ['Responsibility', 'Kindness'],
    narrativeStyle: 'Educational',
    content: [
      'Emma woke up early one morning with a big smile.',
      'Today was the day she would help her friends at school.',
      'She packed her bag with healthy snacks to share.',
      'At school, her friends were hungry but had forgotten their lunch.',
      'Emma shared her apples and carrots with everyone.',
      'Her teacher was proud of Emma for being so kind.',
      'Emma felt happy knowing she had helped her friends stay healthy.',
    ],
    status: 'processing', // Use "processing" instead of "creating pictures"
    color: '#90EE90', // Light green
    createdAt: now,
    // No magical or special memories images
  };

  // Add the example books to localStorage
  books.push(readyBook, processingBook);
  localStorage.setItem('books', JSON.stringify(books));

  return books;
}
