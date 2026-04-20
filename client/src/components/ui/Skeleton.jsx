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
    <article>
      <Skeleton className="aspect-[21/8] w-full rounded-none md:rounded-b-2xl" />
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mb-4 h-12 w-full max-w-3xl" />
        <Skeleton className="mb-8 h-12 w-2/3 max-w-2xl" />
        <div className="my-10 h-px w-full bg-zinc-800/80" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 5 === 4 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </article>
  );
}
