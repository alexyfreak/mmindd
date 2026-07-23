export default function LoadingSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 px-4 sm:px-6 lg:px-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-4 rounded-2xl bg-surface border border-border p-5 animate-pulse"
          style={{ height: `${120 + (i % 3) * 60}px` }}
        >
          <div className="h-3 w-2/3 bg-border rounded mb-3" />
          <div className="h-2 w-full bg-border rounded mb-2" />
          <div className="h-2 w-4/5 bg-border rounded" />
        </div>
      ))}
    </div>
  )
}
