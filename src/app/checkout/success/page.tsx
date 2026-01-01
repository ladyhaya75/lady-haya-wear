"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import Loader from "@/components/Loader";
import { useCartStore } from "@/stores/cartStore";

export default function CheckoutSuccessPage() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");
	const [orderData, setOrderData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const clearCart = useCartStore((state) => state.clearCart);

	useEffect(() => {
		if (sessionId) {
			// Vider le panier après un paiement réussi
			clearCart();

			// Récupérer les détails de la session Stripe
			fetch(`/api/stripe/session?session_id=${sessionId}`)
				.then((res) => res.json())
				.then((data) => {
					setOrderData(data);
					setLoading(false);
				})
				.catch((error) => {
					console.error("Erreur récupération session:", error);
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
	}, [sessionId, clearCart]);

	if (loading) return <Loader />;

	if (!sessionId || !orderData) {
		return (
			<div className="min-h-screen bg-beige-light flex items-center justify-center">
				<div className="text-center max-w-md mx-auto px-4">
					<div className="text-8xl mb-6">❌</div>
					<h2 className="text-3xl font-alex-brush text-logo mb-4">
						Session invalide
					</h2>
					<p className="text-nude-dark mb-8">
						Impossible de récupérer les informations de votre commande.
					</p>
					<Link
						href="/allProducts"
						className="inline-block rounded-2xl bg-nude-dark text-white py-3 px-8 text-lg hover:bg-rose-dark transition-all duration-300"
					>
						Retour à la boutique
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-beige-light">
			<div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12">
				<div className="max-w-3xl mx-auto">
					{/* En-tête avec icône de succès */}
					<div className="bg-nude-light rounded-2xl shadow-lg p-8 mb-8 text-center">
						<div className="flex justify-center mb-6">
							<FiCheckCircle className="w-24 h-24 text-green-500" />
						</div>
						<h1 className="text-4xl lg:text-5xl font-alex-brush text-logo mb-4">
							Commande confirmée !
						</h1>
						<p className="text-xl text-nude-dark mb-2">
							Merci pour votre achat 🎉
						</p>
						<p className="text-lg text-gray-600">
							Numéro de commande:{" "}
							<span className="font-semibold text-logo">
								{orderData.orderNumber || "En cours..."}
							</span>
						</p>
					</div>

					{/* Informations de commande */}
					<div className="bg-nude-light rounded-2xl shadow-lg p-8 mb-8">
						<h2 className="text-2xl font-semibold text-nude-dark mb-6">
							Détails de votre commande
						</h2>

						<div className="space-y-4">
							<div className="flex justify-between text-gray-600">
								<span>Email de confirmation envoyé à:</span>
								<span className="font-medium">{orderData.email}</span>
							</div>
							<div className="flex justify-between text-gray-600">
								<span>Montant total:</span>
								<span className="font-semibold text-logo text-xl">
									{(orderData.amount / 100).toFixed(2)} €
								</span>
							</div>
							<div className="flex justify-between text-gray-600">
								<span>Mode de paiement:</span>
								<span className="font-medium">Carte bancaire (Stripe)</span>
							</div>
						</div>
					</div>

					{/* Prochaines étapes */}
					<div className="bg-rose-light-2 rounded-2xl shadow-lg border border-nude-dark p-8 mb-8">
						<h3 className="text-xl font-semibold text-nude-dark mb-4">
							📦 Prochaines étapes
						</h3>
						<ul className="space-y-3 text-gray-700">
							<li className="flex items-start gap-2">
								<span className="text-logo font-bold">1.</span>
								<span>
									Un email de confirmation vous a été envoyé avec les détails
									de votre commande
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-logo font-bold">2.</span>
								<span>
									Votre commande sera préparée et expédiée dans les plus brefs
									délais
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-logo font-bold">3.</span>
								<span>
									Vous recevrez un email avec le numéro de suivi dès
									l'expédition
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-logo font-bold">4.</span>
								<span>
									Vous pouvez suivre l'état de votre commande dans votre espace
									client
								</span>
							</li>
						</ul>
					</div>

					{/* Boutons d'action */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/orders"
							className="text-center rounded-2xl bg-nude-dark text-white py-3 px-8 text-lg hover:bg-logo transition-all duration-300"
						>
							Voir mes commandes
						</Link>
						<Link
							href="/allProducts"
							className="text-center rounded-2xl ring-1 ring-nude-dark text-nude-dark bg-nude-light py-3 px-8 text-lg hover:bg-nude-dark hover:text-nude-light transition-all duration-300"
						>
							Continuer mes achats
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

