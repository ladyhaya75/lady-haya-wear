/**
 * Skeleton loader pour ProductCard
 * Imite la structure d'une carte produit pendant le chargement
 */
export default function ProductCardSkeleton() {
  return (
    <div className="w-full h-full animate-pulse">
      {/* Image skeleton */}
      <div className="relative w-full h-80 bg-gradient-to-br from-nude-light to-rose-light-2 rounded-2xl" />
      
      {/* Content skeleton */}
      <div className="flex justify-between mt-4">
        <div className="flex-1 space-y-2">
          {/* Title skeleton */}
          <div className="h-6 bg-nude-light rounded w-3/4" />
          
          {/* Category skeleton */}
          <div className="h-4 bg-nude-light rounded w-1/2" />
        </div>
        
        {/* Price skeleton */}
        <div className="h-6 bg-nude-light rounded w-16" />
      </div>
      
      {/* Heart icon skeleton */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-nude-light/50 rounded-full" />
    </div>
  );
}

