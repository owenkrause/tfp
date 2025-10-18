'use client'

import React from 'react'

interface CreateSampleDataButtonProps {
  onDataCreated?: () => void
}

export default function CreateSampleDataButton({ onDataCreated }: CreateSampleDataButtonProps) {
  const handleCreateSampleData = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        if (onDataCreated) {
          onDataCreated()
        } else {
          window.location.reload()
        }
      } else {
        alert('Failed to create sample data')
      }
    } catch (error) {
      alert('Error creating sample data')
    }
  }

  return (
    <button 
      onClick={handleCreateSampleData}
      className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
    >
      Create Sample Data
    </button>
  )
}