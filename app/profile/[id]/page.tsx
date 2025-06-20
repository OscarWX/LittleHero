"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { fetchUserBooks, type BookWithProfiles } from "@/lib/db/books"
import { fetchChildProfileById, deleteChildProfile, type ChildProfile } from "@/lib/db/child-profiles"
import { useAuth } from "@/hooks/use-auth"

export default function ProfileDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [books, setBooks] = useState<BookWithProfiles[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [photoError, setPhotoError] = useState(false)

  // Load profile and books data
  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return

      try {
        setLoading(true)
        setError("")

        // Load profile
        const profileData = await fetchChildProfileById(profileId)
        if (!profileData) {
          router.push("/dashboard")
          return
        }
        setProfile(profileData)

        // Load books that include this profile
        const allBooks = await fetchUserBooks()
        const profileBooks = allBooks.filter(book => 
          book.child_profiles.some(p => p.id === profileId)
        )
        setBooks(profileBooks)

      } catch (e) {
        console.error("Error loading data:", e)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [profileId, router, user, authLoading])

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, authLoading, router])

  // Format birthday
  const formatBirthday = (dateString?: string | null) => {
    if (!dateString) return "Not specified"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const handleDelete = async () => {
    if (!profile) return
    
    if (confirm(`Are you sure you want to delete ${profile.name}'s profile?`)) {
      try {
        await deleteChildProfile(profileId)
        router.push("/dashboard")
      } catch (e) {
        console.error("Error deleting profile:", e)
        setError("Failed to delete profile")
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8E8]">
        <div className="text-lg text-gray-600 nunito-font">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8E8] p-6">
        <div className="text-red-600 nunito-font mb-4">{error}</div>
        <Link href="/dashboard" className="text-blue-600 underline nunito-font">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8E8] p-6">
        <div className="text-gray-600 nunito-font mb-4">Profile not found</div>
        <Link href="/dashboard" className="text-blue-600 underline nunito-font">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 p-1">
            <MoreHorizontal size={24} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg overflow-hidden z-10">
              <Link
                href={`/profile/${profileId}/edit`}
                className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                <Pencil size={16} className="mr-2" />
                <span className="nunito-font">Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                <Trash2 size={16} className="mr-2" />
                <span className="nunito-font">Delete</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile content */}
      <main className="flex-1 p-6">
        {/* Profile image */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-200 to-orange-200">
            {profile.avatar_url && !photoError ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
                onError={() => {
                  setPhotoError(true)
                }}
              />
            ) : (
              <span className="text-white text-3xl font-bold">{profile.name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Profile details */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <p className="text-gray-800 nunito-font">
              <span className="font-bold">Birthday:</span> {formatBirthday(profile.birthday)}
            </p>
            {profile.gender && (
              <p className="text-gray-800 nunito-font font-bold">{profile.gender === "boy" ? "Boy" : "Girl"}</p>
            )}
          </div>

          {profile.special_traits && (
            <div className="mt-4">
              <p className="text-gray-800 nunito-font">
                <span className="font-bold">Special traits:</span> {profile.special_traits}
              </p>
            </div>
          )}

          {profile.favorite_thing && (
            <div className="mt-2">
              <p className="text-gray-800 nunito-font">
                <span className="font-bold">Favorite thing:</span> {profile.favorite_thing}
              </p>
            </div>
          )}
        </div>

        {/* Books section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Books:</h2>

          {books.length > 0 ? (
            <div className="bg-yellow-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                {books.map((book) => (
                  <div key={book.id} className="flex flex-col items-center">
                    <Link href={`/book/${book.id}/preview`} className="block">
                      <div className="w-20 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center mb-2 shadow-md">
                        {book.cover_url ? (
                          <Image
                            src={book.cover_url}
                            alt={book.title}
                            width={80}
                            height={96}
                            className="object-cover w-full h-full rounded-lg"
                          />
                        ) : (
                          <span className="text-white text-lg font-bold text-center px-2">
                            {book.title.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </Link>
                    <span className="text-gray-800 nunito-font text-sm text-center">
                      {book.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 rounded-lg p-6 text-center">
              <p className="text-gray-600 nunito-font mb-4">
                No books created yet for {profile.name}
              </p>
              <Link
                href="/add-book"
                className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font"
              >
                Create First Book
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
