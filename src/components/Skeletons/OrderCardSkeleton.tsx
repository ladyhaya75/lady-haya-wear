/**
 * Skeleton loader pour une carte de commande
 */
export default function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-nude-light animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-nude-light rounded w-48" />
          <div className="h-4 bg-nude-light rounded w-32" />
        </div>
        <div className="h-8 bg-nude-light rounded-full w-24" />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-nude-light my-4" />
      
      {/* Products */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-16 bg-nude-light rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-nude-light rounded w-3/4" />
              <div className="h-3 bg-nude-light rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-nude-light flex justify-between">
        <div className="h-6 bg-nude-light rounded w-24" />
        <div className="h-6 bg-nude-light rounded w-20" />
      </div>
    </div>
  );
}

