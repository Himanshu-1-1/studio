import { SwipeFeed } from "@/components/seeker/SwipeFeed";

export default function FindJobsPage() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold font-headline">Discover Opportunities</h1>
        <p className="text-muted-foreground">Swipe right to apply, or left to pass.</p>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <SwipeFeed />
      </div>
    </div>
  );
}
