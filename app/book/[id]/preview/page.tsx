"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BookOpen, Printer, RefreshCw, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"

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
  status?: string
  pictures?: string[]
}

type ChildProfile = {
  id: string
  name: string
  gender?: "boy" | "girl"
  birthday?: string
  hasPhoto: boolean
  photoUrl?: string
  color: string
}

export default function BookPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [book, setBook] = useState<BookData | null>(null)
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    const loadBook = () => {
      try {
        const savedBooks = localStorage.getItem("books")
        if (savedBooks) {
          const books = JSON.parse(savedBooks)
          const foundBook = books.find((b: BookData) => b.id === bookId)

          if (foundBook) {
            if (foundBook.status !== "ready") {
              router.push(`/book/${bookId}`)
              return
            }
            setBook(foundBook)
          } else {
            router.push("/dashboard?tab=books")
          }
        } else {
          router.push("/dashboard?tab=books")
        }

        const savedProfiles = localStorage.getItem("childProfiles")
        if (savedProfiles) {
          setProfiles(JSON.parse(savedProfiles))
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

  const getCharacterNames = () => {
    if (!book || !profiles.length) return ""
    const bookCharacters = profiles.filter((profile) => book.profileIds.includes(profile.id))
    return bookCharacters.map((c) => c.name).join(", ")
  }

  const handleRegenerateBook = () => {
    if (!book) return
    setIsRegenerating(true)

    try {
      const savedBooks = localStorage.getItem("books")
      if (savedBooks) {
        const books = JSON.parse(savedBooks)
        const bookIndex = books.findIndex((b: BookData) => b.id === bookId)

        if (bookIndex !== -1) {
          const updatedBook = { ...books[bookIndex] }
          updatedBook.status = "creating pictures"
          updatedBook.pictures = undefined

          books[bookIndex] = updatedBook
          localStorage.setItem("books", JSON.stringify(books))
        }
      }
    } catch (e) {
      console.error("Error regenerating book", e)
      setIsRegenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-700 nunito-font">Loading book preview...</p>
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
            <Link href="/dashboard?tab=books" className="mt-4 inline-block py-2 px-4 bg-yellow-400 rounded-lg nunito-font font-bold">
              Back to Books
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isRegenerating) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
        <main className="flex-1 px-4 flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <RefreshCw size={40} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 junegull-font">REGENERATING...</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <p className="text-gray-800 nunito-font mb-4">
                Your book is being regenerated! We're creating new pictures for each page.
              </p>
              <p className="text-gray-800 nunito-font mb-4">
                You'll be notified when it's ready to view and print.
              </p>
              <div className="flex items-center justify-center space-x-2 text-yellow-600 nunito-font">
                <BookOpen size={18} />
                <span className="font-bold">{book.title}</span>
              </div>
            </div>
            <Link href="/dashboard?tab=books" className="py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg">
              Return to Books
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      <header className="p-4 flex items-center justify-between">
        <Link href={`/book/${bookId}`} className="text-gray-800 flex items-center">
          <ArrowLeft size={24} />
          <span className="ml-2 text-sm text-gray-600">back</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 truncate max-w-[60%]">{book.title}</h1>
        <div className="w-6"></div>
      </header>

      <div className="px-4 mb-4">
        <div className="bg-yellow-100 rounded-lg p-3 text-center">
          <p className="text-gray-700 nunito-font text-sm">
            A story about <span className="font-bold">{getCharacterNames()}</span>
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 pb-24">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Story Preview</h2>

          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-300 nunito-font text-sm flex items-center justify-center gap-2">
              <Printer size={16} />
              Order a printed copy
            </button>
          </div>

          <div className="space-y-8 mb-8">
            {book.content.map((paragraph, index) => (
              <div key={index} className="bg-yellow-50 rounded-lg p-6 shadow-sm">
                {book.pictures && index < book.pictures.length && (
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={book.pictures[index] || "/placeholder.svg"}
                      alt={`Illustration for page ${index + 1}`}
                      width={300}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="bg-yellow-200 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-800 nunito-font">{paragraph}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Feedback to Regenerate Storybook</h3>
            <p className="text-gray-700 nunito-font mb-4">
              Want to make the story even better? Tell us what you'd like changed — such as tone, plot, images, or anything else.
            </p>
            <textarea
              placeholder="What would you like us to improve or change?"
              className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>

          {/* Final Regenerate Button */}
          <div className="max-w-md mx-auto px-4 pb-12">
            <button
              onClick={() => setShowRegenerateModal(true)}
              disabled={!newComment.trim()}
              className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-colors duration-300 nunito-font text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} />
              Regenerate Storybook
            </button>
          </div>
        </div>
      </main>

      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Regenerate Story</h3>
              <button onClick={() => setShowRegenerateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 nunito-font mb-6">
              Are you sure you want to regenerate this story? This might take some time, and the current pictures will be replaced.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors duration-300 nunito-font"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateBook}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-300 nunito-font"
              >
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
