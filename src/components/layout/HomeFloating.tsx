import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeFloating() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      <Button asChild variant="gold" size="sm" className="shadow-lg">
        <a href="/" aria-label="Home">
          <Home className="h-4 w-4" />
          Home
        </a>
      </Button>
    </div>
  );
}
