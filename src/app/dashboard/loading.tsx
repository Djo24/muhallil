export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-8">
      <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        ))}
      </div>
      <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
