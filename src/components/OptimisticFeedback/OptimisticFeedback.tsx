"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useCartStore } from "@/stores/cartStore";

interface OptimisticIndicatorProps {
	itemId: string;
	type: "favorite" | "cart";
}

/**
 * Composant pour afficher un indicateur visuel lors d'une mise à jour optimiste
 * Affiche une légère animation de pulsation pendant que la sync est en cours
 */
export function OptimisticIndicator({ itemId, type }: OptimisticIndicatorProps) {
	const isFavoriteOptimistic = useFavoritesStore((state) =>
		state.isOptimistic(itemId)
	);
	const isCartOptimistic = useCartStore((state) => state.isOptimistic(itemId));

	const isOptimistic =
		type === "favorite" ? isFavoriteOptimistic : isCartOptimistic;

	if (!isOptimistic) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ scale: 1, opacity: 0.3 }}
				animate={{
					scale: [1, 1.05, 1],
					opacity: [0.3, 0.6, 0.3],
				}}
				exit={{ opacity: 0 }}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
				}}
			/>
		</AnimatePresence>
	);
}

/**
 * Spinner de chargement optimiste
 * Affiche un spinner subtil pendant qu'une action est en cours
 */
export function OptimisticSpinner() {
	return (
		<motion.div
			className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
			animate={{ rotate: 360 }}
			transition={{
				duration: 0.8,
				repeat: Infinity,
				ease: "linear",
			}}
		/>
	);
}

/**
 * Badge optimiste
 * Affiche un badge "Synchronisation..." pendant qu'une action est en cours
 */
interface OptimisticBadgeProps {
	itemId: string;
	type: "favorite" | "cart";
}

export function OptimisticBadge({ itemId, type }: OptimisticBadgeProps) {
	const isFavoriteOptimistic = useFavoritesStore((state) =>
		state.isOptimistic(itemId)
	);
	const isCartOptimistic = useCartStore((state) => state.isOptimistic(itemId));

	const isOptimistic =
		type === "favorite" ? isFavoriteOptimistic : isCartOptimistic;

	return (
		<AnimatePresence>
			{isOptimistic && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2 }}
					className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1"
				>
					<OptimisticSpinner />
					<span>Sync...</span>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

/**
 * Feedback optimiste pour le bouton favori
 */
interface OptimisticFavoriteButtonProps {
	productId: string;
	isFavorite: boolean;
	children: React.ReactNode;
	onClick: () => void;
	className?: string;
}

export function OptimisticFavoriteButton({
	productId,
	isFavorite,
	children,
	onClick,
	className = "",
}: OptimisticFavoriteButtonProps) {
	const isOptimistic = useFavoritesStore((state) =>
		state.isOptimistic(productId)
	);

	return (
		<motion.button
			onClick={onClick}
			className={`relative ${className}`}
			whileTap={{ scale: 0.9 }}
			animate={
				isOptimistic
					? {
							scale: [1, 1.1, 1],
							transition: { duration: 0.5, repeat: Infinity },
					  }
					: {}
			}
		>
			{children}
			{isOptimistic && (
				<motion.div
					className="absolute inset-0 rounded-full bg-white/30"
					initial={{ scale: 0.8, opacity: 0.8 }}
					animate={{
						scale: 1.4,
						opacity: 0,
					}}
					transition={{
						duration: 0.6,
						repeat: Infinity,
					}}
				/>
			)}
		</motion.button>
	);
}

/**
 * Feedback optimiste pour les boutons du panier
 */
interface OptimisticCartButtonProps {
	itemId: string;
	children: React.ReactNode;
	onClick: () => void;
	className?: string;
	disabled?: boolean;
}

export function OptimisticCartButton({
	itemId,
	children,
	onClick,
	className = "",
	disabled = false,
}: OptimisticCartButtonProps) {
	const isOptimistic = useCartStore((state) => state.isOptimistic(itemId));

	return (
		<motion.button
			onClick={onClick}
			disabled={disabled || isOptimistic}
			className={`relative ${className} ${isOptimistic ? "opacity-60 cursor-wait" : ""}`}
			whileTap={!disabled && !isOptimistic ? { scale: 0.95 } : {}}
		>
			{isOptimistic ? <OptimisticSpinner /> : children}
		</motion.button>
	);
}

