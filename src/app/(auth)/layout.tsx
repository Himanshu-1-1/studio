import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
       <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
        <Link href="/">
            <Logo />
        </Link>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
