'use client';

import Link from 'next/link';

export default function DashboardFooter() {
  return (
    <footer className="bg-[hsl(240,10%,3.9%)] text-white">
      {/* Unterer Bereich mit Copyright */}
      <div className="border-t-2 border-t-[hsl(345.3,82.7%,40.8%)] py-6 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TheGND. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-6">
            <Link href="/agb" className="text-zinc-400 text-sm hover:text-[hsl(345.3,82.7%,40.8%)]">AGB</Link>
            <Link href="/datenschutz" className="text-zinc-400 text-sm hover:text-[hsl(345.3,82.7%,40.8%)]">Datenschutz</Link>
            <Link href="/impressum" className="text-zinc-400 text-sm hover:text-[hsl(345.3,82.7%,40.8%)]">Impressum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
