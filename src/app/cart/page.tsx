"use client";

import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function CartPage() {
	const cartItems = useCartStore((state) => state.cartItems);
	const removeFromCart = useCartStore((state) => state.removeFromCart);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const getCartTotal = useCartStore((state) => state.getCartTotal);
	const clearCart = useCartStore((state) => state.clearCart);
	const user = useAuthStore((state) => state.user);
	const router = useRouter();

	// Fonction pour vérifier le stock disponible d'un item
	const getAvailableStock = (item: any) => {
		return item.maxQuantity || 10;
	};

	// Calcul des frais de livraison
	const getShippingCost = () => {
		const total = getCartTotal();
		return total >= 50 ? 0 : 5.99; // Livraison gratuite dès 50€
	};

	// Calcul du total final
	const getFinalTotal = () => {
		return getCartTotal() + getShippingCost();
	};

	// Calculs panier
	const subtotalHT = cartItems.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0
	);
	const tva = subtotalHT * 0.2;
	const livraison = subtotalHT + tva >= 50 ? 0 : 5.99;
	const totalTTC = subtotalHT + tva + livraison;

	return (
		<div className="min-h-screen bg-beige-light">
			{/* Header */}
			<header className="bg-nude-light border-b border-gray-200">
				<div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-6">
					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="flex items-center gap-2 text-nude-dark hover:text-logo transition-colors"
						>
							<FiArrowLeft className="w-5 h-5" />
							<span>Continuer mes achats</span>
						</Link>
					</div>
					<h1 className="text-4xl lg:text-5xl font-alex-brush text-logo mt-12">
						Mon Panier
					</h1>
				</div>
			</header>

			{/* Contenu principal */}
			<main className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12">
				{!cartItems || cartItems.length === 0 ? (
					/* Panier vide */
					<div className="text-center py-16">
						<div className="text-8xl mb-6">🛒</div>
						<h2 className="text-3xl font-alex-brush text-logo mb-4">
							Votre panier est vide
						</h2>
						<p className="text-nude-dark mb-8 max-w-md mx-auto">
							Découvrez nos collections et ajoutez des produits à votre panier
							pour commencer vos achats.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/collections"
								className="rounded-2xl bg-nude-dark text-white py-3 px-8 text-lg hover:bg-rose-dark transition-all duration-300"
							>
								Découvrir nos collections
							</Link>
							<Link
								href="/"
								className="rounded-2xl ring-2 ring-nude-dark text-nude-dark py-3 px-8 text-lg hover:bg-nude-dark hover:text-white transition-all duration-300"
							>
								Retour à l'accueil
							</Link>
						</div>
					</div>
				) : (
					/* Panier avec articles */
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-12  lg:mt-10">
						{/* Liste des articles */}
						<div className="lg:col-span-2">
							<div className="bg-nude-light rounded-2xl shadow-lg p-6">
								<h2 className="text-2xl font-semibold text-nude-dark mb-6">
									Articles ({cartItems.length})
								</h2>

								<div className="space-y-4 sm:space-y-6">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex flex-col sm:flex-row gap-4 p-4 bg-nude-light/30 rounded-xl"
										>
											{/* Image et bouton supprimer */}
											<div className="flex items-start justify-between sm:flex-col sm:items-start">
												<div className="relative w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0">
													<Image
														src={item.image}
														alt={item.imageAlt || item.name}
														fill
														className="object-cover rounded-lg"
													/>
												</div>

												{/* Bouton supprimer - mobile */}
												<button
													onClick={() => removeFromCart(item.id)}
													className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer sm:hidden"
												>
													<FiTrash2 className="w-3 h-3" />
													<span className="text-xs">Supprimer</span>
												</button>
											</div>

											{/* Informations */}
											<div className="flex-1 flex flex-col justify-between">
												<div>
													{/* Nom et prix */}
													<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
														<h3 className="font-semibold text-base sm:text-lg text-nude-dark">
															{item.name}
														</h3>
														<div className="text-left sm:text-right">
															{item.originalPrice &&
															item.originalPrice < item.price ? (
																<div className="text-sm text-gray-400 line-through">
																	{item.originalPrice.toFixed(2)}€
																</div>
															) : null}
															<div className="text-lg sm:text-xl font-semibold text-logo">
																{item.price.toFixed(2)}€
															</div>
														</div>
													</div>

													{/* Détails couleur et taille */}
													<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
														<div className="flex items-center gap-2">
															<div
																className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300"
																style={{ backgroundColor: item.colorHex }}
															/>
															<span className="text-xs sm:text-sm text-gray-600">
																{item.color}
															</span>
														</div>
														<span className="hidden sm:inline text-gray-400">
															•
														</span>
														<span className="text-xs sm:text-sm text-gray-600">
															Taille {item.size}
														</span>
													</div>
												</div>

												{/* Actions */}
												<div className="flex items-center justify-between">
													{/* Quantité */}
													<div className="flex items-center gap-2 sm:gap-3">
														<button
															onClick={() =>
																updateQuantity(item.id, item.quantity - 1)
															}
															disabled={item.quantity <= 1}
															className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ring-2 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
														>
															−
														</button>
														<span className="text-base sm:text-lg font-medium text-nude-dark min-w-[20px] sm:min-w-[30px] text-center">
															{item.quantity}
														</span>
														<button
															onClick={() =>
																updateQuantity(item.id, item.quantity + 1)
															}
															disabled={
																item.quantity >= getAvailableStock(item)
															}
															className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ring-2 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
														>
															+
														</button>
													</div>

													{/* Supprimer - desktop */}
													<button
														onClick={() => removeFromCart(item.id)}
														className="hidden sm:flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
													>
														<FiTrash2 className="w-4 h-4" />
														<span className="text-sm">Supprimer</span>
													</button>
												</div>
											</div>
										</div>
									))}
								</div>

								{/* Actions du panier */}
								<div className="border-t border-gray-200 pt-6 mt-6">
									<div className="flex justify-between items-center">
										<button
											onClick={clearCart}
											className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
										>
											Vider le panier
										</button>
										<Link
											href="/collections"
											className="text-nude-dark hover:text-logo transition-colors cursor-pointer"
										>
											Continuer mes achats
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Résumé de commande */}
						<div className="lg:col-span-1">
							<div className="bg-nude-light rounded-2xl shadow-lg p-6 sticky top-6">
								<h2 className="text-2xl font-semibold text-nude-dark mb-6">
									Résumé de commande
								</h2>

								{/* Détails des prix */}
								<div className="space-y-4 mb-6">
									<div className="flex justify-between text-gray-600">
										<span>Sous-total HT</span>
										<span>{subtotalHT.toFixed(2)}€</span>
									</div>
									<div className="flex justify-between text-gray-600">
										<span>TVA (20%)</span>
										<span>{tva.toFixed(2)}€</span>
									</div>
									<div className="flex justify-between text-gray-600">
										<span>Frais de livraison</span>
										<span>
											{livraison === 0 ? (
												<span className="text-green-600 font-medium">
													Gratuit
												</span>
											) : (
												`${livraison.toFixed(2)}€`
											)}
										</span>
									</div>
									{livraison > 0 && (
										<div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
											🎉 Plus que {(50 - (subtotalHT + tva)).toFixed(2)}€ pour
											la livraison gratuite !
										</div>
									)}
									<div className="border-t border-gray-200 pt-4">
										<div className="flex justify-between text-xl font-semibold text-logo">
											<span>Total TTC</span>
											<span>{totalTTC.toFixed(2)}€</span>
										</div>
									</div>
								</div>

								{/* Bouton commander */}
								<button
									onClick={() => {
										if (!user) {
											toast.error(
												"Vous devez être connecté pour passer commande"
											);
											router.push("/login?redirect=/checkout");
										} else {
											router.push("/checkout");
										}
									}}
									className="w-[80%] md:w-[60%] lg:w-full 2xl:w-[80%] bg-nude-dark text-white py-3 px-6 rounded-2xl text-base md:text-lg font-semibold hover:bg-rose-dark transition-all duration-300 text-center hover:text-nude-dark hover:border-nude-dark hover:border-2 cursor-pointer"
								>
									Passer la commande
								</button>

								{/* Informations supplémentaires */}
								<div className="mt-6 space-y-3 text-sm text-gray-500">
									<div className="flex items-center gap-2">
										<svg
											className="w-4 h-4 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span>Livraison gratuite dès 60€</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-4 h-4 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span>Retours gratuits sous 15 jours</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-4 h-4 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span>Paiement sécurisé</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
