import './globals.css'
import { Inter } from 'next/font/google'
import NavLink from '@/app/components/nav-link'
import LogoutButton from '@/app/components/LogoutButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'Brandible Agent',
  description: 'Agent Fulfillment Center',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans flex h-screen bg-gray-100`}>
        <aside className="w-64 bg-white shadow-md flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Brandible Agent</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavLink href="/">
              Pending Orders
            </NavLink>
            <NavLink href="/brands">
              Brand Management
            </NavLink>
            <NavLink href="/investors">
              Investor Management
            </NavLink>
            <NavLink href="/investor-levels">
              Investor Levels
            </NavLink>
            <NavLink href="/admin/payouts">
              Pending Payouts
            </NavLink>
            <NavLink href="/admin/reports">
              Pending Reports
            </NavLink>
            <NavLink href="/admin/achievements">
              Achievement Settings
            </NavLink>
            <NavLink href="/coin-packages">
              Coin Packages
            </NavLink>
            <NavLink href="/settings">
              App Settings
            </NavLink>
            <NavLink href="/activity-logs">
              Activity Logs
            </NavLink>
            <NavLink href="/agent/blog">
              Blog Management
            </NavLink>
            <NavLink href="/agent/polls">
              Poll Management
            </NavLink>
            <NavLink href="/analytics/profitability">
              Profitability Analysis
            </NavLink>
          </nav>
          <div className="p-4 border-t">
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
