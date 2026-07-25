import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer section={{ id: "footer", sectionKey: "footer", title: "Footer", description: null, config: {}, media: [] }} />
    </div>
  );
}
