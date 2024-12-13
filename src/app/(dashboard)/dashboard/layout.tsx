import DashboardNav from "@/components/dashboard-nav";
import FloatingBadge from "@/components/floating-badge";
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen">
      <DashboardNav /> {children} <FloatingBadge />
    </div>
  );
}
