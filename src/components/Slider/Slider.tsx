"use client";
import { urlFor } from "@/lib/sanity";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import SafeImage from "../ui/SafeImage";

interface SliderProps {
	featuredCategories: any[];
}

export default function Slider({ featuredCategories }: SliderProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(true);
	const [isPaused, setIsPaused] = useState(false);

	// Tableau des gradients disponibles
	const gradients = [
		"bg-gradient-to-r from-beige-light to-beige-dark",
		"bg-gradient-to-r from-nude-light to-nude-dark",
		"bg-gradient-to-r from-rose-light-2 to-rose-dark",
	];

	useEffect(() => {
		if (isPaused) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => prev + 1);
		}, 3000);

		return () => clearInterval(interval);
	}, [isPaused]);

	// Réinitialiser la position quand on atteint la fin du deuxième set
	useEffect(() => {
		if (currentSlide === featuredCategories.length * 2) {
			setTimeout(() => {
				setIsTransitioning(false);
				setCurrentSlide(featuredCategories.length);
				setTimeout(() => {
					setIsTransitioning(true);
				}, 50);
			}, 1000);
		}
	}, [currentSlide, featuredCategories.length]);

	// Gérer le clic sur les dots
	const handleDotClick = (index: number) => {
		setCurrentSlide(featuredCategories.length + index);
	};

	// Fonction pour obtenir l'index réel (pour les gradients)
	const getRealIndex = (slideIndex: number) => {
		return slideIndex % gradients.length;
	};

	// Créer un tableau avec des images dupliquées pour l'effet infini
	const infiniteSlides = [
		...featuredCategories, // Premier set
		...featuredCategories, // Deuxième set
		...featuredCategories, // Troisième set
	];

	// Calculer l'index actuel pour les dots
	const getCurrentDotIndex = () => {
		return currentSlide % featuredCategories.length;
	};

	return (
		<div className="h-screen w-full overflow-hidden relative">
			<div
				className={`w-max h-full flex ${isTransitioning ? "transition-all ease-in-out duration-1000" : ""}`}
				style={{
					transform: `translateX(-${currentSlide * 100}vw)`,
				}}
			>
				{infiniteSlides.map((category, index) => (
					<div
						className={`${gradients[getRealIndex(index)]} h-full w-screen flex-shrink-0 flex flex-col lg:flex-row`}
						key={`${category._id}-${index}`}
					>
						{/* TEXT CONTAINER */}
						<motion.div
							className="h-1/3 lg:w-1/2 lg:h-full w-full flex flex-col items-center justify-center gap-3 lg:gap-8 2xl:gap-12 text-center mt-10 lg:mt-0 lg:pt-0"
							initial={{ x: -100, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ duration: 0.8, delay: 0.3 }}
								whileHover={{ scale: 1.1, rotate: 5 }}
							>
								<SafeImage
									src="/assets/logo-haya.png"
									alt="logo"
									width={200}
									height={200}
									className="w-24 h-24 lg:w-48 lg:h-48"
								/>
							</motion.div>
							<motion.h2
								className="hidden lg:block text-3xl xl:text-4xl 2xl:text-4xl font-semibold font-balqis text-center text-logo"
								initial={{ y: 30, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.4 }}
							>
								{category.name}
							</motion.h2>
							<motion.h1
								className="text-5xl font-alex-brush text-logo lg:text-5xl xl:text-7xl text-center"
								initial={{ y: 30, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.5 }}
							>
								Lady Haya Wear
							</motion.h1>
							<motion.p
								className="text-xs lg:text-sm tracking-widest text-logo text-center font-light -mt-4"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.55 }}
							>
								— LA MODESTIE SUBLIMÉE —
							</motion.p>
							<motion.div
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.6 }}
								whileTap={{ scale: 0.95 }}
								className="hover:scale-105 transition-transform duration-100"
							>
								<Link
									href={`/collections/${category.slug?.current || category._id}`}
									className="hidden lg:block"
								>
									<button
										className="rounded-md py-3 px-4 bg-logo text-nude-light cursor-pointer transition-all duration-300"
										onMouseEnter={() => setIsPaused(true)}
										onMouseLeave={() => setIsPaused(false)}
									>
										Voir la collection
									</button>
								</Link>
							</motion.div>
						</motion.div>

						{/* IMAGE CONTAINER */}
						<motion.div
							className="relative h-2/3 lg:w-1/2 lg:h-full"
							initial={{ x: 100, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.3 }}
						>
							<motion.div
								initial={{ scale: 1.1, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 1, delay: 0.4 }}
								className="relative h-full w-full"
							>
								<SafeImage
									src={category.image ? urlFor(category.image)?.url() : null}
									alt={category.image?.alt || category.name}
									fill
									sizes="100%"
									className="object-cover"
									priority={index === 0}
								/>
							</motion.div>
							{/* DESCRIPTION OVERLAY - TOP */}
							<motion.div
								className="absolute top-4 left-1/2 transform -translate-x-1/2 lg:hidden"
								initial={{ y: -50, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.6 }}
							>
								<h2 className="text-3xl font-semibold text-logo drop-shadow-lg text-center font-balqis">
									{category.name}
								</h2>
							</motion.div>
							{/* BUTTON OVERLAY - BOTTOM RIGHT */}
							<motion.div
								className="absolute bottom-14 right-2 md:right-6 lg:hidden"
								initial={{ x: 50, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.7 }}
							>
								<Link
									href={`/collections/${category.slug?.current || category._id}`}
								>
									<motion.button
										className="rounded-md py-2 px-2 md:px-3 mr-4 md:mr-0 text-nude-light text-base bg-logo cursor-pointer hover:bg-nude-dark-2 hover:scale-105 transition-all duration-100"
										whileTap={{ scale: 0.95 }}
										onMouseEnter={() => setIsPaused(true)}
										onMouseLeave={() => setIsPaused(false)}
									>
										Voir la collection
									</motion.button>
								</Link>
							</motion.div>
						</motion.div>
					</div>
				))}
			</div>

			{/* DOTS - FIXED AT BOTTOM */}
			<motion.div
				className="absolute left-1/2 bottom-8 lg:bottom-12 xl:bottom-16 2xl:bottom-20 transform -translate-x-1/2 flex gap-4 z-10"
				initial={{ y: 50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8, delay: 0.8 }}
			>
				{featuredCategories.map((category, index) => (
					<motion.div
						className={`w-3 h-3 rounded-full ring-1 ring-gray-600 cursor-pointer flex items-center justify-center ${
							getCurrentDotIndex() === index ? "scale-150" : ""
						}`}
						key={category._id}
						onClick={() => handleDotClick(index)}
						whileHover={{ scale: 1.2 }}
						whileTap={{ scale: 0.9 }}
						transition={{ duration: 0.2 }}
					>
						{getCurrentDotIndex() === index && (
							<motion.div
								className="w-[6px] h-[6px] bg-gray-600 rounded-full"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.3 }}
							/>
						)}
					</motion.div>
				))}
			</motion.div>
		</div>
	);
}
