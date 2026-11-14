"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page empty-state">
      <h1>Unable to load this view.</h1>
      <p>
        No transaction outcome is implied. Check any submitted transaction
        reference before retrying a write.
      </p>
      <Button onClick={reset}>Reload view</Button>
    </div>
  );
}
