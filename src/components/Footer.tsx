import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative z-10 bg-background/80 border-t border-border/10 py-12 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-border/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-1">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
              </div>
              <span className="font-bold text-xl text-foreground">Arunachala Hitech</span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">Engineering College<br/>Central Campus<br/>Main City.</p>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-3 text-sm text-foreground/50">
              <li><Link href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Anna University</Link></li>
              <li><Link href="https://www.aicte-india.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">AICTE Approvals</Link></li>
              <li><Link href="https://ndl.iitkgp.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Library Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">System Support</h4>
            <ul className="space-y-3 text-sm text-foreground/50">
              <li><Link href="mailto:it-helpdesk@college.edu" className="hover:text-foreground transition-colors">IT Helpdesk</Link></li>
              <li><Link href="mailto:erp-support@college.edu" className="hover:text-foreground transition-colors">ERP Guidelines</Link></li>
              <li><Link href="mailto:support@college.edu" className="hover:text-foreground transition-colors">Report an Issue</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/40">
          <p>© {new Date().getFullYear()} Arunachala Hitech Engineering College. All rights reserved.</p>
          <p>Designed by the Department of Computer Science</p>
        </div>
      </div>
    </footer>
  );
}
