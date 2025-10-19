import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="flex gap-6">
        <Link
          href="/parent"
          className="hover:scale-105 transition-transform"
        >
          <Image
            src="/parent_icon.png"
            alt="Parent Dashboard"
            width={200}
            height={200}
          />
        </Link>
        
        <Link 
          href="/child"
          className="hover:scale-105 transition-transform"
        >
          <Image
            src="/child_login.png"
            alt="Child Login"
            width={200}
            height={200}
          />
        </Link>
      </div>
    </div>
  )
}
