"use client";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

interface CartModalProps {
	onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
	const cartItems = useCartStore((state) => state.cartItems);
	const removeFromCart = useCartStore((state) => state.removeFromCart);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const getCartTotal = useCartStore((state) => state.getCartTotal);
	const user = useAuthStore((state) => state.user);
	const router = useRouter();

	// Fonction pour vérifier le stock disponible d'un item
	const getAvailableStock = (item: any) => {
		return item.maxQuantity || 10; // Utilise la quantité max stockée dans l'item
	};
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Vérifier si le clic est sur l'icône du panier
			const target = event.target as HTMLElement;
			const isCartIcon = target.closest("[data-cart-icon]");

			if (
				modalRef.current &&
				!modalRef.current.contains(target) &&
				!isCartIcon
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	return (
		<div
			ref={modalRef}
			className="absolute w-80 sm:w-96 top-12 right-0  p-6 rounded-2xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-nude-light flex flex-col gap-6 z-20 max-h-[80vh] overflow-y-auto cursor-default"
		>
			{!cartItems || cartItems.length === 0 ? (
				<div className="text-center py-8">
					<div className="text-4xl mb-4">🛒</div>
					<div className="text-logo text-lg mb-2">Votre panier est vide</div>
					<div className="text-gray-500 text-sm">
						Ajoutez des produits pour commencer vos achats
					</div>
				</div>
			) : (
				<>
					<h2 className="text-2xl text-logo font-semibold">Panier</h2>
					<div className="flex flex-col gap-4">
						{/* ITEMS */}
						{cartItems.map((item) => (
							<div
								key={item.id}
								className="flex gap-4 p-3 bg-white rounded-xl shadow-sm cursor-default"
							>
								<Image
									src={item.image}
									alt={item.imageAlt || item.name}
									width={80}
									height={96}
									className="object-cover rounded-lg"
								/>
								<div className="flex flex-col justify-between w-full">
									{/* TOP */}
									<div className="">
										{/* TITLE */}
										<div className="flex items-center justify-between gap-4">
											<h3 className="font-semibold text-sm text-nude-dark line-clamp-2">
												{item.name}
											</h3>
											<div className="text-sm font-semibold text-logo">
												{item.originalPrice &&
												item.originalPrice < item.price ? (
													<span className="line-through text-gray-400 mr-1">
														{item.originalPrice.toFixed(2)}€
													</span>
												) : null}
												{item.price.toFixed(2)}€
											</div>
										</div>

										{/* DESC */}
										<div className="text-xs text-gray-500 mt-1">
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full border border-gray-300"
													style={{ backgroundColor: item.colorHex }}
												/>
												<span>{item.color}</span>
												<span>•</span>
												<span>Taille {item.size}</span>
											</div>
										</div>
									</div>

									{/* BOTTOM */}
									<div className="flex items-center justify-between mt-3">
										<div className="flex items-center gap-2">
											<button
												onClick={() =>
													updateQuantity(item.id, item.quantity - 1)
												}
												disabled={item.quantity <= 1}
												className="w-6 h-6 rounded-full ring-1 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
											>
												−
											</button>
											<span className="text-sm font-medium text-nude-dark min-w-[20px] text-center">
												{item.quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(item.id, item.quantity + 1)
												}
												disabled={item.quantity >= getAvailableStock(item)}
												className="w-6 h-6 rounded-full ring-1 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
											>
												+
											</button>
										</div>
										<button
											onClick={() => removeFromCart(item.id)}
											className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
											title="Supprimer"
										>
											<FiTrash2 className="w-3 h-3" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
					{/* BOTTOM */}
					<div className="border-t border-gray-200 pt-4">
						<div className="flex items-center justify-between font-semibold mb-2">
							<span className="text-nude-dark">Sous-total</span>
							<span className="text-logo text-lg">
								{getCartTotal().toFixed(2)}€
							</span>
						</div>
						<p className="text-gray-500 text-xs mb-4">
							Livraison gratuite dès 69€ d'achat
						</p>
						<div className="flex gap-2">
							<Link
								href="/cart"
								onClick={onClose}
								className="flex-1 rounded-xl bg-nude-light text-logo py-3 px-4 ring-1 ring-nude-dark text-center text-sm hover:bg-nude-dark hover:text-nude-light hover:border-nude-light transition-all duration-300 cursor-pointer"
							>
								Voir le panier
							</Link>
							<button
								onClick={() => {
									if (!user) {
										toast.error(
											"Vous devez être connecté pour passer commande"
										);
										onClose();
										router.push("/login?redirect=/checkout");
									} else {
										onClose();
										router.push("/checkout");
									}
								}}
								className="flex-1 rounded-xl py-3 px-4 border-2 border-nude-dark bg-nude-dark text-nude-light text-sm hover:bg-rose-dark hover:border-nude-dark hover:text-nude-dark transition-all duration-300 cursor-pointer text-center"
							>
								Commander
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
