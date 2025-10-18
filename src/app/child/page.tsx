'use client'

import { useEffect, useState } from 'react'
import CreateSampleDataButton from './CreateSampleDataButton'

type Child = {
  id: string
  name: string
  age: number
  balance: number
  dailyBrushGoal: number
  priceIncrease: number
  currentToothValue: number
  family: {
    id: string
    name: string
    demoCode: string
    parentName: string
  }
  teeth: Array<{
    id: string
    toothType: string
    valueAtLoss: number
    paid: boolean
    paidAt: string | null
    lostDate: string
  }>
  brushSessions: Array<{
    id: string
    timestamp: string
    verified: boolean
  }>
  transactions: Array<{
    id: string
    amount: number
    description: string
    createdAt: string
  }>
}

export default function ChildPage() {
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadChildData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to get child data using the test child ID
      const response = await fetch('/api/child?childId=test-child-id')
      
      if (response.ok) {
        const { child: childData } = await response.json()
        setChild(childData)
      } else if (response.status === 404) {
        // Child not found, will show empty state
        setChild(null)
      } else {
        throw new Error('Failed to load child data')
      }
    } catch (error) {
      console.error('Error loading child data:', error)
      setError('Failed to load child data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChildData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">Loading your teeth collection...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-purple-800 mb-8">
            Welcome to the Tooth Fairy Protocol
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">
              No child data found. Let's create some sample teeth to get started!
            </p>
            <CreateSampleDataButton onDataCreated={loadChildData} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <p className="text-sm text-purple-600">Family: {child.family.name}</p>
              <p className="text-xs text-gray-500">Code: {child.family.demoCode}</p>
            </div>
            <button 
              onClick={loadChildData}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors"
            >
              Refresh
            </button>
          </div>
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            {child.name}'s Teeth Collection
          </h1>
          <p className="text-lg text-purple-600">
            Age: {child.age} • Balance: ${child.balance.toFixed(2)}
          </p>
        </div>

        {/* Teeth Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {child.teeth.map((tooth, index) => (
            <div 
              key={tooth.id}
              className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-2">
                {tooth.paid ? '✓' : '○'}
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                Tooth #{index + 1}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {tooth.toothType}
              </p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                tooth.paid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tooth.paid ? 'Paid' : '$' + tooth.valueAtLoss.toFixed(2)}
              </div>
              {tooth.paid && (
                <p className="text-xs text-gray-500 mt-1">
                  Paid on {new Date(tooth.paidAt!).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">Teeth</div>
            <h3 className="font-bold text-xl text-gray-800">Total Teeth</h3>
            <p className="text-3xl font-bold text-purple-600">{child.teeth.length}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">Value</div>
            <h3 className="font-bold text-xl text-gray-800">Total Value</h3>
            <p className="text-3xl font-bold text-green-600">
              ${child.teeth.reduce((sum, tooth) => sum + tooth.valueAtLoss, 0).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">Paid</div>
            <h3 className="font-bold text-xl text-gray-800">Paid Teeth</h3>
            <p className="text-3xl font-bold text-blue-600">
              {child.teeth.filter(tooth => tooth.paid).length}
            </p>
          </div>
        </div>

        {/* Current Tooth Value */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="font-bold text-2xl text-gray-800 mb-2">
            Current Tooth Value
          </h3>
          <p className="text-4xl font-bold text-pink-600">
            ${child.currentToothValue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Each new tooth starts at this value and increases by ${child.priceIncrease.toFixed(2)} each time!
          </p>
        </div>
      </div>
    </div>
  )
}
