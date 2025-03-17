'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <div className={isDashboard ? 'dashboard-header' : ''}>
      <Header />
      {isDashboard && (
        <style jsx global>{`
          .dashboard-header header {
            background-color: hsla(240, 10%, 3.9%, 0.8) !important;
            backdrop-filter: blur(8px) !important;
          }
        `}</style>
      )}
    </div>
  );
}
