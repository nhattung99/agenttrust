import { EmptyState } from "@/components/shared";
export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        title="This record could not be found."
        description="Browse the directory or task explorer to find an on-chain record."
        href="/tasks"
        label="Explore tasks"
      />
    </div>
  );
}
