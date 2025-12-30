/**
 * Skeleton loader pour les tableaux (dashboard)
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-nude-light overflow-hidden">
      {/* Header */}
      <div className="border-b border-nude-light p-4">
        <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-5 bg-nude-light rounded" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-nude-light">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 animate-pulse">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-nude-light rounded"
                  style={{ 
                    width: colIndex === 0 ? '80%' : '60%',
                    animationDelay: `${rowIndex * 100 + colIndex * 50}ms`
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

