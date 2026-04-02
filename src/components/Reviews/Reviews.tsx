"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Review {
	id: string;
	name: string;
	review: string;
	rating: number;
	date: string;
	productName?: string;
}

interface ReviewsData {
	reviews: Review[];
	stats: {
		total: number;
		average: number;
		ratings: Record<number, number>;
	};
}

// Données de fallback en cas d'erreur ou de chargement
const fallbackReviews: Review[] = [];

export default function Reviews() {
	const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
	const [stats, setStats] = useState<ReviewsData["stats"]>({
		total: 0,
		average: 5,
		ratings: {},
	});
	const [currentReview, setCurrentReview] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const [loading, setLoading] = useState(true);

	// Charger les avis depuis l'API
	useEffect(() => {
		fetchReviews();
	}, []);

	// Auto-rotation des avis
	useEffect(() => {
		if (!isAutoPlaying || reviews.length === 0) return;

		const interval = setInterval(() => {
			setCurrentReview((prev) => (prev + 1) % reviews.length);
		}, 4000); // Change toutes les 4 secondes

		return () => clearInterval(interval);
	}, [isAutoPlaying, reviews.length]);

	// S'assurer que currentReview reste dans les limites
	useEffect(() => {
		if (reviews.length > 0 && currentReview >= reviews.length) {
			setCurrentReview(0);
		}
	}, [reviews.length, currentReview]);

	const fetchReviews = async () => {
		try {
			const response = await fetch("/api/reviews?limit=10");
			const data = await response.json();

			if (response.ok && data.reviews.length > 0) {
				setReviews(data.reviews);
				setStats(data.stats);
			} else {
				// Pas d'avis disponibles, garder le tableau vide
				console.log("Aucun avis disponible");
				setReviews([]);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des avis:", error);
			// En cas d'erreur, garder le tableau vide
			setReviews([]);
		} finally {
			setLoading(false);
		}
	};

	const goToReview = (index: number) => {
		setCurrentReview(index);
		setIsAutoPlaying(false);
		// Reprendre l'auto-play après 10 secondes
		setTimeout(() => setIsAutoPlaying(true), 10000);
	};

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<svg
				key={i}
				className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
			</svg>
		));
	};

	return (
		<section className="relative py-16 bg-gradient-to-br from-rose-light via-beige-light to-nude-light overflow-hidden">
			{/* Background decoration */}

			<div className="relative z-10 max-w-6xl mx-auto px-4">
				{/* Titre de section */}
				<div className="text-center mb-12">
					<motion.h2
						className="text-5xl lg:text-6xl font-alex-brush text-logo mb-4"
						initial={{ y: 50, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					>
						Nos Clientes Témoignent
					</motion.h2>
					<motion.p
						className="text-nude-dark-2 font-light text-lg lg:text-xl max-w-2xl mx-auto"
						initial={{ y: 30, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
					>
						Découvrez ce que nos clientes pensent de nos créations
					</motion.p>
				</div>

				{/* Container des avis */}
				<motion.div
					className="relative"
					initial={{ opacity: 0, y: 100 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{
						duration: 1.0,
						ease: [0.68, -0.55, 0.265, 1.55],
						delay: 0.5,
					}}
				>
					{reviews.length > 0 && reviews[currentReview] ? (
						<>
							{/* Avis principal */}
							<AnimatePresence mode="wait">
								<motion.div
									key={currentReview}
									className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border-2 border-rose-dark max-w-4xl mx-auto"
									initial={{
										opacity: 0,
										scale: 0.8,
										rotateY: 90,
										x: 100,
									}}
									animate={{
										opacity: 1,
										scale: 1,
										rotateY: 0,
										x: 0,
									}}
									exit={{
										opacity: 0,
										scale: 0.8,
										rotateY: -90,
										x: -100,
									}}
									transition={{
										duration: 0.8,
										ease: [0.25, 0.1, 0.25, 1],
									}}
								>
									<div className="text-center">
										{/* Étoiles */}
										<motion.div
											className="flex justify-center mb-6"
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											transition={{
												duration: 0.6,
												delay: 0.2,
												ease: [0.68, -0.55, 0.265, 1.55],
											}}
										>
											{renderStars(reviews[currentReview].rating)}
										</motion.div>

										{/* Avis avec guillemets */}
										<motion.div
											className="relative mb-8"
											initial={{ y: 30, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{
												duration: 0.8,
												delay: 0.4,
												ease: "easeOut",
											}}
										>
											<svg
												className="absolute -top-4 -left-4 w-12 h-12 text-rose-dark"
												fill="currentColor"
												viewBox="0 0 32 32"
											>
												<path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8zM22 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8z" />
											</svg>
											<blockquote className="text-lg lg:text-xl text-nude-dark-2 font-light italic leading-relaxed px-8">
												"{reviews[currentReview].review}"
											</blockquote>
											<svg
												className="absolute -bottom-4 -right-4 w-12 h-12 text-rose-dark rotate-180"
												fill="currentColor"
												viewBox="0 0 32 32"
											>
												<path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8zM22 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8z" />
											</svg>
										</motion.div>
									</div>

									{/* Nom du client et produit */}
									<motion.div
										className="border-t border-logo pt-6 text-center"
										initial={{ y: 20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
									>
										<p className="text-logo font-balqis text-xl font-semibold">
											{reviews[currentReview].name.split(" ")[0]}
										</p>
										<p className="text-nude-dark text-sm mt-1">
											Cliente vérifiée
											{reviews[currentReview].productName && (
												<> • {reviews[currentReview].productName}</>
											)}
										</p>
										{!loading && stats.total > 0 && (
											<p className="text-nude-dark text-xs mt-1">
												Note moyenne: {stats.average}/5 ({stats.total} avis)
											</p>
										)}
									</motion.div>
								</motion.div>
							</AnimatePresence>

							{/* Navigation dots */}
							<motion.div
								className="flex justify-center mt-8 gap-3"
								initial={{ y: 30, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
							>
								{reviews.map((_, index) => (
									<motion.button
										key={index}
										onClick={() => goToReview(index)}
										className={`w-3 h-3 rounded-full transition-all duration-300 ${
											index === currentReview
												? "bg-logo opacity-100"
												: "bg-logo opacity-50 hover:opacity-70"
										}`}
										aria-label={`Voir l'avis ${index + 1}`}
										initial={{ scale: 0, opacity: 0 }}
										animate={{
											scale: index === currentReview ? 1.4 : 1,
											opacity: index === currentReview ? 1 : 0.5,
										}}
										whileHover={{ scale: 1.2 }}
										whileTap={{ scale: 0.9 }}
										transition={{
											duration: 0.3,
											delay: 0.9 + index * 0.1,
											ease: "easeOut",
										}}
									/>
								))}
							</motion.div>
						</>
					) : (
						/* Message de fallback si aucun avis */
						<div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border-2 border-rose-dark max-w-4xl mx-auto">
							<div className="text-center">
								<div className="flex justify-center mb-6">{renderStars(5)}</div>
								<div className="relative mb-8">
									<svg
										className="absolute -top-4 -left-4 w-12 h-12 text-rose-dark"
										fill="currentColor"
										viewBox="0 0 32 32"
									>
										<path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8zM22 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8z" />
									</svg>
									<blockquote className="text-lg lg:text-xl text-nude-dark-2 font-light italic leading-relaxed px-8">
										"Chargement des avis clients..."
									</blockquote>
									<svg
										className="absolute -bottom-4 -right-4 w-12 h-12 text-rose-dark rotate-180"
										fill="currentColor"
										viewBox="0 0 32 32"
									>
										<path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8zM22 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-2.2 1.8-4 4-4V8z" />
									</svg>
								</div>
								<div className="border-t border-logo pt-6">
									<p className="text-logo font-balqis text-xl font-semibold">
										Lady Haya Wear
									</p>
									<p className="text-nude-dark text-sm mt-1">
										Vos avis nous aident à grandir ✨
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Message d'encouragement */}
					<motion.div
						className="mt-12 text-center"
						initial={{ y: 30, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
					>
						{loading ? (
							<div className="flex justify-center items-center">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-logo mr-2"></div>
								<p className="text-nude-dark-2 font-light text-lg">
									Chargement des avis...
								</p>
							</div>
						) : stats.total > 0 ? (
							<p className="text-nude-dark-2 font-light text-lg">
								{stats.total} client{stats.total > 1 ? "s" : ""} satisfait
								{stats.total > 1 ? "s" : ""} ✨
							</p>
						) : (
							<p className="text-nude-dark-2 font-light text-lg">
								Vos avis nous aident à grandir ✨
							</p>
						)}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
