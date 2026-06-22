import { ProtectedLayout } from '@/components/ProtectedLayout'
import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <div className="flex min-h-screen main-bg">
        <Sidebar />
        <main className="flex-1 min-w-0 mt-16 md:mt-0 overflow-y-auto">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}
