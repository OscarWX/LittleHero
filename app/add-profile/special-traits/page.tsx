"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import AnimatedProgressBar from "@/components/animated-progress-bar"
import { createChildProfile } from "@/lib/db/child-profiles"

export default function SpecialTraitsPage() {
  const router = useRouter()
  const [specialTraits, setSpecialTraits] = useState("")
  const [favoriteThing, setFavoriteThing] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Check if we have temp profile data
  useEffect(() => {
    const tempData = localStorage.getItem("tempProfileData")
    if (!tempData) {
      // If no data, redirect back to first step
      router.push("/add-profile")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)
    setError("")

    try {
      // Get existing data and add special traits data
      const tempData = localStorage.getItem("tempProfileData")
      if (tempData) {
        const profileData = JSON.parse(tempData)

        // Create the complete profile in Supabase
        await createChildProfile({
          name: profileData.name,
          gender: profileData.gender,
          birthday: profileData.birthday,
          appearance: profileData.appearance,
          special_traits: specialTraits,
          favorite_thing: favoriteThing,
          avatar_url: profileData.photoUrl || null,
        })

        // Clear the temporary data
        localStorage.removeItem("tempProfileData")

        // Reset progress bar state when done
        localStorage.removeItem("profile-creation-progress")

        // Navigate back to dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : "Failed to save profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      {/* Progress bar */}
      <AnimatedProgressBar progress={100} flowKey="profile-creation" />

      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/add-profile/appearance" className="text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 ml-4">Special Traits</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 junegull-font text-center">
            WHAT MAKES YOUR LITTLE HERO SPECIAL?
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg nunito-font text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="specialTraits" className="block text-gray-800 nunito-font font-bold">
                Tell us about your child's unique traits
              </label>
              <textarea
                id="specialTraits"
                placeholder="What makes your child unique? What do they love to do?"
                className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                rows={4}
                value={specialTraits}
                onChange={(e) => setSpecialTraits(e.target.value)}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-800 nunito-font font-bold flex items-center mb-2">
                <Star size={16} className="text-yellow-500 mr-2" />
                Need some ideas?
              </h3>
              <ul className="text-gray-600 nunito-font text-sm space-y-2">
                <li>• Their favorite toy or stuffed animal companion</li>
                <li>• Activities they love (dancing, singing, building blocks)</li>
                <li>• Special abilities or talents they're proud of</li>
                <li>• Their favorite foods or snacks</li>
                <li>• Places they love to visit</li>
                <li>• How they show love to family and friends</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label htmlFor="favoriteThing" className="block text-gray-800 nunito-font font-bold">
                What's their favorite thing in the world?
              </label>
              <input
                id="favoriteThing"
                type="text"
                placeholder="Teddy bear, dinosaurs, princesses, etc."
                className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                value={favoriteThing}
                onChange={(e) => setFavoriteThing(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg mt-8 disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
