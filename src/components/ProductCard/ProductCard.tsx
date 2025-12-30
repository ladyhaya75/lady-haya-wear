import { urlFor } from "@/lib/sanity";
import { motion } from "framer-motion";
import Link from "next/link";
import { memo, useCallback, useMemo } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import ProductBadges from "../ProductBadges/ProductBadges";
import ProductPrice from "../ProductPrice/ProductPrice";
import SafeImage from "../ui/SafeImage";

interface ProductCardProps {
	product: any;
	index: number;
	isFavorite: boolean;
	onToggleFavorite: (product: any, e: React.MouseEvent) => void;
}

/**
 * Composant ProductCard optimisé avec React.memo
 * Ne re-render que si product, isFavorite ou index change
 */
const ProductCard = memo(function ProductCard({
	product,
	index,
	isFavorite,
	onToggleFavorite,
}: ProductCardProps) {
	// Mémoïser l'URL de l'image principale
	const mainImageUrl = useMemo(
		() => urlFor(product.mainImage)?.url() || "/assets/placeholder.jpg",
		[product.mainImage]
	);

	// Mémoïser l'URL de l'image hover
	const hoverImageUrl = useMemo(
		() => (product.hoverImage ? urlFor(product.hoverImage)?.url() : null),
		[product.hoverImage]
	);

	// Mémoïser le slug du produit
	const productSlug = useMemo(
		() => product.slug?.current || product._id,
		[product.slug, product._id]
	);

	// Handler pour le toggle favori
	const handleFavoriteClick = useCallback(
		(e: React.MouseEvent) => {
			onToggleFavorite(product, e);
		},
		[product, onToggleFavorite]
	);

	return (
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
				href={`/products/${productSlug}`}
				className={`w-full flex flex-col gap-4 group p-4 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 ${
					index % 2 === 0 ? "bg-[#d9c4b5]/80" : "bg-rose-light-2"
				}`}
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
						src={mainImageUrl}
						alt={product.mainImage?.alt || product.name}
						fill
						sizes="25vw"
						className="absolute object-cover rounded-2xl transition-all duration-700 group-hover:opacity-0 group-hover:scale-110"
					/>

					{/* Image de hover */}
					{hoverImageUrl && (
						<SafeImage
							src={hoverImageUrl}
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
						<ProductBadges badges={product.badges} isNew={product.isNew} />
					</motion.div>
				</motion.div>

				{/* Informations du produit */}
				<motion.div
					className="flex flex-col gap-2"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.5,
						delay: index * 0.3 + 0.5,
						ease: [0.25, 0.46, 0.45, 0.94],
					}}
				>
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
				</motion.div>

				{/* Bouton favori */}
				<div className="flex items-center justify-between gap-3 pointer-events-auto">
					<button
						onClick={handleFavoriteClick}
						className="p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md pointer-events-auto"
						aria-label={
							isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
						}
					>
						{isFavorite ? (
							<FaHeart className="w-5 h-5 text-red-400" />
						) : (
							<FiHeart className="w-5 h-5 text-nude-dark" />
						)}
					</button>
				</div>
			</Link>
		</motion.div>
	);
});

export default ProductCard;
