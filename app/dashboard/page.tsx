"use client"

import { useState, useEffect } from "react"
import { User, BookOpen, Plus, Clock, CheckCircle, ImageIcon, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { fetchUserChildProfiles, type ChildProfile } from "@/lib/db/child-profiles"
import { fetchUserBooks, type BookWithProfiles } from "@/lib/db/books"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam === "books" ? "books" : "profiles")
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Load profiles from Supabase
  useEffect(() => {
    const loadProfiles = async () => {
      if (authLoading || !user) {
        return
      }

      try {
        const userProfiles = await fetchUserChildProfiles()
        setProfiles(userProfiles)
      } catch (e) {
        console.error("Error loading profiles", e)
      }
      setIsLoaded(true)
    }

    loadProfiles()
  }, [user, authLoading])

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/sign-in"
    }
  }, [user, authLoading])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8E8]">
        <div className="text-lg text-gray-600 nunito-font">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#FFF8E8]">
      {/* Content area */}
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "profiles" && <ProfilesTab profiles={profiles} />}
        {activeTab === "books" && <BooksTab />}
      </main>

      {/* Floating action button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <Link
          href={"/add-book"}
          className="w-14 h-14 rounded-full bg-yellow-300 flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl font-bold text-gray-900">+</span>
        </Link>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#C1E1C1] h-16">
        <div className="flex justify-around items-center h-full">
          <button
            onClick={() => setActiveTab("profiles")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === "profiles" ? "text-gray-900" : "text-gray-600"
            }`}
          >
            <User size={24} />
            <span className="text-xs mt-1 nunito-font">Profiles</span>
          </button>
          <div className="w-16"></div> {/* Spacer for the FAB */}
          <button
            onClick={() => setActiveTab("books")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === "books" ? "text-gray-900" : "text-gray-600"
            }`}
          >
            <BookOpen size={24} />
            <span className="text-xs mt-1 nunito-font">Books</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

function ProfilesTab({ profiles }: { profiles: ChildProfile[] }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profiles</h1>

      {/* Fixed grid layout with proper spacing */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-8">

        {/* Existing profiles */}
        {profiles.map((profile) => (
          <div key={profile.id} className="flex flex-col items-center">
            <Link href={`/profile/${profile.id}`} className="block">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-md shadow-gray-400 bg-gradient-to-br from-yellow-200 to-orange-200">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // If image fails to load, show fallback
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'block'
                    }}
                  />
                ) : null}
                <span 
                  className={`text-white text-2xl font-bold ${profile.avatar_url ? 'hidden' : 'block'}`}
                  style={{ display: profile.avatar_url ? 'none' : 'block' }}
                >
                  {profile.name.charAt(0)}
                </span>
              </div>
            </Link>
            <span className="text-gray-900 nunito-font text-center">{profile.name}</span>
          </div>
        ))}

        {/* Create new profile button - moved to the end */}
        <div className="flex flex-col items-center">
          <Link href="/add-profile" className="block">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-2 shadow-md shadow-gray-400">
              <Plus size={32} className="text-gray-500" />
            </div>
          </Link>
          <span className="text-gray-400 nunito-font text-center">Create a profile</span>
        </div>
      </div>
    </div>
  )
}

function BooksTab() {
  const [books, setBooks] = useState<BookWithProfiles[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Load books from Supabase
  const loadBooks = async (showRefreshing = false) => {
    if (authLoading || !user) {
      return
    }

    if (showRefreshing) setIsRefreshing(true)

    try {
      const userBooks = await fetchUserBooks()
      setBooks(userBooks)
    } catch (e) {
      console.error("Error loading books", e)
    }
    
    setIsLoaded(true)
    if (showRefreshing) setIsRefreshing(false)
  }

  useEffect(() => {
    loadBooks()
  }, [user, authLoading])

  // Auto-refresh every 30 seconds to check for status updates
  useEffect(() => {
    if (!user || authLoading) return

    const interval = setInterval(() => {
      loadBooks()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user, authLoading])

  // Get status icon and text for a book
  const getBookStatus = (status?: string) => {
    switch (status) {
      case "creating-pictures":
        return {
          icon: <ImageIcon size={18} className="text-blue-600" />,
          text: "Creating pictures...",
          color: "bg-blue-50 text-blue-700",
        }
      case "processing":
        return {
          icon: <Clock size={18} className="text-orange-500" />,
          text: "Processing...",
          color: "bg-orange-50 text-orange-700",
        }
      case "ready":
        return {
          icon: <CheckCircle size={18} className="text-green-500" />,
          text: "Ready to read",
          color: "bg-green-50 text-green-700",
        }
      default:
        return {
          icon: <BookOpen size={18} className="text-gray-500" />,
          text: "Draft",
          color: "bg-gray-50 text-gray-700",
        }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        <button
          onClick={() => loadBooks(true)}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            isRefreshing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10 justify-items-center">
        {/* Existing books */}
        {books.map((book) => {
          const status = getBookStatus(book.status)

          return (
            <div key={book.id} className="flex flex-col items-center">
              <Link href={`/book/${book.id}/preview`} className="block">
                <div className="w-32 h-32 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative shadow-md shadow-gray-400 bg-gradient-to-br from-yellow-200 to-orange-200">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">📚</span>
                  )}

                  {/* Status badge */}
                  {book.status && book.status !== 'draft' && (
                    <div
                      className={`absolute bottom-0 left-0 right-0 py-1 px-2 ${status.color} text-xs flex items-center justify-center gap-1`}
                    >
                      {status.icon}
                      <span className="nunito-font font-bold truncate">{status.text}</span>
                    </div>
                  )}
                </div>
              </Link>
              <span className="text-gray-900 nunito-font text-center">{book.title}</span>
            </div>
          )
        })}

        {/* Create new book button */}
        <div className="flex flex-col items-center">
          <Link href="/add-book" className="block">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 shadow-md shadow-gray-400">
              <Plus size={32} className="text-gray-500" />
            </div>
          </Link>
          <span className="text-gray-400 nunito-font text-center">Create a book</span>
        </div>

        {books.length === 0 && isLoaded && (
          <div className="w-full text-center text-gray-500 mt-8">
            <p>No books yet. Create your first book!</p>
          </div>
        )}
      </div>
    </div>
  )
}
