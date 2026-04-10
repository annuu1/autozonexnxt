import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import PublicBackground from "@/components/layout/PublicBackground";

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <PublicBackground />
      <PublicNavbar />

      {/* Content wrapper */}
      <main className="relative z-10 flex-1 pt-32 pb-20">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
