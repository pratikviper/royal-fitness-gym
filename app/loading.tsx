export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-royal border-t-transparent" />
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Loading
        </span>
      </div>
    </div>
  );
}
