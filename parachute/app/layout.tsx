import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { SessionProvider } from "@/components/auth/session-provider"

export const metadata: Metadata = {
  title: "Parachute",
  description: "Personal Relationship OS",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-56 min-h-screen bg-[#f9f9f8]">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
