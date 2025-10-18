import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-purple-800 mb-4">
          Tooth Fairy Protocol
        </h1>
        <p className="text-xl text-purple-600 mb-8">
          A playful way to teach kids about money through the magic of tooth fairy payments
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/parent"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Parent Dashboard</h2>
            <p className="text-gray-600">
              Manage your family, approve payments, and track your children's progress
            </p>
          </Link>
          
          <Link 
            href="/child"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="text-4xl mb-4">🦷</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Child View</h2>
            <p className="text-gray-600">
              See your teeth collection, track your balance, and watch your savings grow
            </p>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Demo: Use family code <strong>DEMO123</strong> to access the parent dashboard</p>
        </div>
      </div>
    </div>
  )
}
