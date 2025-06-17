"use client"

import { useEffect, useState } from "react"

interface AnimatedProgressBarProps {
  progress: number // 0 to 100
  color?: string
  flowKey: string // "profile-creation" or "book-creation"
}

export default function AnimatedProgressBar({ progress, color = "bg-yellow-400", flowKey }: AnimatedProgressBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0)

  useEffect(() => {
    // Get the previous progress from localStorage
    const previousProgress = Number.parseFloat(localStorage.getItem(`${flowKey}-progress`) || "0")

    // Start with previous progress
    setAnimatedWidth(previousProgress)

    // Small delay to ensure the initial width is rendered
    const timer = setTimeout(() => {
      // Animate to the actual progress
      setAnimatedWidth(progress)

      // Save current progress for next page
      localStorage.setItem(`${flowKey}-progress`, progress.toString())
    }, 100)

    return () => clearTimeout(timer)
  }, [progress, flowKey])

  return (
    <div className="w-full h-2 bg-gray-200">
      <div
        className={`h-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${animatedWidth}%` }}
      ></div>
    </div>
  )
}
