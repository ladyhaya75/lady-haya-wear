"use client";

import ProductPrice from "@/components/ProductPrice/ProductPrice";
import SafeImage from "@/components/ui/SafeImage";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { urlFor } from "@/lib/sanity";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	TbChevronUp,
	TbCreditCard,
	TbHeadset,
	TbPackage,
	TbPackageExport,
	TbTruckDelivery,
} from "react-icons/tb";
import { toast } from "react-toastify";

interface ProductPageClientProps {
	product: any;
	allImages: any[];
	prevProduct: any;
	nextProduct: any;
	similarProducts: any[];
}

export function ProductPageClient({
	product,
	allImages,
	prevProduct,
	nextProduct,
	similarProducts,
}: ProductPageClientProps) {
	const [selectedColorIndex, setSelectedColorIndex] = useState(0);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [showSizeGuide, setShowSizeGuide] = useState(false);
	const [showViewCart, setShowViewCart] = useState(false);
	const [similarProductsScrollRef, setSimilarProductsScrollRef] =
		useState<HTMLDivElement | null>(null);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [modalImageIndex, setModalImageIndex] = useState(0);
	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);
	const router = useRouter();

	const addToCart = useCartStore((state) => state.addToCart);
	const cartItems = useCartStore((state) => state.cartItems);
	const favorites = useFavoritesStore((state) => state.favorites);
	const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
	const user = useAuthStore((state) => state.user);

	// Vérifier si le produit est dans les favoris
	const isInFavorites = favorites.some(
		(fav: any) => fav.productId === product._id
	);

	// Bloquer le scroll quand la modale est ouverte et gérer les touches clavier
	useEffect(() => {
		if (isImageModalOpen) {
			// Bloquer le scroll
			document.body.style.overflow = "hidden";

			// Gérer les touches clavier
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					closeImageModal();
				} else if (e.key === "ArrowLeft") {
					navigateModalImage("prev");
				} else if (e.key === "ArrowRight") {
					navigateModalImage("next");
				}
			};

			window.addEventListener("keydown", handleKeyDown);

			return () => {
				document.body.style.overflow = "unset";
				window.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [isImageModalOpen]);

	// Couleur actuellement sélectionnée
	const selectedColor = product.colors[selectedColorIndex];

	// Trouver la quantité de la taille sélectionnée
	const selectedSizeQuantity =
		(selectedSize &&
			selectedColor?.sizes?.find((size: any) => size.size === selectedSize)
				?.quantity) ||
		0;

	// Toutes les images de la couleur sélectionnée (limitées à 15 images max)
	const colorImages = selectedColor
		? [
				selectedColor.mainImage,
				...(selectedColor.additionalImages || []),
			].slice(0, 15)
		: [];

	// Image actuellement affichée
	const currentImage =
		colorImages[selectedImageIndex] || selectedColor?.mainImage;

	// Tailles disponibles pour la couleur sélectionnée
	const availableSizes =
		selectedColor?.sizes?.filter(
			(size: any) => size.available && size.quantity > 0
		) || [];

	// Vérifier si une couleur a des tailles disponibles
	// useCallback pour éviter de recréer cette fonction à chaque render
	const isColorAvailable = useCallback((color: any) => {
		return color.sizes?.some(
			(size: any) => size.available && size.quantity > 0
		);
	}, []);

	const handleAddToCart = useCallback(() => {
		if (!selectedSize || !selectedColor) {
			toast.error(
				"Veuillez sélectionner une taille avant d'ajouter au panier",
				{
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				}
			);
			return;
		}

		setIsAddingToCart(true);

		// Calculer le prix final (avec réduction si applicable)
		const finalPrice = product.discountPercentage 
			? product.price * (1 - product.discountPercentage / 100)
			: product.price;

		// Simuler un délai pour l'ajout au panier
		setTimeout(() => {
			addToCart({
				productId: product.product?._id || product._id, // Toujours l'ID du produit principal
				name: product.name,
				price: finalPrice, // Prix avec réduction
				originalPrice: product.originalPrice || product.price, // Prix d'origine
				image:
					urlFor(selectedColor.mainImage)?.url() || "/assets/placeholder.jpg",
				imageAlt: selectedColor.mainImage?.alt || product.name,
				color: selectedColor.name,
				colorHex: selectedColor.hexCode,
				size: selectedSize,
				quantity: quantity,
				maxQuantity: selectedSizeQuantity, // Stock maximum disponible
				slug: product.slug?.current || product._id,
			});

			setIsAddingToCart(false);
			setShowViewCart(true);
			// Réinitialiser la quantité à 1 après l'ajout
			setQuantity(1);
			// Notification de succès avec détails du produit
			toast.success(
				<div>
					<div className="font-semibold">Produit ajouté au panier !</div>
					<div className="text-sm opacity-90">
						{product.name} - {selectedColor.name} - Taille {selectedSize}
					</div>
					<div className="text-sm opacity-90">
						Quantité : {quantity} - {finalPrice.toFixed(2)} €
					</div>
				</div>,
				{
					position: "top-right",
					autoClose: 4000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				}
			);
		}, 500);
	}, [
		selectedSize,
		selectedColor,
		product,
		quantity,
		selectedSizeQuantity,
		addToCart,
	]);

	const handleQuantityChange = useCallback(
		(newQuantity: number) => {
			if (newQuantity >= 1 && newQuantity <= selectedSizeQuantity) {
				setQuantity(newQuantity);
			}
		},
		[selectedSizeQuantity]
	);

	const handleToggleFavorite = useCallback(() => {
		const isCurrentlyInFavorites = favorites.some(
			(fav: any) => fav.productId === product._id
		);

		toggleFavorite({
			productId: product._id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			image:
				urlFor(selectedColor?.mainImage)?.url() || "/assets/placeholder.jpg",
			imageAlt: selectedColor?.mainImage?.alt || product.name,
			slug: product.slug?.current || product._id,
			category: product.category,
		}, user?.id || null);

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
	}, [favorites, product, selectedColor, toggleFavorite, user?.id]);

	// Fonctions pour le scroll horizontal des produits similaires
	const scrollSimilarProducts = useCallback(
		(direction: "left" | "right") => {
		if (similarProductsScrollRef) {
			const scrollAmount = 280; // Largeur d'un produit + gap
			const currentScroll = similarProductsScrollRef.scrollLeft;
			const newScroll =
				direction === "left"
					? currentScroll - scrollAmount
					: currentScroll + scrollAmount;

			similarProductsScrollRef.scrollTo({
				left: newScroll,
				behavior: "smooth",
			});
		}
	}, [similarProductsScrollRef]);

	// Fonctions pour la modale d'images
	const openImageModal = useCallback((index: number) => {
		setModalImageIndex(index);
		setIsImageModalOpen(true);
	}, []);

	const closeImageModal = useCallback(() => {
		setIsImageModalOpen(false);
	}, []);

	const navigateModalImage = useCallback(
		(direction: "prev" | "next") => {
		if (direction === "prev") {
			setModalImageIndex((prev) =>
				prev === 0 ? colorImages.length - 1 : prev - 1
			);
		} else {
			setModalImageIndex((prev) =>
				prev === colorImages.length - 1 ? 0 : prev + 1
			);
		}
	}, [colorImages.length]);

	// Gestion du swipe tactile
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		setTouchStart(e.targetTouches[0].clientX);
	}, []);

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX);
	}, []);

	const handleTouchEnd = useCallback(() => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const minSwipeDistance = 50; // Distance minimale pour déclencher le swipe

		if (Math.abs(distance) > minSwipeDistance) {
			if (distance > 0) {
				// Swipe vers la gauche -> image suivante
				navigateModalImage("next");
			} else {
				// Swipe vers la droite -> image précédente
				navigateModalImage("prev");
			}
		}

		// Reset
		setTouchStart(0);
		setTouchEnd(0);
	}, [touchStart, touchEnd, navigateModalImage]);

	// Calculer les miniatures visibles dans la modale (fenêtre glissante)
	const visibleThumbnails = useMemo(() => {
		const totalImages = colorImages.length;
		const maxVisibleThumbnails = 5; // Nombre max de miniatures visibles à la fois (réduit à 5 pour meilleur affichage)

		// Si on a moins d'images que le max, on affiche tout
		if (totalImages <= maxVisibleThumbnails) {
			return colorImages.map((img, idx) => ({ image: img, index: idx }));
		}

		// Sinon, on crée une fenêtre glissante centrée sur l'image actuelle
		const halfWindow = Math.floor(maxVisibleThumbnails / 2);
		let startIndex = Math.max(0, modalImageIndex - halfWindow);
		let endIndex = Math.min(totalImages, startIndex + maxVisibleThumbnails);

		// Si on est proche de la fin, ajuster le début
		if (endIndex === totalImages) {
			startIndex = Math.max(0, totalImages - maxVisibleThumbnails);
		}

		const visibleImages = [];
		for (let i = startIndex; i < endIndex; i++) {
			visibleImages.push({
				image: colorImages[i],
				index: i,
			});
		}

		return visibleImages;
	}, [colorImages, modalImageIndex]);

	return (
		<div className="min-h-screen bg-beige-light">
			{/* Navigation breadcrumb */}
			<motion.nav
				className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-4 bg-white/50"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<div className="flex items-center gap-2 text-sm text-nude-dark">
					<Link href="/" className="hover:text-red-400 transition-colors">
						Accueil
					</Link>
					<span>/</span>
					<Link
						href="/collections"
						className="hover:text-red-400 transition-colors"
					>
						Collections
					</Link>
					<span>/</span>
					<span className="text-red-400">{product.name}</span>
				</div>
			</motion.nav>

			{/* Section principale du produit */}
			<section className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-16">
				{/* Titre et badges - version mobile (au-dessus de l'image) */}
				<motion.div
					className="block md:hidden mb-8"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
				>
					{/* Badges */}
					<motion.div
						className="flex gap-2 mb-4 justify-center"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
					>
						{product.badges?.isNew && (
							<span className="bg-red-400 text-white px-3 py-1 rounded-full text-xs font-medium">
								Nouveau
							</span>
						)}
						{product.badges?.isPromo && (
							<span className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">
								Promo {product.badges?.promoPercentage}%
							</span>
						)}
					</motion.div>

					<motion.h1
						className="text-4xl md:text-5xl font-alex-brush text-logo mb-2 text-center"
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
					>
						{product.name}
					</motion.h1>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
					{/* Galerie d'images */}
					<motion.div
						className="space-y-4 w-full max-w-[420px] md:w-[350px] lg:w-[450px] mx-auto lg:mx-0"
						initial={{
							opacity: 0,
							x: -50,
							scale: 0.9,
							filter: "blur(10px)",
						}}
						animate={{
							opacity: 1,
							x: 0,
							scale: 1,
							filter: "blur(0px)",
						}}
						transition={{
							duration: 0.8,
							delay: 0.8,
							ease: [0.68, -0.55, 0.265, 1.55],
						}}
					>
						{/* Image principale */}
						<motion.div
							className="h-[450px] md:h-[500px] lg:h-[550px] relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
							initial={{
								opacity: 0,
								scale: 0.8,
								rotateY: -15,
							}}
							animate={{
								opacity: 1,
								scale: 1,
								rotateY: 0,
							}}
							transition={{
								duration: 0.8,
								delay: 1.0,
								ease: [0.68, -0.55, 0.265, 1.55],
							}}
							onClick={() => openImageModal(selectedImageIndex)}
						>
							{currentImage ? (
								<>
									<SafeImage
										src={urlFor(currentImage)?.url()}
										alt={currentImage?.alt || product.name}
										fill
										className="object-cover object-center rounded-2xl transition-all duration-300 group-hover:scale-105"
									/>
									{/* Indicateur de zoom au survol */}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
										<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
											<svg
												className="w-6 h-6 text-nude-dark"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
												/>
											</svg>
										</div>
									</div>
								</>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-nude-light to-rose-light-2 flex items-center justify-center">
									<span className="text-6xl">🛍️</span>
								</div>
							)}
						</motion.div>

						{/* Miniatures des images de la couleur sélectionnée - Grille 3 colonnes */}
						{colorImages && colorImages.length > 1 && (
							<div className="mt-8">
								{/* Grille de miniatures - 3 colonnes, lignes dynamiques (max 15 images) */}
								<div className="grid grid-cols-3 gap-2 sm:gap-3 justify-items-center lg:justify-items-start">
									{/* Afficher les 5 premières miniatures */}
									{colorImages.slice(0, 5).map((image: any, i: number) => (
										<motion.div
											key={i}
											className={`w-24 h-32 sm:w-28 sm:h-38 lg:w-32 lg:h-44 relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${
												selectedImageIndex === i
													? "ring-4 ring-rose-medium shadow-lg scale-105"
													: "hover:shadow-md hover:scale-102"
											}`}
											onClick={() => setSelectedImageIndex(i)}
											initial={{
												opacity: 0,
												scale: 0.8,
												rotate: -8,
											}}
											animate={{
												opacity: 1,
												scale: 1,
												rotate: 0,
											}}
											transition={{
												duration: 0.3,
												delay: 1.4 + i * 0.05,
												ease: [0.25, 0.46, 0.45, 0.94],
											}}
										>
											<SafeImage
												src={urlFor(image)?.url()}
												alt={
													image?.alt ||
													`${selectedColor?.name} - Image ${i + 1}`
												}
												fill
												sizes="30vw"
												className="object-cover object-center rounded-2xl transition-transform duration-300 hover:scale-105"
											/>
										</motion.div>
									))}

									{/* Si 6 images ou plus, afficher la miniature "Voir toutes les photos" */}
									{colorImages.length >= 6 && (
										<motion.div
											className="w-24 h-32 sm:w-28 sm:h-38 lg:w-32 lg:h-44 relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group hover:shadow-lg"
											onClick={() => openImageModal(0)}
											initial={{
												opacity: 0,
												scale: 0.8,
												rotate: -8,
											}}
											animate={{
												opacity: 1,
												scale: 1,
												rotate: 0,
											}}
											transition={{
												duration: 0.3,
												delay: 1.4 + 5 * 0.05,
												ease: [0.25, 0.46, 0.45, 0.94],
											}}
										>
											{/* Image de fond en blur */}
											<SafeImage
												src={urlFor(colorImages[5])?.url()}
												alt="Voir toutes les photos"
												fill
												sizes="30vw"
												className="object-cover object-center rounded-2xl blur-sm"
											/>
											{/* Overlay avec texte */}
											<div className="absolute inset-0 bg-nude-dark/70 rounded-2xl flex flex-col items-center justify-center p-1 sm:p-2 group-hover:bg-nude-dark/80 transition-all duration-300">
												<svg
													className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-0.5 sm:mb-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
												<span className="text-white text-[10px] sm:text-xs font-medium text-center leading-tight">
													Voir toutes
													<br />
													les photos
												</span>
												<span className="text-white/80 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
													({colorImages.length})
												</span>
											</div>
										</motion.div>
									)}
								</div>
							</div>
						)}
					</motion.div>

					{/* Informations du produit */}
					<motion.div
						className="space-y-6"
						initial={{
							opacity: 0,
							x: 50,
							scale: 0.9,
							filter: "blur(10px)",
						}}
						animate={{
							opacity: 1,
							x: 0,
							scale: 1,
							filter: "blur(0px)",
						}}
						whileInView={{
							opacity: 1,
							x: 0,
							scale: 1,
							filter: "blur(0px)",
						}}
						viewport={{ once: true, amount: 0.1 }}
						transition={{
							duration: 0.8,
							delay: 1.0,
							ease: [0.68, -0.55, 0.265, 1.55],
						}}
					>
						{/* En-tête - version desktop */}
						<motion.div
							className="hidden md:block"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
						>
							{/* Badges */}
							<motion.div
								className="flex gap-2 mb-4"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
							>
								{product.badges?.isNew && (
									<span className="bg-red-400 text-white px-3 py-1 rounded-full text-xs font-medium">
										Nouveau
									</span>
								)}
								{product.badges?.isPromo && (
									<span className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium">
										Promo {product.badges?.promoPercentage}%
									</span>
								)}
							</motion.div>

							<motion.h1
								className="text-4xl lg:text-5xl font-alex-brush text-logo mb-2"
								initial={{ y: 50, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
							>
								{product.name}
							</motion.h1>
						</motion.div>

						{/* Prix */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
						>
							<ProductPrice
								price={product.price}
								originalPrice={product.originalPrice}
								badges={product.badges}
								size="large"
								className="text-2xl md:text-3xl"
							/>
						</motion.div>

						{/* Description */}
						<motion.div
							className="prose prose-lg max-w-none"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 2.0, ease: "easeOut" }}
						>
							<p className="text-nude-dark leading-relaxed">
								{product.description}
							</p>
						</motion.div>

						{/* Sélecteurs */}
						<motion.div
							className="space-y-6"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.1 }}
							transition={{ duration: 0.6, delay: 2.2, ease: "easeOut" }}
						>
							{/* Couleurs */}
							{product.colors && product.colors.length > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 2.4, ease: "easeOut" }}
								>
									<h3 className="text-xl font-medium text-nude-dark mb-3">
										Couleur
									</h3>
									<div className="flex gap-3">
										{product.colors.map((color: any, index: number) => {
											const isAvailable = isColorAvailable(color);
											return (
												<motion.button
													key={index}
													className={`relative group ${!isAvailable ? "opacity-50" : ""}`}
													title={`${color.name}${!isAvailable ? " - Non disponible" : ""}`}
													disabled={!isAvailable}
													onClick={() => {
														if (isAvailable) {
															setSelectedColorIndex(index);
															setSelectedImageIndex(0);
															setSelectedSize(null);
														}
													}}
													initial={{
														opacity: 0,
														scale: 0.5,
													}}
													animate={{
														opacity: 1,
														scale: 1,
													}}
													transition={{
														duration: 0.4,
														delay: 2.4 + index * 0.1,
														ease: "easeOut",
													}}
												>
													<div
														className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-colors ${
															selectedColorIndex === index
																? "border-nude-dark ring-2 ring-nude-dark"
																: "border-gray-300 hover:border-red-400"
														}`}
														style={{ backgroundColor: color.hexCode }}
													/>
													{!isAvailable && (
														<div className="absolute inset-0 flex items-center justify-center">
															<div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
														</div>
													)}
													<span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-nude-dark opacity-0 group-hover:opacity-100 transition-opacity">
														{color.name}
													</span>
												</motion.button>
											);
										})}
									</div>
								</motion.div>
							)}

							{/* Tailles pour la couleur sélectionnée */}
							{selectedColor &&
								selectedColor.sizes &&
								selectedColor.sizes.length > 0 && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 2.6, ease: "easeOut" }}
									>
										<h3 className="text-xl font-medium text-nude-dark mb-3">
											Taille
										</h3>
										<div className="flex gap-2">
											{selectedColor.sizes.map((size: any, index: number) => {
												const isAvailable = size.available && size.quantity > 0;
												return (
													<button
														key={index}
														className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 relative ${
															isAvailable
																? selectedSize === size.size
																	? "border-rose-dark bg-rose-dark text-white shadow-lg"
																	: "border-nude-dark text-nude-dark hover:border-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 cursor-pointer"
																: "border-red-400 text-red-400 opacity-60 cursor-not-allowed"
														}`}
														disabled={!isAvailable}
														onClick={() =>
															isAvailable && setSelectedSize(size.size)
														}
													>
														{size.size}
														{!isAvailable && (
															<div className="absolute inset-0 flex items-center justify-center">
																<div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
															</div>
														)}
													</button>
												);
											})}
										</div>

										{/* Message d'alerte pour stock faible */}
										{selectedSize &&
											selectedSizeQuantity <= 3 &&
											selectedSizeQuantity > 0 && (
												<p className="text-xs text-black mt-4">
													⚠️ Il ne reste plus que{" "}
													<span className="font-bold text-red-500">
														{selectedSizeQuantity}
													</span>{" "}
													exemplaire{selectedSizeQuantity > 1 ? "s" : ""}
												</p>
											)}

										{/* Message si aucune taille n'est disponible */}
										{availableSizes.length === 0 && (
											<p className="text-sm text-red-500 mt-4">
												❌ Aucune taille disponible pour cette couleur
											</p>
										)}
									</motion.div>
								)}

							{/* Guide des tailles */}
							<motion.div
								className="border-t border-gray-200"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 2.8, ease: "easeOut" }}
							>
								<button
									onClick={() => setShowSizeGuide(!showSizeGuide)}
									className="flex items-center gap-2 text-nude-dark hover:text-rose-dark-2 transition-colors cursor-pointer"
								>
									<h2 className="text-lg font-medium">Guide des tailles</h2>
									<TbChevronUp
										className={`w-5 h-5 transition-transform duration-300 ${!showSizeGuide ? "rotate-180" : "rotate-0"}`}
									/>
								</button>

								{/* Contenu du guide des tailles */}
								{showSizeGuide && (
									<div className="mt-4 p-4 bg-rose-light-2 rounded-2xl border border-nude-light max-w-md">
										{/* Tableau des tailles */}
										<div>
											<h3 className="font-semibold text-nude-dark mb-3">
												Tailles disponibles
											</h3>
											<div className="space-y-2">
												{[
													{ size: "XS", height: "1M55-1M60" },
													{ size: "S", height: "1M60-1M65" },
													{ size: "M", height: "1M65-1M70" },
													{ size: "L", height: "1M70-1M75" },
													{ size: "XL", height: "1M75-1M80" },
													{ size: "XXL", height: "1M80-1M85" },
												].map((sizeInfo) => (
													<div
														key={sizeInfo.size}
														className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-nude-light"
													>
														<span className="font-semibold text-nude-dark">
															{sizeInfo.size}
														</span>
														<span className="text-sm text-gray-600">
															{sizeInfo.height}
														</span>
													</div>
												))}
											</div>

											<div className="mt-4 text-center">
												<Link
													href="/guide-tailles"
													className="inline-flex items-center gap-2 text-rose-dark-2 hover:text-rose-dark transition-colors text-sm font-medium underline"
												>
													Plus de détails sur les tailles
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
												</Link>
											</div>
										</div>
									</div>
								)}
							</motion.div>

							{/* Quantité */}
							<motion.div
								className="mb-10"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 3.0, ease: "easeOut" }}
							>
								<h3 className="text-xl font-medium text-nude-dark mb-3">
									Quantité
								</h3>
								<div className="flex items-center gap-4">
									<button
										onClick={() => handleQuantityChange(quantity - 1)}
										disabled={quantity <= 1}
										className="w-8 h-8 rounded-full ring-2 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
									>
										−
									</button>
									<div className="w-12 h-8 bg-white ring-2 ring-nude-dark rounded-lg flex items-center justify-center shadow-md">
										<span className="text-base font-semibold text-nude-dark">
											{quantity}
										</span>
									</div>
									<button
										onClick={() => handleQuantityChange(quantity + 1)}
										disabled={quantity >= selectedSizeQuantity}
										className="w-8 h-8 rounded-full ring-2 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
									>
										+
									</button>
								</div>
							</motion.div>

							{/* Boutons d'action */}
							<motion.div
								className="flex flex-col gap-4"
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.1 }}
								transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
							>
								{/* Boutons principaux - Ajouter au panier et Favori côte à côte */}
								<div className="flex gap-3 items-center justify-start sm:justify-center">
									<button
										onClick={handleAddToCart}
										disabled={!selectedSize || isAddingToCart}
										className="w-38 md:w-48 ring-2 ring-nude-dark text-nude-dark py-3 md:py-4 px-2 md:px-4 rounded-2xl font-medium hover:bg-rose-dark hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl text-sm md:text-base"
									>
										{isAddingToCart
											? "Ajout en cours..."
											: selectedSize
												? "Ajouter au panier"
												: "Choisir taille"}
									</button>
									<button
										onClick={handleToggleFavorite}
										className="w-18 md:w-28 py-3 md:py-4 px-2 md:px-4 ring-2 ring-nude-dark text-nude-dark rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center"
									>
										<svg
											className={`w-5 h-5 transition-all duration-300 ${
												isInFavorites ? "scale-110" : "scale-100"
											}`}
											fill={isInFavorites ? "currentColor" : "none"}
											stroke={isInFavorites ? "currentColor" : "currentColor"}
											style={{
												color: isInFavorites ? "#ef4444" : "currentColor",
											}}
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</button>
								</div>
								{/* Voir le panier - en dessous */}
								{(showViewCart || (cartItems && cartItems.length > 0)) && (
									<button
										className="w-38 md:w-48 ring-2 ring-nude-dark text-nude-dark py-3 md:py-4 px-2 md:px-4 rounded-2xl font-medium hover:bg-rose-dark hover:text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl text-sm md:text-base sm:mx-auto"
										onClick={() => router.push("/cart")}
										type="button"
									>
										Voir le panier
									</button>
								)}
							</motion.div>
						</motion.div>

						{/* Informations supplémentaires */}
						<motion.div
							className="border-t border-gray-200 pt-6 space-y-4"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.1 }}
							transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{/* Livraison gratuite */}
								<motion.div
									className="flex items-center gap-3 p-3 bg-nude-light rounded-lg shadow-sm border border-gray-100"
									initial={{ opacity: 0, y: 20, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.4, delay: 3.8, ease: "easeOut" }}
								>
									<TbTruckDelivery className="w-6 h-6 text-green-500 flex-shrink-0" />
									<div>
										<div className="font-semibold text-sm text-nude-dark">
											Livraison gratuite
										</div>
										<div className="text-xs text-gray-600">Dès 69€ d'achat</div>
									</div>
								</motion.div>

								{/* Paiement sécurisé */}
								<motion.div
									initial={{ opacity: 0, y: 20, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.4, delay: 4.0, ease: "easeOut" }}
								>
									<Link
										href="/services/paiement-securise"
										className="flex items-center gap-3 p-3 bg-nude-light rounded-lg shadow-sm border border-gray-100 hover:bg-nude-dark/10 transition-colors cursor-pointer"
									>
										<TbCreditCard className="w-6 h-6 text-blue-500 flex-shrink-0" />
										<div>
											<div className="font-semibold text-sm text-nude-dark">
												Paiement sécurisé
											</div>
											<div className="text-xs text-gray-600">CB, PayPal</div>
										</div>
									</Link>
								</motion.div>

								{/* Satisfait ou remboursé */}
								<motion.div
									initial={{ opacity: 0, y: 20, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.4, delay: 4.2, ease: "easeOut" }}
								>
									<Link
										href="/services/retours"
										className="flex items-center gap-3 p-3 bg-nude-light rounded-lg shadow-sm border border-gray-100 hover:bg-nude-dark/10 transition-colors cursor-pointer"
									>
										<TbPackage className="w-6 h-6 text-orange-500 flex-shrink-0" />
										<div>
											<div className="font-semibold text-sm text-nude-dark">
												Retours possibles dans les 15 jours
											</div>
										</div>
									</Link>
								</motion.div>

								{/* Service client */}
								<motion.div
									initial={{ opacity: 0, y: 20, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.4, delay: 4.4, ease: "easeOut" }}
								>
									<Link
										href="/services/service-client"
										className="flex items-center gap-3 p-3 bg-nude-light rounded-lg shadow-sm border border-gray-100 hover:bg-nude-dark/10 transition-colors cursor-pointer"
									>
										<TbHeadset className="w-6 h-6 text-purple-500 flex-shrink-0" />
										<div>
											<div className="font-semibold text-sm text-nude-dark">
												Service client
											</div>
											<div className="text-xs text-gray-600">Support 7j/7</div>
										</div>
									</Link>
								</motion.div>

								{/* Envoi rapide */}
								<motion.div
									initial={{ opacity: 0, y: 20, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.4, delay: 4.6, ease: "easeOut" }}
								>
									<Link
										href="/services/envoi-rapide"
										className="flex items-center gap-3 p-3 bg-nude-light rounded-lg shadow-sm border border-gray-100 hover:bg-nude-dark/10 transition-colors cursor-pointer"
									>
										<TbPackageExport className="w-6 h-6 text-red-500 flex-shrink-0" />
										<div>
											<div className="font-semibold text-sm text-nude-dark">
												Envoi rapide
											</div>
											<div className="text-xs text-gray-600">
												Livraison en 24-48h
											</div>
										</div>
									</Link>
								</motion.div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Navigation entre produits */}
			{(prevProduct || nextProduct) && (
				<motion.section
					className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-8 bg-white/50"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<div className="flex justify-between items-center">
						{prevProduct && (
							<Link
								href={`/products/${prevProduct.slug?.current || prevProduct._id}`}
								className="flex flex-col items-center gap-2 group hover:bg-rose-light-2 p-3 rounded-xl transition-all duration-300"
							>
								<div className="w-16 h-16 relative rounded-2xl overflow-hidden">
									<SafeImage
										src={urlFor(prevProduct.colors?.[0]?.mainImage)?.url()}
										alt={prevProduct.name}
										fill
										sizes="64px"
										className="object-cover object-center rounded-2xl"
									/>
								</div>
								<div className="text-center">
									<p className="text-sm md:text-base text-gray-500 flex items-center gap-1 justify-center">
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 19l-7-7 7-7"
											/>
										</svg>
										Précédent
									</p>
									<p className="text-xs md:text-sm text-rose-dark-2 hover:text-nude-dark-2 transition-colors line-clamp-2">
										{prevProduct.name}
									</p>
								</div>
							</Link>
						)}

						{nextProduct && (
							<Link
								href={`/products/${nextProduct.slug?.current || nextProduct._id}`}
								className="flex flex-col items-center gap-2 group hover:bg-rose-light-2 p-3 rounded-xl transition-all duration-300"
							>
								<div className="w-16 h-16 relative rounded-2xl overflow-hidden">
									<SafeImage
										src={urlFor(nextProduct.colors?.[0]?.mainImage)?.url()}
										alt={nextProduct.name}
										fill
										sizes="64px"
										className="object-cover object-center rounded-2xl"
									/>
								</div>
								<div className="text-center">
									<p className="text-sm md:text-base text-gray-500 flex items-center gap-1 justify-center">
										Suivant
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</p>
									<p className="text-xs md:text-sm text-rose-dark-2 hover:text-nude-dark-2 transition-colors line-clamp-2">
										{nextProduct.name}
									</p>
								</div>
							</Link>
						)}
					</div>
				</motion.section>
			)}

			{/* Produits similaires */}
			{similarProducts.length > 0 && (
				<motion.section
					className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-16 bg-rose-light-2"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<motion.div
						className="text-center mb-12"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
					>
						<h2 className="text-4xl lg:text-5xl font-alex-brush text-logo mb-4">
							Produits similaires
						</h2>
						<p className="text-lg text-nude-dark">
							Découvrez d'autres produits de cette collection
						</p>
					</motion.div>

					{/* Slider mobile - visible uniquement sur mobile */}
					<motion.div
						className="md:hidden relative"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
					>
						{/* Container du slider */}
						<div
							ref={setSimilarProductsScrollRef}
							className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory justify-center"
						>
							{similarProducts.slice(0, 7).map((similarProduct, index) => (
								<motion.div
									key={similarProduct._id}
									initial={{
										opacity: 0,
										y: 50,
										scale: 0.8,
										filter: "blur(10px)",
									}}
									whileInView={{
										opacity: 1,
										y: 0,
										scale: 1,
										filter: "blur(0px)",
									}}
									viewport={{ once: true, amount: 0.1 }}
									transition={{
										duration: 0.6,
										delay: 0.6 + index * 0.1,
										ease: [0.68, -0.55, 0.265, 1.55],
									}}
									className="flex-shrink-0 w-64 snap-start"
								>
									<Link
										href={`/products/${similarProduct.slug?.current || similarProduct._id}`}
										className="group block"
									>
										<div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
											<SafeImage
												src={urlFor(
													similarProduct.colors?.[0]?.mainImage
												)?.url()}
												alt={similarProduct.name}
												fill
												sizes="256px"
												className="object-cover object-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
											/>
											{/* Overlay avec dégradé pour le nom et prix */}
											<div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white/90 via-white/60 to-transparent p-4 pb-2 flex flex-col justify-end">
												<h3 className="font-medium text-nude-dark text-sm mb-1 line-clamp-1 drop-shadow-sm">
													{similarProduct.name}
												</h3>
												<p className="text-lg font-semibold text-logo drop-shadow-sm">
													{similarProduct.price.toFixed(2)} €
												</p>
											</div>
										</div>
									</Link>
								</motion.div>
							))}
						</div>

						{/* Boutons de navigation - sous l'image */}
						<div className="flex justify-center items-center gap-2 mt-4">
							<button
								onClick={() => scrollSimilarProducts("left")}
								className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-rose-light-2 hover:scale-110 transition-all duration-300 cursor-pointer"
								aria-label="Produits précédents"
							>
								<svg
									className="w-4 h-4 text-nude-dark"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button
								onClick={() => scrollSimilarProducts("right")}
								className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-rose-light-2 hover:scale-110 transition-all duration-300 cursor-pointer"
								aria-label="Produits suivants"
							>
								<svg
									className="w-4 h-4 text-nude-dark"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					</motion.div>

					{/* Grid desktop - visible uniquement sur desktop */}
					<motion.div
						className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[450px] lg:max-w-[1000px] mx-auto lg:mx-0"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
					>
						{similarProducts.slice(0, 7).map((similarProduct, index) => (
							<motion.div
								key={similarProduct._id}
								initial={{
									opacity: 0,
									y: 50,
									scale: 0.8,
									filter: "blur(10px)",
								}}
								whileInView={{
									opacity: 1,
									y: 0,
									scale: 1,
									filter: "blur(0px)",
								}}
								viewport={{ once: true, amount: 0.1 }}
								transition={{
									duration: 0.6,
									delay: 0.6 + index * 0.1,
									ease: [0.68, -0.55, 0.265, 1.55],
								}}
							>
								<Link
									href={`/products/${similarProduct.slug?.current || similarProduct._id}`}
									className="group block"
								>
									<div className="relative h-80 rounded-2xl overflow-hidden shadow-lg mb-4">
										<SafeImage
											src={urlFor(similarProduct.colors?.[0]?.mainImage)?.url()}
											alt={similarProduct.name}
											fill
											sizes="25vw"
											className="object-cover object-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
										/>
									</div>
									<h3 className="font-medium text-nude-dark text-lg mb-2">
										{similarProduct.name}
									</h3>
									<p className="text-2xl font-semibold text-logo">
										{similarProduct.price.toFixed(2)} €
									</p>
								</Link>
							</motion.div>
						))}
					</motion.div>
				</motion.section>
			)}

			{/* Modale d'affichage des images */}
			{isImageModalOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					onClick={closeImageModal}
				>
					{/* Fond avec blur - teinte nude */}
					<div
						className="absolute inset-0 backdrop-blur-lg"
						style={{ backgroundColor: "rgba(180, 153, 130, 0.85)" }}
					/>

					{/* Conteneur de la modale - AUGMENTÉ DE 10% */}
					<motion.div
						className="relative w-full h-full md:w-[95%] md:h-[95%] lg:w-[95%] lg:h-[95%] bg-gradient-to-br from-white to-nude-light/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Bouton de fermeture */}
						<button
							onClick={closeImageModal}
							className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/95 hover:bg-rose-dark hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg group cursor-pointer"
							aria-label="Fermer"
						>
							<svg
								className="w-5 h-5 md:w-6 md:h-6 text-nude-dark group-hover:text-white transition-colors"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						{/* Barre de miniatures sur le côté GAUCHE (desktop) ou en bas (mobile) */}
						<div className="md:w-32 lg:w-40 bg-gradient-to-b md:bg-gradient-to-r from-nude-light/95 to-nude-light/80 backdrop-blur-sm border-t md:border-t-0 md:border-r border-rose-medium flex md:flex-col items-center justify-center p-3 md:py-6 md:px-3 overflow-x-auto md:overflow-hidden overflow-y-hidden gap-3 md:order-1 scrollbar-hide">
							{/* Indicateurs de défilement */}
							{colorImages.length > 5 && (
								<div className="hidden md:flex flex-col items-center gap-1 mb-2">
									{modalImageIndex > 0 && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-nude-dark/60"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 15l7-7 7 7"
												/>
											</svg>
										</motion.div>
									)}
								</div>
							)}

							{/* Miniatures - fenêtre glissante */}
							<div className="flex md:flex-col items-center gap-3 md:gap-3 touch-pan-x md:touch-pan-y">
								<AnimatePresence mode="popLayout">
									{visibleThumbnails.map(({ image, index }) => (
										<motion.button
											key={`thumbnail-${index}`}
											onClick={(e) => {
												e.stopPropagation();
												setModalImageIndex(index);
											}}
											initial={{ opacity: 0, scale: 0.8, y: 20 }}
											animate={{ opacity: 1, scale: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.8, y: -20 }}
											transition={{ duration: 0.25, ease: "easeOut" }}
											layout
											className={`flex-shrink-0 relative w-16 h-20 md:w-20 md:h-24 lg:w-24 lg:h-28 rounded-xl overflow-hidden transition-all duration-300 ${
												modalImageIndex === index
													? "ring-4 ring-rose-dark shadow-xl scale-105"
													: "ring-2 ring-rose-medium/40 hover:ring-rose-dark hover:scale-102 opacity-60 hover:opacity-100"
											}`}
										>
											<SafeImage
												src={urlFor(image)?.url()}
												alt={
													image?.alt ||
													`${selectedColor?.name} - Miniature ${index + 1}`
												}
												fill
												sizes="120px"
												className="object-cover"
											/>
											{/* Numéro de l'image */}
											<div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
												{index + 1}
											</div>
										</motion.button>
									))}
								</AnimatePresence>
							</div>

							{/* Indicateurs de défilement bas */}
							{colorImages.length > 5 && (
								<div className="hidden md:flex flex-col items-center gap-1 mt-2">
									{modalImageIndex < colorImages.length - 1 && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-nude-dark/60"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</motion.div>
									)}
								</div>
							)}

							{/* Indicateur de position - version desktop */}
							<div className="hidden md:block text-center text-xs lg:text-sm text-nude-dark font-semibold mt-1 mb-3 bg-white/80 px-3 py-2 rounded-full">
								{modalImageIndex + 1} / {colorImages.length}
							</div>
						</div>

						{/* Zone principale avec l'image */}
						<div
							className="flex-1 relative flex items-center justify-center p-2 md:p-6 md:order-2"
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
						>
							{/* Flèche gauche */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									navigateModalImage("prev");
								}}
								className="absolute left-2 md:left-6 w-10 h-10 md:w-14 md:h-14 bg-white/95 hover:bg-rose-dark rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10 group hover:scale-110 cursor-pointer"
								aria-label="Image précédente"
							>
								<svg
									className="w-5 h-5 md:w-7 md:h-7 text-nude-dark group-hover:text-white transition-colors"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2.5}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>

							{/* Image principale - PLUS GRANDE */}
							<div className="relative w-full h-full flex items-center justify-center">
								<div className="relative w-full h-full max-w-5xl">
									<SafeImage
										src={urlFor(colorImages[modalImageIndex])?.url()}
										alt={
											colorImages[modalImageIndex]?.alt ||
											`${product.name} - Image ${modalImageIndex + 1}`
										}
										fill
										className="object-contain drop-shadow-2xl"
										sizes="(max-width: 768px) 100vw, 85vw"
										priority
									/>
								</div>
								{/* Indicateur de position - sur l'image en mobile */}
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
									{modalImageIndex + 1} / {colorImages.length}
								</div>
							</div>

							{/* Flèche droite */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									navigateModalImage("next");
								}}
								className="absolute right-2 md:right-6 w-10 h-10 md:w-14 md:h-14 bg-white/95 hover:bg-rose-dark rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10 group hover:scale-110 cursor-pointer"
								aria-label="Image suivante"
							>
								<svg
									className="w-5 h-5 md:w-7 md:h-7 text-nude-dark group-hover:text-white transition-colors"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2.5}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</div>
	);
}
