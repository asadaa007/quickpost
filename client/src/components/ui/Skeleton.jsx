export function Skeleton({ className = "" }) {
  return (
    <div
      className={`skeleton-shimmer rounded-2xl ${className}`}
      aria-hidden
    />
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-surface">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <Skeleton className="mb-4 h-4 w-28" />
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="mb-2 h-10 w-3/4" />
      <Skeleton className="mb-8 h-4 w-40" />
      <Skeleton className="mb-12 aspect-[16/7] w-full" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
