import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">
              Connecting talent with opportunity.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Product</h4>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Company</h4>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">About</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} HireSwipe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
