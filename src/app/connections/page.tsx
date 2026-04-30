'use client'
import { ConnectionList } from '@/components/connections/ConnectionList'

export default function ConnectionsPage() {
  return (
    <div className="flex flex-col h-screen bg-[#111]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header className="flex items-center gap-2 px-6 border-b border-[#222] shrink-0" style={{ height: 48 }}>
        <span className="text-base font-bold text-green-400 font-mono tracking-tight">pg</span>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#555]">client</span>
      </header>
      <main className="flex-1 flex items-start justify-center pt-16 px-6 overflow-auto">
        <div className="w-full max-w-[520px]">
          <ConnectionList />
        </div>
      </main>
    </div>
  )
}
