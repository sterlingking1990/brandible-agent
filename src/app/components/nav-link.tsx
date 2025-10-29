'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex items-center p-2 text-base font-normal rounded-lg ${isActive ? 'bg-indigo-700 text-white' : 'text-gray-900 hover:bg-gray-100'}`}>
      {children}
    </Link>
  );
}
