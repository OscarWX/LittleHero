export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF8E8]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
        <p className="text-gray-600 nunito-font">Loading dashboard...</p>
      </div>
    </div>
  )
}
