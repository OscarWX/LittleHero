"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

// Define book type
type BookData = {
  id: string
  title: string
  profileIds: string[]
  theme: string
  qualities: string[]
  magicalDetails?: string
  magicalImage?: string
  specialMemories?: string
  specialMemoriesImage?: string
  narrativeStyle: string
  content: string[]
}

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [book, setBook] = useState<BookData | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Load book data
  useEffect(() => {
    const loadBook = () => {
      try {
        const savedBooks = localStorage.getItem("books")
        if (savedBooks) {
          const books = JSON.parse(savedBooks)
          const foundBook = books.find((b: BookData) => b.id === bookId)

          if (foundBook) {
            setBook(foundBook)
            setTitle(foundBook.title)
            setContent([...foundBook.content]) // Create a copy of the content array
          } else {
            // Book not found, redirect to dashboard
            router.push("/dashboard?tab=books")
          }
        } else {
          // No books, redirect to dashboard
          router.push("/dashboard?tab=books")
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error loading book", e)
        setIsLoading(false)
        router.push("/dashboard?tab=books")
      }
    }

    loadBook()
  }, [bookId, router])

  // Handle content change for a specific page
  const handleContentChange = (index: number, value: string) => {
    const newContent = [...content]
    newContent[index] = value
    setContent(newContent)
  }

  // Handle save
  const handleSave = () => {
    if (!book) return

    setIsSaving(true)

    try {
      const savedBooks = localStorage.getItem("books")
      if (savedBooks) {
        const books = JSON.parse(savedBooks)
        const bookIndex = books.findIndex((b: BookData) => b.id === bookId)

        if (bookIndex !== -1) {
          // Update the book
          const updatedBook = {
            ...book,
            title,
            content,
          }

          books[bookIndex] = updatedBook
          localStorage.setItem("books", JSON.stringify(books))

          setSaveMessage("Book saved successfully!")
          setTimeout(() => {
            router.push(`/book/${bookId}`)
          }, 1500)
        }
      }
    } catch (e) {
      console.error("Error saving book", e)
      setSaveMessage("Error saving book. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 nunito-font">Loading book...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 nunito-font">Book not found</p>
            <Link
              href="/dashboard?tab=books"
              className="mt-4 inline-block py-2 px-4 bg-yellow-400 rounded-lg nunito-font font-bold"
            >
              Back to Books
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href={`/book/${bookId}`} className="text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Book</h1>
        <div className="w-6"></div> {/* Empty space for balance */}
      </header>

      {/* Edit form */}
      <main className="flex-1 p-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="space-y-6">
            {/* Book title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-gray-800 nunito-font font-bold">
                Book Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                required
              />
            </div>

            {/* Book content */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 nunito-font">Story Content</h2>

              {content.map((paragraph, index) => (
                <div key={index} className="space-y-2">
                  <label htmlFor={`page-${index}`} className="block text-gray-800 nunito-font">
                    Page {index + 1}
                  </label>
                  <textarea
                    id={`page-${index}`}
                    value={paragraph}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                    rows={4}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Save message */}
            {saveMessage && (
              <div
                className={`p-3 rounded-lg text-center ${
                  saveMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {saveMessage}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href={`/book/${bookId}`}
                className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors duration-300 nunito-font text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={isSaving || !title || content.some((p) => !p.trim())}
                className="flex-1 py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
