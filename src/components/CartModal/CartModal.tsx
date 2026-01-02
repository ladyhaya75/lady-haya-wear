"use client";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import CartItem from "./CartItem";

interface CartModalProps {
	onClose: () => void;
}

/**
 * CartModal optimisé avec useMemo et useCallback
 * pour réduire les re-renders inutiles
 */
export default function CartModal({ onClose }: CartModalProps) {
	const cartItems = useCartStore((state) => state.cartItems);
	const removeFromCart = useCartStore((state) => state.removeFromCart);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const getCartTotal = useCartStore((state) => state.getCartTotal);
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const modalRef = useRef<HTMLDivElement>(null);

	// Mémoïser le total du panier
	const cartTotal = useMemo(() => getCartTotal(), [getCartTotal, cartItems]);

	// useCallback pour les handlers afin d'éviter de recréer ces fonctions
	const handleUpdateQuantity = useCallback(
		(id: string, quantity: number) => {
			updateQuantity(id, quantity, user?.id || null);
		},
		[updateQuantity, user?.id]
	);

	const handleRemoveFromCart = useCallback(
		(id: string) => {
			removeFromCart(id, user?.id || null);
		},
		[removeFromCart, user?.id]
	);

	const handleCheckout = useCallback(() => {
		if (!user) {
			toast.error("Vous devez être connecté pour passer commande");
			onClose();
			router.push("/login?redirect=/checkout");
		} else {
			onClose();
			router.push("/checkout");
		}
	}, [user, onClose, router]);

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
			className="absolute w-[calc(100vw-1rem)] max-w-[400px] sm:w-96 top-12 right-0 p-3 sm:p-6 rounded-2xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-nude-light flex flex-col gap-4 sm:gap-6 z-20 max-h-[80vh] overflow-y-auto cursor-default"
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
							<CartItem
								key={item.id}
								item={item}
								onUpdateQuantity={handleUpdateQuantity}
								onRemove={handleRemoveFromCart}
							/>
						))}
					</div>
					{/* BOTTOM */}
					<div className="border-t border-gray-200 pt-3 sm:pt-4">
						<div className="flex items-center justify-between font-semibold mb-2">
							<span className="text-nude-dark text-sm sm:text-base">Sous-total</span>
							<span className="text-logo text-base sm:text-lg">{cartTotal.toFixed(2)}€</span>
						</div>
						<p className="text-gray-500 text-xs mb-3 sm:mb-4">
							Livraison gratuite dès 69€ d'achat
						</p>
						<div className="flex gap-2">
							<Link
								href="/cart"
								onClick={onClose}
								className="flex-1 rounded-xl bg-nude-light text-logo py-2.5 sm:py-3 px-2 sm:px-4 ring-1 ring-nude-dark text-center text-xs sm:text-sm hover:bg-nude-dark hover:text-nude-light hover:border-nude-light transition-all duration-300 cursor-pointer"
							>
								Voir le panier
							</Link>
							<button
								onClick={handleCheckout}
								className="flex-1 rounded-xl py-2.5 sm:py-3 px-2 sm:px-4 border-2 border-nude-dark bg-nude-dark text-nude-light text-xs sm:text-sm hover:bg-rose-dark hover:border-nude-dark hover:text-nude-dark transition-all duration-300 cursor-pointer text-center"
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
