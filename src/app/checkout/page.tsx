"use client";

import Loader from "@/components/Loader";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCcMastercard, FaCcPaypal, FaCcVisa, FaLock } from "react-icons/fa";
import { FiArrowLeft, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast } from "react-toastify";
import { getStripe } from "@/lib/stripe-client";

const fakeUser = {
	nom: "Dupont",
	prenom: "Marie",
	adresse: "123 rue de Paris, 75001 Paris",
};

export default function CheckoutPage() {
	const cartItems = useCartStore((state) => state.cartItems);
	const getCartTotal = useCartStore((state) => state.getCartTotal);
	const clearCart = useCartStore((state) => state.clearCart);
	const [showAddressMenu, setShowAddressMenu] = useState(false);
	const [selectedDelivery, setSelectedDelivery] = useState("domicile");
	const [selectedPayment, setSelectedPayment] = useState("");
	const [civility, setCivility] = useState("Mme");
	const [user, setUser] = useState<any>(null);
	const [address, setAddress] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const [modalForm, setModalForm] = useState({
		nom: address?.lastName || address?.nom || "",
		prenom: address?.firstName || address?.prenom || "",
		ligne1: address?.street || address?.ligne1 || "",
		ligne2: address?.company || address?.ligne2 || "",
		codePostal: address?.zipCode || address?.codePostal || "",
		ville: address?.city || address?.ville || "",
	});
	const [adresses, setAdresses] = useState<any[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
		null
	);
	const [localAddresses, setLocalAddresses] = useState<any[]>([]);
	const [showOtherAddresses, setShowOtherAddresses] = useState(false);

	// États pour le code promo
	const [promoCode, setPromoCode] = useState("");
	const [promoDiscount, setPromoDiscount] = useState(0);
	const [promoApplied, setPromoApplied] = useState(false);
	const [promoLoading, setPromoLoading] = useState(false);
	const [promoError, setPromoError] = useState("");
	const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);

	// État pour la newsletter
	const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

	useEffect(() => {
		async function fetchUserAndAddress() {
			setLoading(true);
			try {
				const userRes = await fetch("/api/user/account");

				// Vérifier si l'utilisateur est authentifié
				if (!userRes.ok || userRes.status === 401) {
					console.log("Utilisateur non authentifié, redirection vers login");
					toast.error("Vous devez être connecté pour accéder au checkout");
					router.push("/login?redirect=/checkout");
					return;
				}

				const userData = await userRes.json();
				console.log("Utilisateur récupéré:", userData);
				setUser(userData.user);

				const addressRes = await fetch("/api/user/account/address");
				const addressData = await addressRes.json();
				console.log("Adresse principale récupérée:", addressData);
				setAddress(addressData.address);
			} catch (error) {
				console.error("Erreur lors de la récupération des données:", error);
				toast.error("Vous devez être connecté pour accéder au checkout");
				router.push("/login?redirect=/checkout");
			} finally {
				setLoading(false);
			}
		}
		fetchUserAndAddress();
	}, [router]);

	useEffect(() => {
		async function fetchAddresses() {
			setLoading(true);
			try {
				const res = await fetch("/api/user/account/address?all=1");
				const data = await res.json();
				console.log("Adresses récupérées:", data);
				setAdresses(data.addresses || []);
				// Sélectionner la première adresse par défaut
				setSelectedAddressId(data.addresses?.[0]?.id || null);
			} catch (error) {
				console.error("Erreur lors de la récupération des adresses:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchAddresses();
	}, []);

	if (loading) return <Loader />;

	// Vérifier si le panier est vide
	if (!cartItems || cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-beige-light flex items-center justify-center">
				<div className="text-center">
					<div className="text-8xl mb-6">🛒</div>
					<h2 className="text-3xl font-alex-brush text-logo mb-4">
						Votre panier est vide
					</h2>
					<p className="text-nude-dark mb-8 max-w-md mx-auto">
						Ajoutez des produits à votre panier pour finaliser votre commande.
					</p>
					<Link
						href="/allProducts"
						className="rounded-2xl bg-nude-dark text-white py-3 px-8 text-lg hover:bg-rose-dark transition-all duration-300"
					>
						Découvrir nos produits
					</Link>
				</div>
			</div>
		);
	}

	// Vérifier si l'utilisateur a des adresses
	const hasAddress = adresses && adresses.length > 0;

	// Calculs panier avec les vraies données
	const subtotalHT = getCartTotal();
	const tva = subtotalHT * 0.2;

	// Calcul des frais de livraison selon le mode choisi
	let livraison = 0;
	if (selectedDelivery === "chronopost") {
		livraison = 8.9; // Frais fixes pour Chronopost
	} else if (subtotalHT + tva >= 50) {
		livraison = 0; // Livraison gratuite pour Colissimo et Mondial Relay
	} else {
		livraison = 5.99; // Frais standard
	}

	// Appliquer la réduction promo
	const totalTTC = subtotalHT + tva + livraison - promoDiscount;

	// Fonction pour appliquer un code promo
	const applyPromoCode = async () => {
		if (!promoCode.trim()) return;

		setPromoLoading(true);
		setPromoError("");

		try {
			const res = await fetch("/api/promo/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code: promoCode.trim(),
					total: subtotalHT + tva,
				}),
			});

			const data = await res.json();

			if (data.valid) {
				setPromoDiscount(data.discount);
				setPromoApplied(true);
				setAppliedPromoCode(data.promoCode);
				toast.success(`Code promo ${data.promoCode.code} appliqué !`);
			} else {
				setPromoError(data.message || "Code promo invalide");
				toast.error(data.message || "Code promo invalide");
			}
		} catch (error) {
			setPromoError("Erreur lors de la validation");
			toast.error("Erreur lors de la validation");
		} finally {
			setPromoLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-beige-light">
			{/* Bandeau paiement sécurisé */}
			<div className="fixed top-0 left-0 w-full z-50 bg-black text-white flex items-center justify-center py-3 shadow-md">
				<FaLock className="mr-2 text-lg" />
				<span className="font-semibold tracking-wide">
					Paiement 100% sécurisé
				</span>
			</div>
			{/* Header */}
			<header className="bg-rose-light border-b border-gray-200 mt-12">
				<div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-6">
					<div className="flex items-center gap-4">
						<Link
							href="/cart"
							className="flex items-center gap-2 text-nude-dark hover:text-logo transition-colors cursor-pointer"
						>
							<FiArrowLeft className="w-5 h-5" />
							<span>Retour au panier</span>
						</Link>
					</div>
					<h1 className="text-4xl lg:text-5xl font-alex-brush text-logo mt-8">
						Finaliser ma commande
					</h1>
				</div>
			</header>

			{/* Contenu principal */}
			<main className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12">
				<div className="flex flex-col lg:flex-row gap-12 lg:mt-4">
					{/* Colonne principale (infos, livraison, paiement) */}
					<div className="w-full lg:w-[60%]">
						<div className="bg-nude-light rounded-2xl shadow-lg p-6 mb-8">
							<h2 className="text-2xl font-semibold text-nude-dark mb-6">
								Informations client
							</h2>
							<div className="flex flex-col gap-4 mb-4">
								<div className="font-medium">
									{user?.civility ? user.civility + " " : ""}
									{user?.nom} {user?.prenom}
								</div>
								<div className="text-nude-dark font-semibold mb-2 text-base">
									Adresse de livraison
								</div>
								<div className="mb-4">
									{adresses.length === 0 ? (
										<div className="flex flex-col items-center gap-4">
											<div className="text-nude-dark font-semibold text-base">
												Aucune adresse enregistrée
											</div>
											<button
												className="bg-nude-dark text-white px-6 py-2 rounded-2xl font-semibold hover:bg-logo transition-all duration-200 cursor-pointer"
												onClick={() => {
													setModalForm({
														nom: "",
														prenom: "",
														ligne1: "",
														ligne2: "",
														codePostal: "",
														ville: "",
													});
													setCivility("Mme");
													setShowAddressMenu(true);
												}}
											>
												Ajouter une adresse
											</button>
										</div>
									) : (
										<div className="flex flex-col gap-2">
											{/* Affichage de la première adresse (toujours visible) */}
											{adresses.length > 0 && (
												<label
													key={adresses[0].id}
													className="flex items-center gap-3 cursor-pointer"
												>
													<input
														type="radio"
														name="selectedAddress"
														checked={selectedAddressId === adresses[0].id}
														onChange={() =>
															setSelectedAddressId(adresses[0].id)
														}
														className="sr-only"
													/>
													<span
														className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedAddressId === adresses[0].id ? "bg-nude-dark" : "bg-white"}`}
													/>
													<div className="flex-1 bg-rose-light-2 rounded-2xl shadow-lg border border-nude-dark p-4 max-w-md">
														<div className=" flex items-center">
															<span className="text-sm text-gray-900 mr-2">
																{adresses[0].civility === "MR"
																	? "M."
																	: adresses[0].civility === "MME"
																		? "Mme"
																		: ""}
															</span>
															<span className="text-gray-900">
																{adresses[0].firstName} {adresses[0].lastName}
															</span>
															{adresses[0].isDefault && (
																<span className="text-xs text-gray-900 ml-2">
																	(principale)
																</span>
															)}
														</div>
														<div className="text-gray-900">{adresses[0].street}</div>
														<div className="text-gray-900">
															{adresses[0].zipCode} {adresses[0].city}
														</div>
													</div>
												</label>
											)}

											{/* Lien pour afficher/masquer les autres adresses (s'il y en a plus d'une) */}
											{adresses.length > 1 && (
												<button
													type="button"
													className="flex items-center gap-1 text-nude-dark underline font-semibold  mt-2 mb-1 hover:text-logo cursor-pointer"
													onClick={() => setShowOtherAddresses((v) => !v)}
												>
													{showOtherAddresses ? (
														<FiChevronUp style={{ strokeWidth: 3 }} />
													) : (
														<FiChevronDown style={{ strokeWidth: 3 }} />
													)}
													<span>
														{showOtherAddresses
															? "Masquer les autres adresses"
															: `Voir mes autres adresses (${adresses.length - 1})`}
													</span>
												</button>
											)}

											{/* Affichage des autres adresses (à partir de la 2ème) */}
											{showOtherAddresses &&
												adresses
													.slice(1) // Prendre toutes les adresses sauf la première
													.map((a) => (
														<label
															key={a.id}
															className="flex items-center gap-3 cursor-pointer"
														>
															<input
																type="radio"
																name="selectedAddress"
																checked={selectedAddressId === a.id}
																onChange={() => setSelectedAddressId(a.id)}
																className="sr-only"
															/>
															<span
																className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedAddressId === a.id ? "bg-nude-dark" : "bg-white"}`}
															/>
															<div className="flex-1 bg-rose-light-2 rounded-2xl shadow-lg border border-nude-dark p-4 max-w-md">
																<div className="flex items-center">
																	<span className="text-sm text-gray-900 mr-2">
																		{a.civility === "MR"
																			? "M."
																			: a.civility === "MME"
																				? "Mme"
																				: ""}
																	</span>
																	<span className="text-gray-900">
																		{a.firstName} {a.lastName}
																	</span>
																</div>
																<div className="text-gray-900">{a.street}</div>
																<div className="text-gray-900">
																	{a.zipCode} {a.city}
																</div>
															</div>
														</label>
													))}
										</div>
									)}
								</div>
							</div>

							{/* Bouton-lien Ajouter une adresse */}
							<button
								className="text-nude-dark underline font-semibold hover:text-logo transition-colors flex items-center gap-1 cursor-pointer"
								onClick={() => {
									setModalForm({
										nom: "",
										prenom: "",
										ligne1: "",
										ligne2: "",
										codePostal: "",
										ville: "",
									});
									setCivility("Mme");
									setShowAddressMenu(!showAddressMenu);
								}}
								type="button"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									className="inline-block"
									style={{ marginRight: "2px", verticalAlign: "middle" }}
									aria-hidden="true"
								>
									<path
										d="M8 3v10M3 8h10"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
								Ajouter une adresse
							</button>

							{/* Formulaire déroulant d'ajout d'adresse */}
							{showAddressMenu && (
								<form
									className="bg-rose-light-2 rounded-2xl shadow-lg border border-nude-dark p-4 mt-2 w-full max-w-md animate-fade-in flex flex-col gap-3"
									onSubmit={async (e) => {
										e.preventDefault();
										const res = await fetch("/api/user/account/address", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												civility,
												lastName: modalForm.nom,
												firstName: modalForm.prenom,
												street: modalForm.ligne1,
												company: modalForm.ligne2,
												zipCode: modalForm.codePostal,
												city: modalForm.ville,
											}),
										});
										const data = await res.json();
										if (!res.ok) {
											toast.error(
												data.error || "Erreur lors de l'ajout de l'adresse"
											);
											return;
										}
										toast.success("Adresse ajoutée avec succès !");
										setShowAddressMenu(false);
										// Recharge les adresses depuis la BDD
										setLoading(true);
										const res2 = await fetch("/api/user/account/address?all=1");
										const data2 = await res2.json();
										const newAddresses = data2.addresses || [];
										setAdresses(newAddresses);

										// Sélectionner automatiquement la première adresse de la liste mise à jour
										if (newAddresses.length > 0) {
											setSelectedAddressId(newAddresses[0].id);
											// Si c'est la première adresse ajoutée, elle sera visible directement
											// Si c'est une adresse supplémentaire, ouvrir la section des autres adresses
											if (newAddresses.length > 1) {
												setShowOtherAddresses(true);
											}
										}

										setLoading(false);
									}}
								>
									<div className="flex gap-4">
										<label className="flex items-center gap-1 text-gray-700 cursor-pointer">
											<input
												type="radio"
												name="civility"
												value="Mme"
												checked={civility === "Mme"}
												onChange={() => setCivility("Mme")}
												className="sr-only"
											/>
											<span
												className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${civility === "Mme" ? "bg-nude-dark" : "bg-white"}`}
											/>
											Mme
										</label>
										<label className="flex items-center gap-1 text-gray-700 cursor-pointer">
											<input
												type="radio"
												name="civility"
												value="M."
												checked={civility === "M."}
												onChange={() => setCivility("M.")}
												className="sr-only"
											/>
											<span
												className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${civility === "M." ? "bg-nude-dark" : "bg-white"}`}
											/>
											M.
										</label>
									</div>
									<div className="flex flex-col sm:flex-row gap-2">
										<input
											className="border rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-[#d9c4b5] focus:outline-none min-w-0"
											placeholder="Nom"
											value={modalForm.nom}
											onChange={(e) =>
												setModalForm((f) => ({ ...f, nom: e.target.value }))
											}
											required
										/>
										<input
											className="border rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-[#d9c4b5] focus:outline-none min-w-0"
											placeholder="Prénom"
											value={modalForm.prenom}
											onChange={(e) =>
												setModalForm((f) => ({ ...f, prenom: e.target.value }))
											}
											required
										/>
									</div>
									<input
										className="border rounded px-2 py-1 focus:ring-2 focus:ring-[#d9c4b5] focus:outline-none"
										placeholder="N° et rue"
										value={modalForm.ligne1}
										onChange={(e) =>
											setModalForm((f) => ({ ...f, ligne1: e.target.value }))
										}
										required
									/>
									<input
										className="border rounded px-2 py-1 focus:ring-2 focus:ring-[#d9c4b5] focus:outline-none"
										placeholder="Complément (optionnel)"
										value={modalForm.ligne2}
										onChange={(e) =>
											setModalForm((f) => ({ ...f, ligne2: e.target.value }))
										}
									/>
									<div className="flex flex-col sm:flex-row gap-2">
										<input
											className="border rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-[#d9c4b5] focus:outline-none min-w-0"
											placeholder="Code postal"
											value={modalForm.codePostal}
											onChange={(e) =>
												setModalForm((f) => ({
													...f,
													codePostal: e.target.value,
												}))
											}
											required
										/>
										<input
											className="border rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-[#d9c4b5] focus:outline-none min-w-0"
											placeholder="Ville"
											value={modalForm.ville}
											onChange={(e) =>
												setModalForm((f) => ({ ...f, ville: e.target.value }))
											}
											required
										/>
									</div>
									<div className="flex gap-2 mt-2">
										<button
											type="submit"
											className="bg-nude-dark text-white px-4 py-2 rounded-2xl font-semibold hover:bg-logo transition-all cursor-pointer"
										>
											Enregistrer
										</button>
										<button
											type="button"
											className="text-nude-dark underline px-4 py-2 cursor-pointer"
											onClick={() => setShowAddressMenu(false)}
										>
											Annuler
										</button>
									</div>
								</form>
							)}

							{/* Affichage des adresses locales ajoutées */}
							{localAddresses.length > 0 && (
								<div className="mt-4 flex flex-col gap-2">
									{localAddresses.map((addr) => (
										<div key={addr.id} className="flex items-center gap-3">
											<span
												className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors bg-nude-dark`}
											/>
											<div className="flex-1 bg-gradient-to-r from-white via-nude-light to-white rounded-2xl shadow-lg border border-nude-dark p-4 max-w-md">
												<div className="text-logo font-semibold flex items-center">
													<span className="text-sm text-gray-900 mr-2">
														{addr.civility === "MR"
															? "M."
															: addr.civility === "MME"
																? "Mme"
																: ""}
													</span>
													<span className="text-gray-900">
														{addr.firstName} {addr.lastName}
													</span>
												</div>
												<div className="text-gray-900">{addr.street}</div>
												<div className="text-gray-900">
													{addr.zipCode} {addr.city}
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Livraison */}
							<div className="bg-rose-light-2 rounded-2xl shadow-lg border border-nude-dark p-6 mb-8 mt-8">
								<h2 className="text-xl sm:text-2xl font-semibold text-nude-dark mb-6">
									Livraison
								</h2>
								<div className="flex flex-col gap-2 sm:gap-3">
									<label className="flex items-center gap-2 text-gray-700 cursor-pointer">
										<input
											type="radio"
											name="delivery"
											value="domicile"
											checked={selectedDelivery === "domicile"}
											onChange={() => setSelectedDelivery("domicile")}
											className="sr-only"
										/>
										<span
											className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedDelivery === "domicile" ? "bg-nude-dark" : "bg-white"}`}
										></span>
										<span>À domicile (Colissimo)</span>
									</label>
									<label className="flex items-center gap-2 text-gray-700 cursor-pointer">
										<input
											type="radio"
											name="delivery"
											value="relay"
											checked={selectedDelivery === "relay"}
											onChange={() => setSelectedDelivery("relay")}
											className="sr-only"
										/>
										<span
											className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedDelivery === "relay" ? "bg-nude-dark" : "bg-white"}`}
										></span>
										<span>Point relais (Mondial Relay)</span>
									</label>
									<label className="flex items-center gap-2 text-gray-700 cursor-pointer">
										<input
											type="radio"
											name="delivery"
											value="chronopost"
											checked={selectedDelivery === "chronopost"}
											onChange={() => setSelectedDelivery("chronopost")}
											className="sr-only"
										/>
										<span
											className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedDelivery === "chronopost" ? "bg-nude-dark" : "bg-white"}`}
										></span>
										<span>Livraison express (Chronopost)</span>
									</label>
									{selectedDelivery === "relay" && (
										<div className="ml-6 mt-2 text-xs text-gray-500">
											(Sélection du point relais à venir)
										</div>
									)}
									{selectedDelivery === "chronopost" && (
										<div className="ml-6 mt-2 text-xs text-blue-600">
											Livraison en 24h - Frais supplémentaires de 8,90€
										</div>
									)}
								</div>
							</div>

							{/* Paiement */}
							<div className="bg-rose-light-2 rounded-2xl shadow-lg border border-nude-dark p-6 mb-8 mt-8">
								<h2 className="text-xl sm:text-2xl font-semibold text-nude-dark mb-6">
									Paiement
								</h2>
								<div className="flex flex-col gap-2 sm:gap-3">
									<label className="flex items-center gap-2 text-gray-700 cursor-pointer">
										<input
											type="radio"
											name="payment"
											value="stripe"
											checked={selectedPayment === "stripe"}
											onChange={() => setSelectedPayment("stripe")}
											className="sr-only"
										/>
										<span
											className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedPayment === "stripe" ? "bg-nude-dark" : "bg-white"}`}
										></span>
										<span className="flex items-center gap-1">
											Carte bancaire (Stripe)
											<FaCcVisa className="text-blue-600 text-lg" />
											<FaCcMastercard className="text-orange-600 text-lg" />
										</span>
									</label>
									{selectedPayment === "stripe" && (
										<div className="ml-6 mt-2 text-xs text-blue-600">
											Paiement sécurisé via Stripe
										</div>
									)}
									<label className="flex items-center gap-2 text-gray-700 cursor-pointer">
										<input
											type="radio"
											name="payment"
											value="paypal"
											checked={selectedPayment === "paypal"}
											onChange={() => setSelectedPayment("paypal")}
											className="sr-only"
										/>
										<span
											className={`w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center transition-colors ${selectedPayment === "paypal" ? "bg-nude-dark" : "bg-white"}`}
										></span>
										<span className="flex items-center gap-1">
											Paypal <FaCcPaypal className="text-blue-500 text-lg" />
										</span>
									</label>
									{selectedPayment === "paypal" && (
										<div className="ml-6 mt-2 text-xs text-blue-600">
											Redirection vers Paypal à la validation…
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
					{/* Résumé de commande */}
					<div className="w-full lg:w-[40%]">
						<div className="bg-nude-light rounded-2xl shadow-lg p-6 sticky top-6">
							<h2 className="text-2xl font-semibold text-nude-dark mb-6">
								Résumé de commande
							</h2>
							{/* Détails des prix */}
							<div className="space-y-4 mb-6">
								<div className="flex flex-col gap-3 mb-4">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-3 border-b pb-2 last:border-b-0 last:pb-0"
										>
											<img
												src={item.image}
												alt={item.name}
												className="w-12 h-12 object-cover rounded"
											/>
											<div className="flex-1">
												<div className="text-base font-medium">{item.name}</div>
												<div className="text-sm text-gray-500">
													{item.color} - Taille {item.size} - Qté:{" "}
													{item.quantity}
												</div>
											</div>
											<div className="flex flex-col items-end gap-1">
												{item.promoPercentage ? (
													<>
														<div className="flex items-center gap-2">
															<span className="text-sm font-semibold">
																{(item.price * item.quantity).toFixed(2)} €
															</span>
															<span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded">
																-{item.promoPercentage}%
															</span>
														</div>
														<span className="text-xs text-gray-400 line-through">
															{item.originalPrice
																? (item.originalPrice * item.quantity).toFixed(2)
																: ""}{" "}
															€
														</span>
													</>
												) : (
													<div className="text-sm font-semibold">
														{(item.price * item.quantity).toFixed(2)} €
													</div>
												)}
											</div>
										</div>
									))}
								</div>
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

								{/* Réduction promo */}
								{promoApplied && promoDiscount > 0 && (
									<div className="flex justify-between text-green-600">
										<span>Réduction promo</span>
										<span className="font-medium">
											-{promoDiscount.toFixed(2)}€
										</span>
									</div>
								)}

								{/* Code promo */}
								<div className="border-t border-gray-300 pt-4">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-gray-600 text-sm">Code promo</span>
										<span className="text-xs text-gray-400">(optionnel)</span>
									</div>

									{/* Code appliqué */}
									{promoApplied && appliedPromoCode && (
										<div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
											<div className="flex items-center justify-between">
												<div>
													<div className="text-sm font-medium text-green-800">
														Code {appliedPromoCode.code} appliqué
													</div>
													<div className="text-xs text-green-600">
														Réduction : {promoDiscount.toFixed(2)}€
													</div>
												</div>
												<button
													type="button"
													onClick={() => {
														setPromoApplied(false);
														setPromoDiscount(0);
														setAppliedPromoCode(null);
														setPromoCode("");
														setPromoError("");
													}}
													className="text-red-600 hover:text-red-800 text-sm"
												>
													Supprimer
												</button>
											</div>
										</div>
									)}

									{/* Message d'erreur */}
									{promoError && (
										<div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
											<div className="text-sm text-red-800">{promoError}</div>
										</div>
									)}

									{/* Formulaire code promo */}
									{!promoApplied && (
										<div className="flex flex-col sm:flex-row gap-2">
											<input
												type="text"
												placeholder="Entrez votre code"
												value={promoCode}
												onChange={(e) => {
													setPromoCode(e.target.value.toUpperCase());
													setPromoError("");
												}}
												onKeyPress={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														if (promoCode.trim() && !promoLoading) {
															applyPromoCode();
														}
													}
												}}
												className="flex-1 max-w-xs md:max-w-sm border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b49982]"
												maxLength={20}
												disabled={promoLoading}
											/>
											<button
												type="button"
												onClick={applyPromoCode}
												disabled={!promoCode.trim() || promoLoading}
												style={{
													cursor:
														!promoCode.trim() || promoLoading
															? "not-allowed"
															: "pointer",
												}}
												className="bg-nude-dark text-white px-4 py-2 rounded-lg text-sm font-medium border-2 hover:bg-rose-dark hover:text-nude-dark hover:border-nude-dark transition-colors duration-200 disabled:opacity-50 whitespace-nowrap max-w-xs md:max-w-sm"
											>
												{promoLoading ? "..." : "Appliquer"}
											</button>
										</div>
									)}
								</div>
								{livraison > 0 && selectedDelivery !== "chronopost" && (
									<div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
										🎉 Plus que {(50 - (subtotalHT + tva)).toFixed(2)}€ pour la
										livraison gratuite !
									</div>
								)}
								<div className="border-t border-gray-300 pt-4">
									<div className="flex justify-between text-xl font-semibold text-logo">
										<span>Total TTC</span>
										<span>{totalTTC.toFixed(2)}€</span>
									</div>
								</div>
							</div>

							{/* Newsletter subscription */}
							<div className="border-t border-gray-300 pt-4 mb-4">
								<label className="flex items-start gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={subscribeNewsletter}
										onChange={(e) => setSubscribeNewsletter(e.target.checked)}
										className="sr-only"
									/>
									<span
										className={`w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
											subscribeNewsletter
												? "bg-nude-dark border-nude-dark"
												: "bg-white"
										}`}
									>
										{subscribeNewsletter && (
											<svg
												className="w-3 h-3 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={3}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</span>
									<div>
										<div className="font-medium text-nude-dark text-sm">
											Recevoir nos offres exclusives
										</div>
										<div className="text-gray-500 mt-1 text-xs">
											Restez informée de nos nouveautés, promotions et conseils
											mode. Vous pouvez vous désabonner à tout moment.
										</div>
									</div>
								</label>
							</div>

							{/* Boutons d'action */}
							<div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-4">
								<button
									className={`flex-1 max-w-xs sm:max-w-sm py-3 px-6 rounded-2xl text-base font-semibold transition-all duration-300 text-center cursor-pointer
    ${selectedPayment === "paypal" ? "bg-[#0750B4] hover:bg-[#063a80] text-white" : selectedPayment === "stripe" ? "bg-[#635BFF] hover:bg-[#0A2540] text-white" : "bg-nude-dark border-2 text-white hover:bg-rose-dark hover:text-nude-dark hover:border-nude-dark"}`}
									onClick={async () => {
										if (!selectedAddressId) {
											toast.error(
												"Merci de sélectionner votre adresse de livraison."
											);
											return;
										}
										if (!selectedPayment) {
											toast.error("Merci de choisir un mode de paiement.");
											return;
										}

										setLoading(true);

										try {
											// Si paiement Stripe, créer une session Stripe Checkout
											if (selectedPayment === "stripe") {
												const orderData = {
													cartItems,
													selectedAddressId,
													selectedDelivery,
													promoCodeId: appliedPromoCode?.id || null,
													promoDiscount,
													subtotal: subtotalHT,
													shippingCost: livraison,
													taxAmount: tva,
													total: totalTTC,
													subscribeNewsletter,
												};

												const response = await fetch(
													"/api/stripe/checkout-session",
													{
														method: "POST",
														headers: {
															"Content-Type": "application/json",
														},
														body: JSON.stringify(orderData),
													}
												);

												const data = await response.json();

												if (response.ok && data.url) {
													// Rediriger vers Stripe Checkout
													window.location.href = data.url;
												} else {
													toast.error(
														data.error ||
															"Erreur lors de la création de la session de paiement"
													);
													setLoading(false);
												}
												return;
											}

											// Simuler un délai de traitement du paiement pour les autres méthodes
											await new Promise((resolve) => setTimeout(resolve, 2000));

											// Créer la commande via l'API pour les autres méthodes
											const orderData = {
												cartItems,
												selectedAddressId,
												selectedDelivery,
												selectedPayment,
												promoCodeId: appliedPromoCode?.id || null,
												promoDiscount,
												subtotal: subtotalHT,
												shippingCost: livraison,
												taxAmount: tva,
												total: totalTTC,
												subscribeNewsletter,
											};

											const response = await fetch("/api/orders", {
												method: "POST",
												headers: {
													"Content-Type": "application/json",
												},
												body: JSON.stringify(orderData),
											});

											let result;
											try {
												result = await response.json();
											} catch (jsonError) {
												console.error("Erreur de parsing JSON:", jsonError);
												const textResponse = await response.text();
												console.error("Réponse serveur:", textResponse);
												throw new Error("Erreur serveur: réponse invalide");
											}

											if (response.ok) {
												toast.success(
													<div>
														<div className="font-semibold">
															Commande #{result.orderNumber} confirmée !
														</div>
														<div className="text-sm opacity-90">
															Vous allez recevoir un email de confirmation.
														</div>
														<div className="text-sm opacity-90">
															Redirection vers vos commandes...
														</div>
													</div>
												);
												clearCart(); // Vider le panier après la commande réussie

												// Rediriger vers une page de confirmation
												setTimeout(() => {
													router.push(
														`/orders?success=true&orderNumber=${result.orderNumber}`
													);
												}, 2000);
											} else {
												toast.error(
													result.error ||
														"Erreur lors de la création de la commande"
												);
											}
										} catch (error) {
											console.error("Erreur lors du paiement:", error);
											toast.error("Erreur lors du traitement du paiement");
										} finally {
											setLoading(false);
										}
									}}
									disabled={loading}
								>
									{loading ? (
										<div className="flex items-center justify-center gap-2">
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Traitement...
										</div>
									) : selectedPayment === "paypal" ? (
										"Payer avec Paypal"
									) : selectedPayment === "stripe" ? (
										"Payer avec Stripe"
									) : (
										"Payer"
									)}
								</button>
								<button
									className="flex-1 max-w-xs sm:max-w-sm py-3 px-6 rounded-2xl ring-1 ring-nude-dark text-nude-dark font-semibold bg-nude-light hover:bg-nude-dark hover:text-nude-light hover:border-nude-light transition-all duration-300 text-center cursor-pointer"
									onClick={() => router.push("/allProducts")}
									type="button"
								>
									Continuer mes achats
								</button>
							</div>

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
									<span>Livraison gratuite dès 69€</span>
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
									<span>Retours possibles sous 15 jours</span>
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
			</main>
		</div>
	);
}
