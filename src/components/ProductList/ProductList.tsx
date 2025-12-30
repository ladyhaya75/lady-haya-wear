"use client";
import ProductBadges from "@/components/ProductBadges/ProductBadges";
import ProductPrice from "@/components/ProductPrice/ProductPrice";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { urlFor } from "@/lib/sanity";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";
import SafeImage from "../ui/SafeImage";

interface ProductListProps {
	featuredProducts: any[];
}

export default function ProductList({ featuredProducts }: ProductListProps) {
	const favorites = useFavoritesStore((state) => state.favorites);
	const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
	const user = useAuthStore((state) => state.user);

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
						<motion.div
							key={product._id}
							className={`w-full flex flex-col gap-4 sm:w-[45%] lg:w-[26%] 2xl:max-w-[421px] group p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 cursor-pointer ${index % 2 === 0 ? "bg-[#d9c4b5]/80" : "bg-rose-light-2"}`}
							initial={{ opacity: 0, filter: "blur(10px)" }}
							whileInView={{ opacity: 1, filter: "blur(0px)" }}
							viewport={{ once: true, amount: 0.7 }}
							transition={{ duration: 0.7, delay: index * 0.2 }}
						>
							<Link href={`/products/${product.slug?.current || product._id}`}>
								{/* Image du produit */}
								<div className="relative w-full h-[28rem] rounded-2xl overflow-hidden group">
									{/* Image principale */}
									<SafeImage
										src={urlFor(product.mainImage)?.url()}
										alt={product.mainImage?.alt || product.name}
										fill
										sizes="25vw"
										className="absolute object-cover rounded-2xl transition-opacity duration-500 group-hover:opacity-0"
									/>

									{/* Image de hover */}
									{product.hoverImage && (
										<SafeImage
											src={urlFor(product.hoverImage)?.url()}
											alt={product.hoverImage?.alt || product.name}
											fill
											sizes="25vw"
											className="absolute object-cover rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
										/>
									)}

									{/* Badges du produit */}
									<ProductBadges
										badges={product.badges}
										isNew={product.isNew}
									/>
								</div>

								{/* Informations du produit */}
								<div className="flex flex-col gap-2">
									<h3 className="font-medium text-nude-dark-2 text-lg">
										{product.name}
									</h3>
									<p className="text-sm text-gray-500 line-clamp-2">
										{product.shortDescription}
									</p>

									{/* Prix avec promotions */}
									<ProductPrice
										price={product.price}
										originalPrice={product.originalPrice}
										badges={product.badges}
										className="mt-2"
									/>
								</div>

								{/* Boutons d'action */}
								<div className="flex items-center justify-between gap-3 pointer-events-none">
									<button className="rounded-2xl w-max ring-1 ring-red-400 text-red-400 py-2 px-4 text-xs hover:bg-red-400 hover:text-white transition-all duration-300 cursor-pointer pointer-events-auto">
										Voir le produit
									</button>
									<button
										onClick={(e) => handleToggleFavorite(product, e)}
										className="p-2 hover:scale-110 transition-transform duration-200 cursor-pointer pointer-events-auto"
									>
										{favorites.some((fav) => fav.productId === product._id) ? (
											<FaHeart className="text-xl text-red-400" />
										) : (
											<FiHeart className="text-xl text-gray-400 hover:text-red-400 transition-colors duration-200" />
										)}
									</button>
								</div>
							</Link>
						</motion.div>
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
