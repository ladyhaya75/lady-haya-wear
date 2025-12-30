"use client";
import { Card, CardContent } from "@/components/ui/card";
import OrderCardSkeleton from "@/components/Skeletons/OrderCardSkeleton";
import { useAuthStore } from "@/stores/authStore";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useMemo, useState } from "react";

// Types importés depuis useOrders hook

// Ajoute une fonction utilitaire pour la couleur des badges
function getBadgeClass(statut: string) {
	switch (statut) {
		case "CANCELLED":
		case "REFUNDED":
			return "bg-red-500 text-white";
		case "DELIVERED":
			return "bg-green-600 text-white";
		case "PENDING":
		case "CONFIRMED":
		case "PROCESSING":
			return "bg-rose-dark-2 text-white";
		case "SHIPPED":
			return "bg-orange-400 text-white";
		default:
			return "bg-nude-dark text-white";
	}
}

// Fonction pour traduire les statuts
function getStatusLabel(statut: string) {
	switch (statut) {
		case "PENDING":
			return "En attente";
		case "CONFIRMED":
			return "Confirmée";
		case "PROCESSING":
			return "En préparation";
		case "SHIPPED":
			return "En livraison";
		case "DELIVERED":
			return "Livrée";
		case "CANCELLED":
			return "Annulée";
		case "REFUNDED":
			return "Remboursée";
		default:
			return statut;
	}
}

// Fonction pour obtenir le lien de suivi
function getTrackingUrl(carrier: string, trackingNumber: string) {
	if (!trackingNumber || !carrier) return "";

	switch (carrier) {
		case "colissimo":
			return `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`;
		case "chronopost":
			return `https://www.chronopost.fr/tracking-colis?listeNumerosLT=${trackingNumber}`;
		case "mondial-relay":
			return `https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=${trackingNumber}`;
		case "dpd":
			return `https://www.dpd.fr/tracer/${trackingNumber}`;
		case "ups":
			return `https://www.ups.com/track?tracknum=${trackingNumber}`;
		case "fedex":
			return `https://www.fedex.com/fr-fr/tracking.html?tracknumbers=${trackingNumber}`;
		default:
			return "";
	}
}

// Fonction pour obtenir le nom du transporteur
function getCarrierName(carrier: string) {
	switch (carrier) {
		case "colissimo":
			return "Colissimo";
		case "chronopost":
			return "Chronopost";
		case "mondial-relay":
			return "Mondial Relay";
		case "dpd":
			return "DPD";
		case "ups":
			return "UPS";
		case "fedex":
			return "FedEx";
		default:
			return carrier;
	}
}

function CommandeModal({
	commande,
	onClose,
}: {
	commande: Order | null;
	onClose: () => void;
}) {
	if (!commande) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-lg relative animate-fade-in-up">
				<button
					className="absolute top-4 right-4 text-logo text-2xl font-bold hover:text-nude-dark cursor-pointer"
					onClick={onClose}
					type="button"
				>
					×
				</button>
				<h2 className="text-2xl font-bold text-logo mb-2 text-center">
					Commande #{commande.orderNumber}
				</h2>
				<div className="text-center text-nude-dark text-sm mb-2">
					Date : {new Date(commande.createdAt).toLocaleDateString()}
				</div>
				{/* Bloc nom et adresse de livraison */}
				{commande.shippingAddress && (
					<div className="bg-beige-light rounded-lg p-4 mb-4 text-sm text-nude-dark-2">
						<div className="font-semibold text-logo mb-1">Livraison à :</div>
						<div>
							{commande.shippingAddress.firstName}{" "}
							{commande.shippingAddress.lastName}
						</div>
						<div>{commande.shippingAddress.street}</div>
						<div>
							{commande.shippingAddress.zipCode} {commande.shippingAddress.city}
						</div>
					</div>
				)}
				<div className="flex flex-wrap gap-4 mb-4 justify-center">
					{commande.items.map((item) => (
						<div key={item.id} className="flex flex-col items-center w-28">
							<div className="w-20 h-20 relative mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
								<span className="text-xs text-gray-500 text-center">Image</span>
							</div>
							<div className="text-xs text-logo font-semibold text-center">
								{item.productName}
							</div>
							<div className="text-xs text-nude-dark-2">x{item.quantity}</div>
							<div className="text-xs text-nude-dark font-bold">
								€{item.totalPrice.toFixed(2)}
							</div>
						</div>
					))}
				</div>
				<div className="flex justify-between items-center mb-4">
					<span className="font-semibold text-nude-dark">Statut :</span>
					<span
						className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(commande.status)}`}
					>
						{getStatusLabel(commande.status)}
					</span>
				</div>
				<div className="flex justify-between items-center mb-6">
					<span className="font-semibold text-nude-dark">Total :</span>
					<span className="font-bold text-logo">
						€{commande.total.toFixed(2)}
					</span>
				</div>

				{/* Suivi de colis dans la modal */}
				{commande.trackingNumber && commande.carrier && (
					<div className="mb-4 p-3 bg-blue-50 rounded-lg">
						<p className="text-sm font-medium text-blue-800 mb-2">
							📦 Suivi de colis
						</p>
						<div className="text-sm text-blue-700">
							<div className="flex items-center gap-2 mb-1">
								<span>{getCarrierName(commande.carrier)}</span>
								<span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">
									{commande.trackingNumber}
								</span>
							</div>
							{getTrackingUrl(commande.carrier, commande.trackingNumber) && (
								<a
									href={getTrackingUrl(
										commande.carrier,
										commande.trackingNumber
									)}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
								>
									🔗 Suivre mon colis
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
								</a>
							)}
						</div>
					</div>
				)}

				<button
					className="w-full bg-rose-dark-2 hover:bg-rose-dark text-white font-semibold py-2 rounded-full transition-all duration-200 cursor-pointer"
					onClick={() =>
						(window.location.href = `/contact?commande=${commande.orderNumber}`)
					}
				>
					Signaler un souci
				</button>
			</div>
		</div>
	);
}

export default function OrdersPage() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const [modalCommande, setModalCommande] = useState<Order | null>(null);
	const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
	
	// ✅ Utiliser React Query pour les commandes (cache automatique!)
	const { data: orders = [], isLoading: loading, error: queryError } = useOrders();
	
	// Séparer les commandes actuelles et historiques (mémoizé pour éviter recalculs)
	const { currentOrders, historicalOrders } = useMemo(() => {
		const current: Order[] = [];
		const historical: Order[] = [];
		
		orders.forEach((order) => {
			if (["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)) {
				historical.push(order);
			} else {
				current.push(order);
			}
		});
		
		return { currentOrders: current, historicalOrders: historical };
	}, [orders]);
	
	const error = queryError ? "Erreur lors du chargement des commandes" : null;

	// Fonction pour basculer l'expansion d'une commande
	const toggleOrderExpansion = (orderId: string) => {
		setExpandedOrders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(orderId)) {
				newSet.delete(orderId);
			} else {
				newSet.add(orderId);
			}
			return newSet;
		});
	};

	// Rediriger si non connecté
	if (!isAuthenticated) {
		return (
			<section className="px-4 mt-8 md:mt-16 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12 min-h-screen bg-beige-light animate-fade-in-up">
				<div className="w-full max-w-3xl mx-auto text-center">
					<h1 className="text-5xl md:text-6xl font-alex-brush text-logo mt-10  mb-10">
						Mes commandes
					</h1>
					<p className="text-nude-dark-2 text-lg">
						Veuillez vous connecter pour voir vos commandes.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="px-4 mt-8 md:mt-16 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12 min-h-screen bg-beige-light animate-fade-in-up">
			<CommandeModal
				commande={modalCommande}
				onClose={() => setModalCommande(null)}
			/>
			<div className="w-full max-w-3xl mx-auto">
				<h1 className="text-5xl md:text-6xl font-alex-brush text-logo mt-10 mb-10 text-center">
					Mes commandes
				</h1>

				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<OrderCardSkeleton key={i} />
						))}
						<p className="mt-2 text-nude-dark-2">Chargement des commandes...</p>
					</div>
				) : error ? (
					<div className="text-center py-8">
						<p className="text-red-500">{error}</p>
					</div>
				) : (
					<>
						{/* Commandes en cours */}
						<div className="mb-12">
							<h2 className="text-2xl font-semibold text-nude-dark mb-6">
								En cours
							</h2>
							{currentOrders.length === 0 ? (
								<p className="text-nude-dark-2 text-center">
									Aucune commande en cours.
								</p>
							) : (
								<Card className="shadow-lg">
									<CardContent className="p-4">
										<div className="space-y-4">
											{currentOrders.map((cmd) => {
												const isExpanded = expandedOrders.has(cmd.id);

												return (
													<div
														key={cmd.id}
														className="border rounded-lg p-3 hover:shadow-md transition-shadow"
													>
														{/* En-tête compacte - toujours visible */}
														<div className="flex justify-between items-center mb-2">
															<div className="flex-1">
																<div className="flex items-center gap-3 mb-1">
																	<h3 className="font-semibold lg:text-lg text-sm">
																		Commande #{cmd.orderNumber}
																	</h3>
																	<span
																		className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeClass(cmd.status)}`}
																	>
																		{getStatusLabel(cmd.status)}
																	</span>
																</div>
																<p className="text-gray-600 font-medium lg:text-base text-sm">
																	{cmd.items.length} produit(s)
																</p>
															</div>
															<div className="text-right">
																<div className="flex items-center justify-end gap-2 mb-1">
																	<p className="lg:text-lg text-md font-bold text-logo">
																		€{cmd.total.toFixed(2)}
																	</p>
																</div>
																<p className="text-sm text-gray-500">
																	{new Date(cmd.createdAt).toLocaleDateString()}
																</p>
															</div>
														</div>

														{/* Bouton d'expansion */}
														<div className="flex justify-center">
															<button
																onClick={() => toggleOrderExpansion(cmd.id)}
																className="flex items-center gap-1 text-sm text-nude-dark hover:text-nude-dark-2 transition-colors underline cursor-pointer"
															>
																<span>
																	{isExpanded ? "Masquer" : "Voir"} les détails
																</span>
																<svg
																	className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
															</button>
														</div>

														{/* Contenu détaillé - visible seulement si expandé */}
														{isExpanded && (
															<div className="pt-2 border-t border-gray-200">
																{/* Produits */}
																<div className="mb-3">
																	<p className="text-sm font-medium text-gray-700 mb-1">
																		Produits :
																	</p>
																	<div className="space-y-0.5">
																		{cmd.items.map((item) => (
																			<div
																				key={item.id}
																				className="flex justify-between text-sm"
																			>
																				<span>
																					{item.productName} x{item.quantity}
																					{item.colorName &&
																						` (${item.colorName})`}
																					{item.sizeName &&
																						` - ${item.sizeName}`}
																				</span>
																				<span className="font-medium">
																					€{item.totalPrice.toFixed(2)}
																				</span>
																			</div>
																		))}
																	</div>
																</div>

																{/* Adresse de livraison */}
																{cmd.shippingAddress && (
																	<div className="mb-3">
																		<p className="text-sm font-medium text-gray-700 mb-1">
																			Adresse de livraison :
																		</p>
																		<div className="text-sm text-gray-600">
																			<div>
																				{cmd.shippingAddress.firstName}{" "}
																				{cmd.shippingAddress.lastName}
																			</div>
																			<div>{cmd.shippingAddress.street}</div>
																			<div>
																				{cmd.shippingAddress.zipCode}{" "}
																				{cmd.shippingAddress.city}
																			</div>
																		</div>
																	</div>
																)}

																{/* Suivi de colis */}
																{cmd.trackingNumber && cmd.carrier && (
																	<div className="mb-3">
																		<p className="text-sm font-medium text-gray-700 mb-1">
																			Suivi de colis :
																		</p>
																		<div className="text-sm text-gray-600">
																			<div className="flex items-center gap-2">
																				<span>
																					📦 {getCarrierName(cmd.carrier)}
																				</span>
																				<span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
																					{cmd.trackingNumber}
																				</span>
																			</div>
																			{getTrackingUrl(
																				cmd.carrier,
																				cmd.trackingNumber
																			) && (
																				<a
																					href={getTrackingUrl(
																						cmd.carrier,
																						cmd.trackingNumber
																					)}
																					target="_blank"
																					rel="noopener noreferrer"
																					className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs mt-1"
																				>
																					🔗 Suivre mon colis
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
																							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
																						/>
																					</svg>
																				</a>
																			)}
																		</div>
																	</div>
																)}

																{/* Bouton signaler un souci */}
																<button
																	className="w-full bg-rose-dark-2 hover:bg-rose-dark text-white font-semibold py-2 rounded-full transition-all duration-200 cursor-pointer text-sm"
																	onClick={() =>
																		(window.location.href = `/contact?commande=${cmd.orderNumber}`)
																	}
																>
																	Signaler un souci
																</button>
															</div>
														)}
													</div>
												);
											})}
										</div>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Historique des commandes */}
						<div>
							<h2 className="text-2xl font-semibold text-nude-dark mb-6">
								Historique
							</h2>
							{historicalOrders.length === 0 ? (
								<p className="text-nude-dark-2 text-center">
									Aucune commande passée.
								</p>
							) : (
								<Card className="shadow-lg">
									<CardContent className="p-4">
										<div className="space-y-4">
											{historicalOrders.map((cmd) => {
												const isExpanded = expandedOrders.has(cmd.id);

												return (
													<div
														key={cmd.id}
														className="border rounded-lg p-3 hover:shadow-md transition-shadow"
													>
														{/* En-tête compacte - toujours visible */}
														<div className="flex justify-between items-center mb-2">
															<div className="flex-1">
																<div className="flex items-center gap-3 mb-1">
																	<h3 className="font-semibold lg:text-lg text-sm">
																		Commande #{cmd.orderNumber}
																	</h3>
																	<span
																		className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeClass(cmd.status)}`}
																	>
																		{getStatusLabel(cmd.status)}
																	</span>
																</div>
																<p className="text-gray-600 font-medium lg:text-base text-sm">
																	{cmd.items.length} produit(s)
																</p>
															</div>
															<div className="text-right">
																<div className="flex items-center justify-end gap-2 mb-1">
																	<p className="lg:text-lg text-md font-bold text-logo">
																		€{cmd.total.toFixed(2)}
																	</p>
																</div>
																<p className="text-sm text-gray-500">
																	{new Date(cmd.createdAt).toLocaleDateString()}
																</p>
															</div>
														</div>

														{/* Bouton d'expansion */}
														<div className="flex justify-center">
															<button
																onClick={() => toggleOrderExpansion(cmd.id)}
																className="flex items-center gap-1 text-sm text-nude-dark hover:text-nude-dark-2 transition-colors underline cursor-pointer"
															>
																<span>
																	{isExpanded ? "Masquer" : "Voir"} les détails
																</span>
																<svg
																	className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
															</button>
														</div>

														{/* Contenu détaillé - visible seulement si expandé */}
														{isExpanded && (
															<div className="pt-2 border-t border-gray-200">
																{/* Produits */}
																<div className="mb-3">
																	<p className="text-sm font-medium text-gray-700 mb-1">
																		Produits :
																	</p>
																	<div className="space-y-0.5">
																		{cmd.items.map((item) => (
																			<div
																				key={item.id}
																				className="flex justify-between text-sm"
																			>
																				<span>
																					{item.productName} x{item.quantity}
																					{item.colorName &&
																						` (${item.colorName})`}
																					{item.sizeName &&
																						` - ${item.sizeName}`}
																				</span>
																				<span className="font-medium">
																					€{item.totalPrice.toFixed(2)}
																				</span>
																			</div>
																		))}
																	</div>
																</div>

																{/* Adresse de livraison */}
																{cmd.shippingAddress && (
																	<div className="mb-3">
																		<p className="text-sm font-medium text-gray-700 mb-1">
																			Adresse de livraison :
																		</p>
																		<div className="text-sm text-gray-600">
																			<div>
																				{cmd.shippingAddress.firstName}{" "}
																				{cmd.shippingAddress.lastName}
																			</div>
																			<div>{cmd.shippingAddress.street}</div>
																			<div>
																				{cmd.shippingAddress.zipCode}{" "}
																				{cmd.shippingAddress.city}
																			</div>
																		</div>
																	</div>
																)}

																{/* Suivi de colis */}
																{cmd.trackingNumber && cmd.carrier && (
																	<div className="mb-3">
																		<p className="text-sm font-medium text-gray-700 mb-1">
																			Suivi de colis :
																		</p>
																		<div className="text-sm text-gray-600">
																			<div className="flex items-center gap-2">
																				<span>
																					📦 {getCarrierName(cmd.carrier)}
																				</span>
																				<span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
																					{cmd.trackingNumber}
																				</span>
																			</div>
																			{getTrackingUrl(
																				cmd.carrier,
																				cmd.trackingNumber
																			) && (
																				<a
																					href={getTrackingUrl(
																						cmd.carrier,
																						cmd.trackingNumber
																					)}
																					target="_blank"
																					rel="noopener noreferrer"
																					className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs mt-1"
																				>
																					🔗 Suivre mon colis
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
																							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
																						/>
																					</svg>
																				</a>
																			)}
																		</div>
																	</div>
																)}

																{/* Bouton signaler un souci */}
																<button
																	className="w-full bg-rose-dark-2 hover:bg-rose-dark text-white font-semibold py-2 rounded-full transition-all duration-200 cursor-pointer text-sm"
																	onClick={() =>
																		(window.location.href = `/contact?commande=${cmd.orderNumber}`)
																	}
																>
																	Signaler un souci
																</button>
															</div>
														)}
													</div>
												);
											})}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</>
				)}
			</div>
		</section>
	);
}
