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
				<div className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-4 sm:py-6">
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
			<main className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-6 sm:py-12">
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
							<div className="bg-nude-light rounded-2xl shadow-lg p-3 sm:p-6">
								<h2 className="text-2xl font-semibold text-nude-dark mb-6">
									Articles ({cartItems.length})
								</h2>

								<div className="space-y-3 sm:space-y-6">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex flex-row gap-2 sm:gap-4 p-2 sm:p-4 bg-nude-light/30 rounded-xl"
										>
											{/* Colonne 1: Image + Quantité */}
											<div className="flex flex-col gap-1.5 sm:gap-2">
												<div className="relative w-18 h-26 sm:w-24 sm:h-32 flex-shrink-0">
													<Image
														src={item.image}
														alt={item.imageAlt || item.name}
														fill
														className="object-cover rounded-lg"
													/>
												</div>
												{/* Quantité sous l'image */}
												<div className="flex items-center gap-1 sm:gap-1.5 justify-center mt-2">
													<button
														onClick={() =>
															updateQuantity(item.id, item.quantity - 1)
														}
														disabled={item.quantity <= 1}
														className="w-5 h-5 sm:w-7 sm:h-7 rounded-full ring-2 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-xs"
													>
														−
													</button>
													<span className="text-xs sm:text-base font-medium text-nude-dark min-w-[14px] sm:min-w-[20px] text-center">
														{item.quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(item.id, item.quantity + 1)
														}
														disabled={item.quantity >= getAvailableStock(item)}
														className="w-5 h-5 sm:w-7 sm:h-7 rounded-full ring-2 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-xs"
													>
														+
													</button>
												</div>
											</div>

											{/* Colonne 2: Informations produit */}
											<div className="flex-1 flex flex-col justify-between min-w-0">
												{/* Nom, détails et prix */}
												<div className="flex justify-between items-start gap-1.5 sm:gap-2">
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold font-balqis text-lg md:text-xl text-nude-dark line-clamp-2">
															{item.name}
														</h3>
														{/* Détails couleur et taille directement sous le nom */}
														<div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
															<div className="flex items-center gap-1">
																<div
																	className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-500"
																	style={{ backgroundColor: item.colorHex }}
																/>
																<span className="truncate">{item.color}</span>
															</div>
															<span className="text-gray-500">•</span>
															<span className="whitespace-nowrap">
																T. {item.size}
															</span>
														</div>
													</div>
													<div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
														<p className="text-base sm:text-xl font-semibold text-logo whitespace-nowrap">
															{item.price.toFixed(2)}€
														</p>
														{item.promoPercentage && item.originalPrice && (
															<div className="flex items-center gap-1 sm:gap-1.5">
																<p className="text-xs sm:text-sm text-gray-400 line-through whitespace-nowrap">
																	{item.originalPrice.toFixed(2)}€
																</p>
																<span className="bg-orange-400 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-md whitespace-nowrap">
																	-{item.promoPercentage}%
																</span>
															</div>
														)}
													</div>
												</div>

												{/* Bouton supprimer aligné en bas */}
												<div className="flex justify-end">
													<button
														onClick={() => removeFromCart(item.id)}
														className="flex items-center gap-1.5 text-red-400 hover:text-red-600 transition-colors cursor-pointer text-sm"
													>
														<FiTrash2 className="w-4 h-4" />
														<span className=" sm:inline">Supprimer</span>
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
