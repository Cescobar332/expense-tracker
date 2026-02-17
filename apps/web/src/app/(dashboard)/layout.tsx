import { AuthGuard } from '../../components/layout/auth-guard';
import { Sidebar } from '../../components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Sidebar />
        <main className="lg:pl-64 pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
