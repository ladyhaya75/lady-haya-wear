/**
 * Skeleton loader pour les cartes du dashboard
 */
export default function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-nude-light animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-nude-light rounded w-32" />
          <div className="h-8 bg-nude-light rounded w-24" />
        </div>
        <div className="w-12 h-12 bg-nude-light rounded-full" />
      </div>
    </div>
  );
}

