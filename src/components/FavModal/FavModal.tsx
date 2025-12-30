"use client";

import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

interface FavModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function FavModal({ isOpen, onClose }: FavModalProps) {
	const favorites = useFavoritesStore((state) => state.favorites);
	const removeFromFavorites = useFavoritesStore((state) => state.removeFromFavorites);
	const clearAllFavorites = useFavoritesStore((state) => state.clearAllFavorites);
	const user = useAuthStore((state) => state.user);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleRemoveFavorite = (favorite: any) => {
		removeFromFavorites(favorite.productId, user?.id || null);
	};

	const handleClearAllFavorites = () => {
		if (confirm("Êtes-vous sûr de vouloir supprimer tous vos favoris ?")) {
			clearAllFavorites();
			toast.info("Tous les favoris ont été supprimés", {
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
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
					onClick={handleBackdropClick}
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						className="bg-nude-light rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
					>
						{/* Header */}
						<div className="bg-nude-dark text-nude-light p-6">
							<h2 className="text-4xl font-alex-brush text-center">
								Mes Favoris ({favorites.length})
							</h2>
						</div>

						{/* Content */}
						<div className="p-6 max-h-[60vh] overflow-y-auto">
							{favorites.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500 text-lg">
										Aucun favori pour le moment
									</p>
									<p className="text-gray-400 mt-2">
										Ajoutez des produits à vos favoris pour les retrouver ici
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{favorites.map((favorite, index) => (
										<motion.div
											key={favorite.productId}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}
											className={`p-4 rounded-xl border-2 border-nude-light ${
												index % 2 === 0 ? "bg-rose-light-2" : "bg-[#d9c4b5]/80"
											}`}
										>
											<div className="flex items-center gap-4">
												{/* Image */}
												<div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
													<img
														src={favorite.image}
														alt={favorite.imageAlt || favorite.name}
														className="w-full h-full object-cover"
													/>
												</div>

												{/* Product Info */}
												<div className="flex-1 min-w-0">
													<Link
														href={`/products/${favorite.slug}`}
														onClick={onClose}
														className="block hover:opacity-80 transition-opacity"
													>
														<h3 className="font-balqis text-2xl font-semibold text-nude-dark-2 truncate">
															{favorite.name}
														</h3>
														<p className="text-gray-500 text-sm truncate">
															Catégorie : {favorite.category?.name}
														</p>
														<p className="text-nude-dark font-semibold">
															{favorite.price} €
														</p>
													</Link>
												</div>

												{/* Delete Button */}
												<button
													onClick={() => handleRemoveFavorite(favorite)}
													className="p-2 text-gray-600 hover:text-red-500 hover:scale-105 transition-colors cursor-pointer"
													title="Supprimer des favoris"
												>
													<FaTrash className="text-lg" />
												</button>
											</div>
										</motion.div>
									))}
								</div>
							)}
						</div>

						{/* Footer */}
						{favorites.length > 0 && (
							<div className="bg-gray-50 p-4 border-t border-gray-200">
								<div className="flex justify-between items-center">
									<p className="text-gray-600">
										{favorites.length} produit{favorites.length > 1 ? "s" : ""}{" "}
										favori{favorites.length > 1 ? "s" : ""}
									</p>
									<button
										onClick={handleClearAllFavorites}
										className="text-red-400 hover:text-red-600 text-sm font-medium cursor-pointer"
									>
										Tout supprimer
									</button>
								</div>
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
