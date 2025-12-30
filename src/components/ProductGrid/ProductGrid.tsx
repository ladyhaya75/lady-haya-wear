"use client";

import { urlFor } from "@/lib/sanity";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Filter from "../Filter/Filter";
import ProductCard from "../ProductCard/ProductCard";

interface ProductGridProps {
	products: any[];
	title?: string;
	showFilters?: boolean;
	categories?: any[];
}

/**
 * ProductGrid optimisé avec useMemo et useCallback
 * pour réduire les re-renders inutiles
 */
export default function ProductGrid({
	products,
	title,
	showFilters = false,
	categories = [],
}: ProductGridProps) {
	const favorites = useFavoritesStore((state) => state.favorites);
	const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
	const user = useAuthStore((state) => state.user);
	const userId = user?.id || null;
	const [filteredProducts, setFilteredProducts] = useState(products);

	// Mettre à jour les produits filtrés quand les produits changent
	useEffect(() => {
		setFilteredProducts(products);
	}, [products]);

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
				image: urlFor(product.mainImage)?.url() || "/assets/placeholder.jpg",
				imageAlt: product.mainImage?.alt || product.name,
				slug: product.slug?.current || product._id,
				category: product.category,
			};

			toggleFavorite(productForFavorites, userId);

			// Notification pour les favoris
			if (isCurrentlyInFavorites) {
				toast.info(`${product.name} retiré des favoris`, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			} else {
				toast.success(`${product.name} ajouté aux favoris !`, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			}
		},
		[favoritesMap, toggleFavorite, userId]
	);

	return (
		<div className="mb-12">
			{title && (
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<h2 className="text-4xl lg:text-5xl font-alex-brush text-logo mb-4">
						{title}
					</h2>
				</motion.div>
			)}

			{/* Filtres avancés */}
			{showFilters && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<Filter
						products={products}
						onFilterChange={setFilteredProducts}
						categories={categories}
					/>
				</motion.div>
			)}

			<AnimatePresence mode="wait">
				{filteredProducts.length > 0 ? (
					<motion.div
						key="products-grid"
						className="flex gap-x-6 gap-y-8 sm:gap-y-16 justify-start flex-wrap"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						{filteredProducts.map((product, index) => (
							<ProductCard
								key={product._id}
								product={product}
								index={index}
								isFavorite={favoritesMap.has(product._id)}
								onToggleFavorite={handleToggleFavorite}
							/>
						))}
					</motion.div>
				) : (
					<motion.div
						key="no-products"
						className="text-center py-16"
						initial={{
							opacity: 0,
							scale: 0.5,
							y: 50,
							rotate: -10,
							filter: "blur(10px)",
						}}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							rotate: 0,
							filter: "blur(0px)",
						}}
						exit={{
							opacity: 0,
							scale: 0.5,
							y: -50,
							rotate: 10,
						}}
						transition={{
							duration: 0.8,
							ease: [0.68, -0.55, 0.265, 1.55],
						}}
					>
						<motion.div
							className="text-6xl mb-4"
							animate={{
								rotate: [0, 10, -10, 0],
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								repeatType: "reverse",
							}}
						>
							🛍️
						</motion.div>
						<h3 className="text-2xl font-alex-brush text-logo mb-2">
							Aucun produit trouvé
						</h3>
						<p className="text-nude-dark mb-6">
							Aucun produit ne correspond à vos critères.
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
