import ProductCardSkeleton from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  title?: string;
}

/**
 * Skeleton loader pour ProductGrid
 * Affiche une grille de cartes skeleton pendant le chargement
 */
export default function ProductGridSkeleton({ 
  count = 8, 
  title 
}: ProductGridSkeletonProps) {
  return (
    <div className="mt-12 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
      {/* Title skeleton */}
      {title && (
        <div className="mb-8">
          <div className="h-10 bg-nude-light rounded w-64 mx-auto animate-pulse" />
        </div>
      )}
      
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="relative">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

