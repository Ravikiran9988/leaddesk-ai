const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export default Skeleton;
