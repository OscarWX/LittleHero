"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, BookOpen, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AnimatedProgressBar from "@/components/animated-progress-bar"
import { bookApi } from "@/lib/api-client"

type GeneratedStory = {
  title: string
  pages: Array<{
    pageNumber: number
    text: string
    imageDescription: string
  }>
  totalPages: number
}

type BookData = {
  id: string
  title: string
  child_profiles: Array<{
    id: string
    name: string
    gender?: string
    appearance?: any
    special_traits?: string
    favorite_thing?: string
  }>
  theme?: string
  qualities?: string[]
  magical_details?: string
  special_memories?: string
  narrative_style?: string
  status: string
  story_content?: string
}

export default function StoryPreviewPage() {
  const router = useRouter()
  const [bookId, setBookId] = useState<string>("")
  const [book, setBook] = useState<BookData | null>(null)
  const [story, setStory] = useState<GeneratedStory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState("")

  // Load book data and generate story
  useEffect(() => {
    const loadBookAndGenerateStory = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const bookIdParam = urlParams.get('bookId')
        
        if (!bookIdParam) {
          router.push("/add-book")
          return
        }
        
        setBookId(bookIdParam)
        setIsLoading(true)

        // Load book data from backend
        const { book: bookData } = await bookApi.getById(bookIdParam)
        setBook(bookData)

        // Check if story already exists
        if (bookData.story_content) {
          try {
            const existingStory = JSON.parse(bookData.story_content)
            setStory(existingStory)
            setIsLoading(false)
            return
          } catch (e) {
            console.error('Error parsing existing story content:', e)
          }
        }

        // Generate story if it doesn't exist
        if (bookData.status === 'creating' || !bookData.story_content) {
          setIsGenerating(true)
          
          const { book: updatedBook } = await bookApi.generateStory(bookIdParam)
          setBook(updatedBook)
          
          if (updatedBook.story_content) {
            try {
              const generatedStory = JSON.parse(updatedBook.story_content)
              setStory(generatedStory)
            } catch (e) {
              console.error('Error parsing generated story:', e)
              setError('Failed to parse generated story')
            }
          }
          
          setIsGenerating(false)
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error loading book or generating story:", e)
        setError("Failed to load book data or generate story")
        setIsLoading(false)
        setIsGenerating(false)
      }
    }

    loadBookAndGenerateStory()
  }, [router])

  const handleConfirm = async () => {
    if (!book || !story) return

    try {
      setIsLoading(true)
      
      // Update book status to ready
      const response = await fetch('/api/books/creation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: book.id,
          status: 'ready'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete book creation')
      }

      setIsConfirmed(true)
    } catch (error) {
      console.error('Error confirming book:', error)
      setError('Failed to confirm book creation')
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!bookId) return

    try {
      setIsGenerating(true)
      setError("")
      
      const { book: updatedBook } = await bookApi.generateStory(bookId)
      setBook(updatedBook)
      
      if (updatedBook.story_content) {
        try {
          const generatedStory = JSON.parse(updatedBook.story_content)
          setStory(generatedStory)
        } catch (e) {
          console.error('Error parsing regenerated story:', e)
          setError('Failed to parse regenerated story')
        }
      }
      
      setIsGenerating(false)
    } catch (error) {
      console.error('Error regenerating story:', error)
      setError('Failed to regenerate story')
      setIsGenerating(false)
    }
  }

  if (isLoading && !book) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-yellow-600" />
            <p className="text-gray-700 nunito-font">Loading book data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <p className="text-red-600 nunito-font mb-4">{error}</p>
            <Link
              href="/add-book"
              className="py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font"
            >
              Start Over
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <AnimatedProgressBar progress={100} flowKey="book-creation" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 junegull-font">Creating Your Story</h2>
            <p className="text-gray-700 nunito-font mb-4">
              Our AI is crafting a personalized story based on your selections...
            </p>
            <p className="text-sm text-gray-600 nunito-font">
              This may take a minute or two.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isConfirmed) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <main className="flex-1 px-4 flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 junegull-font">CONGRATULATIONS!</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <p className="text-gray-800 nunito-font mb-4">
                Your personalized story has been created! It's ready to read and enjoy.
              </p>
              <div className="flex items-center justify-center space-x-2 text-yellow-600 nunito-font">
                <BookOpen size={18} />
                <span className="font-bold">{story?.title || "Your Adventure Story"}</span>
              </div>
            </div>
            <Link
              href="/dashboard?tab=books"
              className="py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg"
            >
              View Your Books
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 nunito-font">No story content available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8E8]">
      <AnimatedProgressBar progress={100} flowKey="book-creation" />
      
      <header className="p-4 flex items-center">
        <Link href={`/add-book/narrative-style?bookId=${bookId}`} className="text-gray-800">
          <ArrowLeft size={24} />
          <span className="ml-2 text-sm text-gray-600">back</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-2 junegull-font">{story.title}</h2>
        <p className="text-center text-gray-600 nunito-font mb-6">
          A story featuring {book?.child_profiles.map(p => p.name).join(" and ")}
        </p>
        
        <div className="bg-yellow-50 rounded-lg p-6 mb-6">
          {story.pages.map((page, i) => (
            <div key={i} className="mb-4 flex gap-2">
              <div className="text-yellow-600 font-bold nunito-font">p{page.pageNumber}</div>
              <p className="nunito-font">{page.text}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 nunito-font font-bold flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <RefreshCw size={18} />
            )}
            {isGenerating ? "Regenerating..." : "Regenerate Story"}
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading || isGenerating}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Confirm & Create Book"}
          </button>
        </div>
      </main>
    </div>
  )
}
