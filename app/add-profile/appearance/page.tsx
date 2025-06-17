"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import AnimatedProgressBar from "@/components/animated-progress-bar"
import { uploadFile, STORAGE_BUCKETS, generateFileName, getFileExtension } from "@/lib/storage"
import { useAuth } from "@/hooks/use-auth"

export default function AppearancePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, loading: authLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState<"photo" | "description">("photo")
  const [hasPhoto, setHasPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [hairColor, setHairColor] = useState("")
  const [eyeColor, setEyeColor] = useState("")
  const [skinTone, setSkinTone] = useState("")
  const [otherFeatures, setOtherFeatures] = useState("")

  // Check if we have temp profile data and user is authenticated
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/sign-in")
      return
    }

    const tempData = localStorage.getItem("tempProfileData")
    if (!tempData) {
      // If no data, redirect back to first step
      router.push("/add-profile")
    }
  }, [router, user, authLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Get existing data and add appearance data
    const tempData = localStorage.getItem("tempProfileData")
    if (tempData) {
      const profileData = JSON.parse(tempData)

      // Add appearance data
      const updatedData = {
        ...profileData,
        photoUrl, // This will now be the actual Supabase storage URL
        appearance: {
          hairColor,
          eyeColor,
          skinTone,
          otherFeatures,
        },
      }

      localStorage.setItem("tempProfileData", JSON.stringify(updatedData))
    }

    // Navigate to the next page
    router.push("/add-profile/special-traits")
  }

  // Handle real photo upload to Supabase storage
  const handleFileSelect = async (file: File) => {
    if (!user) {
      setUploadError("You must be logged in to upload photos")
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, or WebP)")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError("")

    try {
      // Generate unique filename
      const fileExt = getFileExtension(file.name)
      const fileName = generateFileName(user.id, 'profile-temp', fileExt)

      // Upload to Supabase storage
      const { url } = await uploadFile(STORAGE_BUCKETS.PROFILE_PHOTOS, fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

      // Update state with uploaded photo
      setPhotoUrl(url)
      setHasPhoto(true)

    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Handle photo upload click
  const handlePhotoUpload = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHasPhoto(false)
    setPhotoUrl("")
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8E8]">
        <div className="text-lg text-gray-600 nunito-font">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8E8]">
      {/* Progress bar */}
      <AnimatedProgressBar progress={66.6} flowKey="profile-creation" />

      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/add-profile" className="text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 ml-4">Appearance</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 junegull-font text-center">
            WHAT DOES YOUR LITTLE HERO LOOK LIKE?
          </h2>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-3 font-bold nunito-font ${
                activeTab === "photo"
                  ? "text-yellow-600 border-b-2 border-yellow-400"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("photo")}
            >
              Upload Photos
            </button>
            <button
              className={`flex-1 py-3 font-bold nunito-font ${
                activeTab === "description"
                  ? "text-yellow-600 border-b-2 border-yellow-400"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Describe Character
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "photo" ? (
              <div className="space-y-4">
                {/* Upload error */}
                {uploadError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg nunito-font text-sm">
                    {uploadError}
                  </div>
                )}

                {/* File input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Upload area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-white transition-colors ${
                    isUploading 
                      ? "border-yellow-300 bg-yellow-50 cursor-not-allowed" 
                      : hasPhoto 
                      ? "border-green-300 bg-green-50 cursor-pointer" 
                      : "border-gray-300 hover:border-yellow-300 cursor-pointer"
                  }`}
                  onClick={handlePhotoUpload}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {isUploading ? (
                    <div className="text-center">
                      <Loader2 size={32} className="text-yellow-500 mb-2 animate-spin" />
                      <p className="text-yellow-700 nunito-font">Uploading photo...</p>
                    </div>
                  ) : hasPhoto ? (
                    <div className="text-center relative">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden relative">
                        <img 
                          src={photoUrl} 
                          alt="Child" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-green-600 nunito-font font-medium">Photo uploaded successfully!</p>
                      <p className="text-sm text-gray-600 nunito-font mt-1">
                        Click to upload a different photo
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-600 nunito-font text-center mb-2">
                        Drag and drop a photo here or click to browse
                      </p>
                      <button
                        type="button"
                        className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg nunito-font transition-colors"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 nunito-font">
                    <strong>💡 Tips for best results:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 nunito-font mt-2 space-y-1">
                    <li>• Upload a clear, well-lit photo of your child's face</li>
                    <li>• Make sure the photo shows their features clearly</li>
                    <li>• Supported formats: JPEG, PNG, WebP (max 5MB)</li>
                    <li>• This will help create personalized story illustrations</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="hairColor" className="block text-gray-800 nunito-font font-bold">
                    Hair Color
                  </label>
                  <select
                    id="hairColor"
                    className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                    value={hairColor}
                    onChange={(e) => setHairColor(e.target.value)}
                  >
                    <option value="">Select hair color</option>
                    <option value="black">Black</option>
                    <option value="brown">Brown</option>
                    <option value="blonde">Blonde</option>
                    <option value="red">Red</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="eyeColor" className="block text-gray-800 nunito-font font-bold">
                    Eye Color
                  </label>
                  <select
                    id="eyeColor"
                    className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                  >
                    <option value="">Select eye color</option>
                    <option value="brown">Brown</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="hazel">Hazel</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="skinTone" className="block text-gray-800 nunito-font font-bold">
                    Skin Tone
                  </label>
                  <select
                    id="skinTone"
                    className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                  >
                    <option value="">Select skin tone</option>
                    <option value="fair">Fair</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="tan">Tan</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="otherFeatures" className="block text-gray-800 nunito-font font-bold">
                    Other Notable Features
                  </label>
                  <textarea
                    id="otherFeatures"
                    placeholder="Glasses, freckles, dimples, etc."
                    className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                    rows={3}
                    value={otherFeatures}
                    onChange={(e) => setOtherFeatures(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Next"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
