import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col w-full relative">
      <Header />
      <div className="flex-1 w-full relative">
        {children}
      </div>
      <Footer />
    </div>
  );
}
