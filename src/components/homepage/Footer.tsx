import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h3 className="text-2xl font-thin tracking-wider text-gray-800 mb-4">PRIVATE</h3>
          <p className="text-sm font-light text-gray-600 leading-relaxed mb-8 max-w-md mx-auto">
            The premier destination for sophisticated companionship services.
          </p>
          <div className="flex justify-center space-x-6 mb-8">
            <Link href="#" className="text-sm font-light tracking-widest text-gray-600 hover:text-pink-500">PRIVACY</Link>
            <Link href="#" className="text-sm font-light tracking-widest text-gray-600 hover:text-pink-500">TERMS</Link>
            <Link href="#" className="text-sm font-light tracking-widest text-gray-600 hover:text-pink-500">CONTACT</Link>
          </div>
          <p className="text-xs font-light text-gray-500 tracking-widest">
            © 2024 PRIVATE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}