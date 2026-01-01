"use client";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { urlFor } from "@/lib/sanity";
import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import ProductCard from "../ProductCard/ProductCard";

interface ProductListProps {
	featuredProducts: any[];
}

/**
 * ProductList optimisé avec useMemo et useCallback
 * pour réduire les re-renders inutiles
 */
export default function ProductList({ featuredProducts }: ProductListProps) {
	const favorites = useFavoritesStore((state) => state.favorites);
	const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
	const user = useAuthStore((state) => state.user);
	const userId = user?.id || null;

	// Mémoïser le Map des favoris pour éviter de recalculer à chaque render
	const favoritesMap = useMemo(() => {
		const map = new Set<string>();
		favorites.forEach((fav) => map.add(fav.productId));
		return map;
	}, [favorites]);

	// useCallback pour éviter de recréer cette fonction à chaque render
	const handleToggleFavorite = useCallback(
		(product: any, e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const isCurrentlyInFavorites = favoritesMap.has(product._id);

		// Créer l'objet Product attendu par le store
		const productForFavorites = {
			productId: product._id,
			name: product.name,
			price: product.price || 0,
			originalPrice: product.originalPrice,
			promoPercentage: product.promoPercentage, // Ajout du promo
			image: urlFor(product.mainImage)?.url() || "/assets/placeholder.jpg",
			imageAlt: product.mainImage?.alt || product.name,
			slug: product.slug?.current || product._id,
			category: product.category,
		};

		toggleFavorite(productForFavorites, userId);

		// Le toast est géré par favoritesStore
	},
	[favoritesMap, toggleFavorite, userId]
);

	return (
		<div className="mb-12">
			<div className="text-center mb-12">
				<motion.h2
					className="text-5xl lg:text-6xl font-alex-brush text-logo mb-4 mt-8"
					initial={{ y: 50, opacity: 0 }}
					whileInView={{ y: 0, opacity: 1 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					Nos Coups de Cœur
				</motion.h2>
			</div>
			{featuredProducts.length > 0 ? (
				<div className="flex gap-x-8 gap-y-8 sm:gap-y-16 justify-start flex-wrap">
					{featuredProducts.map((product, index) => (
						<ProductCard
							key={product._id}
							product={product}
							index={index}
							isFavorite={favoritesMap.has(product._id)}
							onToggleFavorite={handleToggleFavorite}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-16">
					<div className="text-6xl mb-4">🛍️</div>
					<h3 className="text-2xl font-alex-brush text-logo mb-2">
						Aucun produit mis en avant
					</h3>
					<p className="text-nude-dark mb-6">
						Les produits mis en avant apparaîtront ici.
					</p>
				</div>
			)}
		</div>
	);
}
