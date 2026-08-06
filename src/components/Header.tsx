import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="w-full bg-background/50 border-b border-border/10 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden p-1">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
            </Link>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl lg:text-2xl text-foreground leading-tight">Arunachala Hitech</span>
            <span className="text-[10px] lg:text-xs font-bold text-foreground/50 tracking-widest uppercase">Engineering College</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-foreground/60 mr-4">
            <Link href="/about" className="hover:text-foreground transition-colors">About Us</Link>
            <Link href="/academics" className="hover:text-foreground transition-colors">Academics</Link>
            <Link href="/admissions" className="hover:text-foreground transition-colors">Admissions</Link>
          </nav>
          <ThemeToggle />
          <Link href="/login" className="text-sm font-bold text-foreground/80 hover:text-foreground transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </header>
  );
}
