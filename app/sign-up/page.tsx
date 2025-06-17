"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/hooks/use-auth"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const result = await signUp(email, password)
    
    if (result.success) {
      setSuccess(true)
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } else {
      setError(result.error || "Sign up failed")
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 overflow-hidden relative">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-orange-200 -translate-x-1/2 -translate-y-1/4" />
      <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-yellow-200 translate-x-1/3" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-green-200 -translate-y-1/4" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-green-200 translate-y-1/2" />

      {/* Content container */}
      <div className="flex flex-col items-center justify-between min-h-screen py-8 px-6 z-10 max-w-md w-full">
        {/* Back button */}
        <div className="self-start">
          <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="nunito-font font-bold">Back</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-gray-900 junegull-font">LITTLE HERO</h1>
          <h2 className="text-xl font-bold mt-3 text-gray-800 nunito-font">Join the Adventure!</h2>
        </div>

        {/* Sign Up Form */}
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <h3 className="font-bold nunito-font">Account Created Successfully!</h3>
                <p className="text-sm mt-2 nunito-font">Redirecting to your dashboard...</p>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg nunito-font text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-800 nunito-font font-bold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 rounded-full border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-gray-800 nunito-font font-bold">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-full border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <p className="text-xs text-gray-600 nunito-font">Password must be at least 6 characters long</p>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-yellow-300 text-yellow-500 focus:ring-yellow-400"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-800 nunito-font">
                    I agree to the{" "}
                    <a href="#" className="text-gray-600 hover:text-gray-800 font-bold">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-gray-600 hover:text-gray-800 font-bold">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <p className="text-gray-800 nunito-font">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-800 font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 mb-4 text-center text-xs text-gray-700 nunito-font">
          © 2025 Little Hero. All rights reserved.
        </div>
      </div>
    </div>
  )
}
