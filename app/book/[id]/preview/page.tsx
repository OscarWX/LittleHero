"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { bookApi } from "@/lib/api-client"

type StoryPage = {
  pageNumber: number
  text: string
  imageDescription: string
}

export default function BookPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [title, setTitle] = useState<string>("")
  const [pages, setPages] = useState<StoryPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { book } = await bookApi.getById(bookId)

        if (!["ready", "creating-pictures"].includes(book.status) || !book.story_content) {
          router.push("/dashboard?tab=books")
          return
        }

        setTitle(book.title)
        setStatus(book.status)

        try {
          const story = JSON.parse(book.story_content)
          setPages(story.pages || [])
        } catch (e) {
          console.error("Failed to parse story_content", e)
          setError("Failed to load story")
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error fetching book", e)
        setError("Failed to load book")
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [bookId, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8E8]">
        <p className="text-gray-600 nunito-font">Loading story...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8E8] p-6">
        <p className="text-red-600 nunito-font mb-4">{error}</p>
        <Link href="/dashboard" className="text-blue-600 underline nunito-font">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      <header className="p-4 flex items-center">
        <Link href="/dashboard?tab=books" className="text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 ml-4 truncate">{title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-12">
        {status === "creating-pictures" && (
          <div className="max-w-md mx-auto mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center shadow-sm">
            <p className="text-blue-700 nunito-font text-sm">
              ✨ We're busy illustrating your story! Pictures will appear automatically once they're ready.
            </p>
          </div>
        )}
        <div className="max-w-md mx-auto space-y-8">
          {pages.map((page) => (
            <div key={page.pageNumber} className="bg-white p-4 rounded-lg shadow-sm space-y-2">
              <h2 className="font-bold text-lg">Page {page.pageNumber}</h2>
              <p className="text-gray-800 nunito-font whitespace-pre-wrap">{page.text}</p>
              {status === "ready" ? (
                <p className="text-sm text-gray-500 nunito-font italic">Illustration: {page.imageDescription}</p>
              ) : (
                <p className="text-sm text-gray-400 nunito-font italic">Illustration is being generated…</p>
              )}
            </div>
          ))}
          {pages.length === 0 && (
            <p className="text-gray-700 nunito-font">No story pages found.</p>
          )}
        </div>
      </main>
    </div>
  )
}
