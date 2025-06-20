"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { bookApi } from "@/lib/api-client"
import { createSupabaseClient } from "@/lib/supabase"

type StoryPage = {
  pageNumber: number
  text: string
  imageDescription: string
}

type BookPage = {
  id: number
  book_id: string
  page_number: number
  image_url: string | null
  text_content: string | null
}

export default function BookPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [title, setTitle] = useState<string>("")
  const [pages, setPages] = useState<StoryPage[]>([])
  const [bookPages, setBookPages] = useState<BookPage[]>([])
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

        // Also fetch book pages with image info
        try {
          const { pages: dbPages } = await bookApi.getPages(bookId)
          console.log('Loaded book pages:', dbPages)
          setBookPages(dbPages || [])
        } catch (e) {
          console.error("Failed to load book pages", e)
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



  const getPageImage = (pageNumber: number) => {
    const bookPage = bookPages.find(p => p.page_number === pageNumber)
    return bookPage?.image_url
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null
    
    try {
      // Check if imagePath is already a full URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('Using existing full URL:', imagePath)
        return imagePath
      }
      
      // Use Supabase client to get the proper public URL for relative paths
      const supabase = createSupabaseClient()
      const { data } = supabase.storage
        .from('book-pages')
        .getPublicUrl(imagePath)
      
      console.log('Generated image URL for path:', imagePath, '-> URL:', data.publicUrl)
      return data.publicUrl
    } catch (error) {
      console.error('Error generating image URL for path:', imagePath, error)
      return null
    }
  }

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
        <Link href="/dashboard?tab=books" className="text-blue-600 underline nunito-font">
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
          {pages.map((page) => {
            const pageImagePath = getPageImage(page.pageNumber)
            const pageImageUrl = pageImagePath ? getImageUrl(pageImagePath) : null
            const bookPage = bookPages.find(p => p.page_number === page.pageNumber)
            
            return (
              <div key={page.pageNumber} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <h2 className="font-bold text-lg">Page {page.pageNumber}</h2>
                
                {/* Image section */}
                <div className="space-y-2">
                  <div className="w-full max-w-sm mx-auto h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative">
                    {pageImageUrl ? (
                      <>
                        <Image
                          src={pageImageUrl}
                          alt={`Illustration for page ${page.pageNumber}`}
                          width={300}
                          height={200}
                          className="w-full h-full rounded-lg object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', pageImageUrl)
                            // Hide the image and show placeholder instead
                            const target = e.currentTarget as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const placeholder = parent.querySelector('.image-placeholder')
                              if (placeholder) {
                                (placeholder as HTMLElement).style.display = 'flex'
                              }
                            }
                          }}
                        />
                        <div className="image-placeholder absolute inset-0 hidden flex-col items-center justify-center">
                          <ImageIcon size={32} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Image unavailable</p>
                        </div>

                      </>
                    ) : (
                      <>
                        <div className="text-center p-4">
                          <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Illustration will appear here</p>
                          {status === "creating-pictures" && (
                            <p className="text-xs text-gray-400 mt-2">Images will be added manually</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-800 nunito-font whitespace-pre-wrap">{page.text}</p>
                <p className="text-sm text-gray-500 nunito-font italic">Suggested: {page.imageDescription}</p>
              </div>
            )
          })}
          {pages.length === 0 && (
            <p className="text-gray-700 nunito-font">No story pages found.</p>
          )}
        </div>
      </main>
    </div>
  )
}
