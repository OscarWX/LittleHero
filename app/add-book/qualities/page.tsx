"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AnimatedProgressBar from "@/components/animated-progress-bar"

// Define quality option types
type QualityOption = {
  id: string
  label: string
}

export default function QualitiesPage() {
  const router = useRouter()
  const [bookId, setBookId] = useState<string>("")
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [customQuality, setCustomQuality] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Quality options
  const qualityOptions: QualityOption[] = [
    { id: "courage", label: "Courage" },
    { id: "kindness", label: "Kindness" },
    { id: "honesty", label: "Honesty" },
    { id: "perseverance", label: "Perseverance" },
    { id: "creativity", label: "Creativity" },
    { id: "patience", label: "Patience" },
    { id: "responsibility", label: "Responsibility" },
    { id: "gratitude", label: "Gratitude" },
    { id: "empathy", label: "Empathy" },
    { id: "teamwork", label: "Teamwork" },
    { id: "curiosity", label: "Curiosity" },
    { id: "custom", label: "Other" },
  ]

  // Load book data from URL parameters
  useEffect(() => {
    const loadBookData = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const bookIdParam = urlParams.get('bookId')
        
        if (!bookIdParam) {
          // No bookId, redirect back to start
          router.push("/add-book")
          return
        }
        
        setBookId(bookIdParam)
        setIsLoading(false)
      } catch (e) {
        console.error("Error loading book data", e)
        router.push("/add-book")
      }
    }

    loadBookData()
  }, [router])

  // Handle quality selection toggle
  const toggleQuality = (qualityId: string) => {
    if (qualityId === "custom") {
      if (selectedQualities.includes("custom")) {
        setSelectedQualities([])
      } else {
        setSelectedQualities(["custom"])
      }
    } else {
      if (selectedQualities.includes(qualityId)) {
        setSelectedQualities([])
      } else {
        setSelectedQualities([qualityId])
      }
    }
  }

  // Handle next button click
  const handleNext = async () => {
    if (!bookId) return

    try {
      setIsLoading(true)
      
      // Build qualities array
      const qualities = selectedQualities
        .filter((id) => id !== "custom")
        .map((id) => qualityOptions.find((q) => q.id === id)?.label || "")

      // Add custom quality if specified
      if (selectedQualities.includes("custom") && customQuality) {
        qualities.push(customQuality)
      }

      // Save qualities to backend
      const response = await fetch('/api/books/creation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          qualities
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save qualities')
      }

      // Navigate to the next page with bookId
      router.push(`/add-book/magical-details?bookId=${bookId}`)
    } catch (error) {
      console.error('Error saving qualities:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      {/* Progress bar */}
      <AnimatedProgressBar progress={50} flowKey="book-creation" />

      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href={`/add-book/theme?bookId=${bookId}`} className="text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 ml-4">Character Qualities</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 junegull-font text-center">
            WHAT QUALITIES WOULD YOU LIKE TO HIGHLIGHT?
          </h2>

          {/* Qualities selection */}
          <div className="bg-white p-4 rounded-lg mb-8 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {qualityOptions.map((quality) => (
                <button
                  key={quality.id}
                  className={`flex items-center p-3 rounded-lg text-left transition-colors ${
                    selectedQualities.includes(quality.id)
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => toggleQuality(quality.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                      selectedQualities.includes(quality.id) ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    {selectedQualities.includes(quality.id) && <Check size={12} className="text-white" />}
                  </div>
                  <span className="nunito-font">{quality.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom quality input */}
          {selectedQualities.includes("custom") && (
            <div className="bg-white p-4 rounded-lg mb-8 border border-gray-200">
              <label htmlFor="customQuality" className="block text-gray-800 nunito-font font-bold mb-2">
                Describe the quality:
              </label>
              <input
                id="customQuality"
                type="text"
                placeholder="Enter a custom quality..."
                className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                value={customQuality}
                onChange={(e) => setCustomQuality(e.target.value)}
              />
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={selectedQualities.length === 0 || (selectedQualities.includes("custom") && !customQuality)}
            className="w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Magical Details
          </button>
        </div>
      </main>
    </div>
  )
}
