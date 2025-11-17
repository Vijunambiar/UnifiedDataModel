import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-teal-50/20">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-orange-100 shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <a href="/" className="font-bold tracking-tight">
            <span className="text-lg bg-gradient-to-r from-primary via-orange-600 to-orange-700 bg-clip-text text-transparent font-semibold">
              Banking Data Model Blueprint
            </span>
          </a>
          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm"
            >
              <a href="/platform-blueprint">Blueprint</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="hover:bg-orange-50 hover:text-primary transition-colors"
            >
              <a href="/domains">Domains</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="hover:bg-teal-50 hover:text-secondary transition-colors"
            >
              <a href="/layers">Layers</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <a href="/platform-summary">Platform Summary</a>
            </Button>
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary shadow-md hover:shadow-lg transition-all"
            >
              <a href="/data-models">Data Models</a>
            </Button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-10 px-6">{children}</main>
      <footer className="mt-16 border-t border-orange-100 bg-gradient-to-r from-orange-50/50 to-teal-50/30">
        <div className="container mx-auto py-8 px-6 text-sm text-muted-foreground flex items-center justify-between">
          <span className="font-medium">
            Banking Unified Data Model Blueprint
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              <span>Bronze</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
              <span>Silver</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Gold</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>Semantic</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
