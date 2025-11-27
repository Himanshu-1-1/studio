import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/icons/Logo';
import { Footer } from '@/components/shared/Footer';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === '1');
  
  const features = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Verified Profiles',
      description: 'Connect with confidence. We verify students, graduates, and companies to ensure a trustworthy network.',
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Matching',
      description: 'Our smart algorithm connects you with the right opportunities, saving you time and effort in your job search.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Direct Chat',
      description: 'Once a match is made, start conversations immediately. No more waiting for emails.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground">
                Find Your Next Swipe Right.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                HireSwipe is the fastest way to connect talent with opportunity. Swipe, match, and start your career conversation today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">I'm a Recruiter</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-2xl">
               {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              )}
              <div className="absolute inset-0 bg-primary/20" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Why HireSwipe?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We're building a trust-first platform to make hiring and job searching a seamless experience.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline pt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
