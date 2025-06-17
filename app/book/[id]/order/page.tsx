"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function OrderPrintedCopyPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  return (
    <div className="min-h-screen bg-[#FFF8E8] flex flex-col">
      <header className="p-4 flex items-center">
        <button onClick={() => router.back()} className="text-gray-800 flex items-center">
          <ArrowLeft size={24} />
          <span className="ml-2 text-sm text-gray-600">back</span>
        </button>
      </header>

      <main className="flex-1 px-4 pb-24 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Enter Your Payment Details</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number:</label>
            <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date:</label>
              <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV:</label>
              <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address:</label>
            <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input type="text" className="w-full border border-gray-400 rounded-lg px-3 py-2" />
          </div>
        </div>

        <button
          onClick={() => router.push(`/book/${bookId}/order/success`)}
          className="w-full mt-8 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-4 rounded-full text-lg transition-colors duration-300"
        >
          Place the Order
        </button>
      </main>
    </div>
  )
}
