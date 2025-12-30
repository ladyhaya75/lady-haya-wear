"use client";

import ProductBadges from "@/components/ProductBadges/ProductBadges";
import ProductPrice from "@/components/ProductPrice/ProductPrice";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { urlFor } from "@/lib/sanity";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";
import Filter from "../Filter/Filter";
import SafeImage from "../ui/SafeImage";

interface ProductGridProps {
	products: any[];
	title?: string;
	showFilters?: boolean;
	categories?: any[];
}

export default function ProductGrid({
	products,
	title,
	showFilters = false,
	categories = [],
}: ProductGridProps) {
	const favorites = useFavoritesStore((state) => state.favorites);
	const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
	const user = useAuthStore((state) => state.user);
	const [filteredProducts, setFilteredProducts] = useState(products);

	// Mettre à jour les produits filtrés quand les produits changent
	useEffect(() => {
		setFilteredProducts(products);
	}, [products]);

	const handleToggleFavorite = (product: any, e: React.MouseEvent) => {
		e.preventDefault(); // Empêcher la navigation du Link
		e.stopPropagation();

		// Vérifier si le produit est actuellement dans les favoris
		const isCurrentlyInFavorites = favorites.some(
			(fav) => fav.productId === product._id
		);

		// Créer l'objet Product attendu par le contexte
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

		toggleFavorite(productForFavorites, user?.id || null);

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
	};

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
							<motion.div
								key={product._id}
								initial={{
									opacity: 0,
									y: 80,
									scale: 0.7,
									filter: "blur(15px)",
									rotateX: -15,
									rotateY: 10,
								}}
								whileInView={{
									opacity: 1,
									y: 0,
									scale: 1,
									filter: "blur(0px)",
									rotateX: 0,
									rotateY: 0,
								}}
								viewport={{ once: true, amount: 0.1 }}
								transition={{
									duration: 0.8,
									delay: index * 0.3,
									ease: [0.68, -0.55, 0.265, 1.55],
								}}
								className="w-full sm:w-[45%] lg:w-[27%] xl:w-[25%] 2xl:max-w-[421px]"
							>
								<Link
									href={`/products/${product.slug?.current || product._id}`}
									className={`w-full flex flex-col gap-4 group p-4 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 ${index % 2 === 0 ? "bg-[#d9c4b5]/80" : "bg-rose-light-2"}`}
								>
									{/* Image du produit */}
									<motion.div
										className="relative w-full h-[28rem] rounded-2xl overflow-hidden group"
										initial={{
											opacity: 0,
											scale: 0.8,
											rotateZ: -5,
											filter: "brightness(0.5)",
										}}
										animate={{
											opacity: 1,
											scale: 1,
											rotateZ: 0,
											filter: "brightness(1)",
										}}
										transition={{
											duration: 0.6,
											delay: index * 0.3 + 0.1,
											ease: [0.68, -0.55, 0.265, 1.55],
										}}
									>
										{/* Image principale */}
										<SafeImage
											src={urlFor(product.mainImage)?.url()}
											alt={product.mainImage?.alt || product.name}
											fill
											sizes="25vw"
											className="absolute object-cover rounded-2xl transition-all duration-700 group-hover:opacity-0 group-hover:scale-110"
										/>

										{/* Image de hover */}
										{product.hoverImage && (
											<SafeImage
												src={urlFor(product.hoverImage)?.url()}
												alt={product.hoverImage?.alt || product.name}
												fill
												sizes="25vw"
												className="absolute object-cover rounded-2xl opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110"
											/>
										)}

										{/* Badges du produit */}
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.5,
												rotate: -180,
												y: -20,
											}}
											animate={{
												opacity: 1,
												scale: 1,
												rotate: 0,
												y: 0,
											}}
											transition={{
												duration: 0.5,
												delay: index * 0.3 + 0.4,
												ease: [0.68, -0.55, 0.265, 1.55],
											}}
										>
											<ProductBadges
												badges={product.badges}
												isNew={product.isNew}
											/>
										</motion.div>
									</motion.div>

									{/* Informations du produit */}
									<motion.div
										className="flex flex-col gap-2"
										initial={{
											opacity: 0,
											y: 30,
											scale: 0.9,
											filter: "blur(5px)",
										}}
										animate={{
											opacity: 1,
											y: 0,
											scale: 1,
											filter: "blur(0px)",
										}}
										transition={{
											duration: 0.6,
											delay: index * 0.3 + 0.5,
											ease: [0.68, -0.55, 0.265, 1.55],
										}}
									>
										<h3 className="font-medium text-nude-dark-2 text-lg group-hover:text-nude-dark transition-colors duration-300">
											{product.name}
										</h3>
										<p className="text-sm text-gray-500 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300">
											{product.shortDescription}
										</p>

										{/* Prix avec promotions */}
										<ProductPrice
											price={product.price}
											originalPrice={product.originalPrice}
											badges={product.badges}
											className="mt-2"
										/>
									</motion.div>

									{/* Boutons d'action */}
									<motion.div
										className="flex items-center justify-between gap-3 pointer-events-none"
										initial={{
											opacity: 0,
											y: 40,
											scale: 0.8,
											rotateX: 90,
										}}
										animate={{
											opacity: 1,
											y: 0,
											scale: 1,
											rotateX: 0,
										}}
										transition={{
											duration: 0.7,
											delay: index * 0.3 + 0.6,
											ease: [0.68, -0.55, 0.265, 1.55],
										}}
									>
										<button className="rounded-2xl w-max ring-1 ring-red-400 text-red-400 py-2 px-4 text-xs hover:bg-red-400 hover:text-white transition-all duration-300 cursor-pointer pointer-events-auto">
											Voir le produit
										</button>
										<button
											onClick={(e) => handleToggleFavorite(product, e)}
											className="p-2 hover:scale-110 transition-transform duration-200 cursor-pointer pointer-events-auto"
										>
											{favorites.some(
												(fav) => fav.productId === product._id
											) ? (
												<FaHeart className="text-xl text-red-400" />
											) : (
												<FiHeart className="text-xl text-gray-400 hover:text-red-400 transition-colors duration-200" />
											)}
										</button>
									</motion.div>
								</Link>
							</motion.div>
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
