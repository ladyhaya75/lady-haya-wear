"use client";

import Loader from "@/components/Loader";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface Subscriber {
	id: string;
	email: string;
	name?: string;
	subscribedAt: string;
	isActive: boolean;
}

interface NewsletterCampaign {
	id: string;
	subject: string;
	content: string;
	recipientCount: number;
	sentCount: number;
	failedCount: number;
	status: "DRAFT" | "SENDING" | "SENT" | "FAILED";
	createdAt: string;
	sentAt?: string;
	updatedAt: string;
}

export default function NewsletterManagement() {
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"campaigns" | "subscribers" | "create" | "history"
	>("campaigns");
	const [cleanupInfo, setCleanupInfo] = useState<{
		campaignsToDelete: number;
		cutoffDate: string;
	} | null>(null);

	// État pour créer une nouvelle campagne
	const [newCampaign, setNewCampaign] = useState({
		subject: "",
		content: "",
		type: "general" as "general" | "promo" | "new_product",
		scheduleDate: "",
	});
	const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
	const typeMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchData();
		fetchCleanupInfo();
	}, []);

	// Fermeture du menu de type au clic extérieur
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				typeMenuRef.current &&
				!typeMenuRef.current.contains(event.target as Node)
			) {
				setIsTypeMenuOpen(false);
			}
		};

		if (isTypeMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isTypeMenuOpen]);

	const fetchData = async () => {
		try {
			const [subscribersRes, campaignsRes] = await Promise.all([
				fetch("/api/admin/newsletter/subscribers"),
				fetch("/api/admin/newsletter/campaigns"),
			]);

			if (subscribersRes.ok) {
				const subscribersData = await subscribersRes.json();
				setSubscribers(subscribersData);
			}

			if (campaignsRes.ok) {
				const campaignsData = await campaignsRes.json();
				setCampaigns(campaignsData.campaigns || []);
			}
		} catch (error) {
			console.error("Erreur lors du chargement:", error);
			toast.error("Erreur lors du chargement des données");
		} finally {
			setLoading(false);
		}
	};

	const sendCampaign = async (campaignId?: string) => {
		try {
			const payload = campaignId ? { campaignId } : newCampaign;
			const response = await fetch("/api/admin/newsletter/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				toast.success("Newsletter envoyée avec succès !");
				if (!campaignId) {
					// Reset form si c'est une nouvelle campagne
					setNewCampaign({
						subject: "",
						content: "",
						type: "general",
						scheduleDate: "",
					});
				}
				fetchData();
			} else {
				throw new Error("Erreur lors de l'envoi");
			}
		} catch (error) {
			console.error("Erreur:", error);
			toast.error("Erreur lors de l'envoi de la newsletter");
		}
	};

	const saveDraft = async () => {
		try {
			const response = await fetch("/api/admin/newsletter/campaigns", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...newCampaign, status: "draft" }),
			});

			if (response.ok) {
				toast.success("Brouillon sauvegardé !");
				fetchData();
			}
		} catch (error) {
			console.error("Erreur:", error);
			toast.error("Erreur lors de la sauvegarde");
		}
	};

	const removeSubscriber = async (subscriberId: string) => {
		try {
			const response = await fetch(
				`/api/admin/newsletter/subscribers/${subscriberId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				toast.success("Abonné supprimé");
				fetchData();
			}
		} catch (error) {
			console.error("Erreur:", error);
			toast.error("Erreur lors de la suppression");
		}
	};

	const fetchCleanupInfo = async () => {
		try {
			const response = await fetch("/api/admin/newsletter/cleanup");
			if (response.ok) {
				const data = await response.json();
				setCleanupInfo(data);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des infos de nettoyage:", error);
		}
	};

	const performCleanup = async () => {
		if (!cleanupInfo || cleanupInfo.campaignsToDelete === 0) {
			toast.info("Aucune campagne ancienne à supprimer");
			return;
		}

		if (
			!confirm(
				`Êtes-vous sûr de vouloir supprimer ${cleanupInfo.campaignsToDelete} campagnes de plus de 6 mois ?`
			)
		) {
			return;
		}

		try {
			const response = await fetch("/api/admin/newsletter/cleanup", {
				method: "POST",
			});

			if (response.ok) {
				const data = await response.json();
				toast.success(data.message);
				fetchData(); // Recharger les données
				fetchCleanupInfo(); // Recharger les infos de nettoyage
			} else {
				throw new Error("Erreur lors du nettoyage");
			}
		} catch (error) {
			console.error("Erreur:", error);
			toast.error("Erreur lors du nettoyage des campagnes");
		}
	};

	const getTemplateContent = (type: string) => {
		const templates = {
			promo: {
				subject: "🎉 Offre spéciale Lady Haya Wear !",
				content: `Chère cliente,

Nous avons une offre exceptionnelle pour vous !

[DÉTAILS DE LA PROMOTION]

Profitez de cette offre limitée dans le temps.

Cordialement,
L'équipe Lady Haya Wear`,
			},
			new_product: {
				subject: "✨ Nouvelle collection disponible !",
				content: `Chère cliente,

Découvrez notre nouvelle collection qui vient d'arriver !

[DÉTAILS DES NOUVEAUX PRODUITS]

Soyez parmi les premières à découvrir nos dernières créations.

Cordialement,
L'équipe Lady Haya Wear`,
			},
			general: {
				subject: "Newsletter Lady Haya Wear",
				content: `Chère cliente,

[VOTRE MESSAGE PERSONNALISÉ]

Merci de votre fidélité.

Cordialement,
L'équipe Lady Haya Wear`,
			},
		};
		return templates[type as keyof typeof templates];
	};

	const applyTemplate = (type: "general" | "promo" | "new_product") => {
		const template = getTemplateContent(type);
		setNewCampaign((prev) => ({
			...prev,
			subject: template.subject,
			content: template.content,
			type: type,
		}));
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="p-1 sm:p-6 space-y-2 sm:space-y-6">
			<div className="mb-4 sm:mb-8">
				<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-logo mb-2">
					Gestion Newsletter
				</h1>
				<p className="text-nude-dark text-sm sm:text-base">
					Gérez vos campagnes d'emailing et vos abonnés
				</p>
			</div>

			{/* Statistiques rapides */}
			<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-8">
				<div className="bg-white rounded-lg p-3 sm:p-6 shadow-md border border-rose-light w-full sm:w-64">
					<h3 className="text-sm sm:text-lg font-semibold text-logo mb-2">
						Abonnés actifs
					</h3>
					<p className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-dark">
						{subscribers.filter((s) => s.isActive).length}
					</p>
				</div>
				<div className="bg-white rounded-lg p-3 sm:p-6 shadow-md border border-rose-light w-full sm:w-64">
					<h3 className="text-sm sm:text-lg font-semibold text-logo mb-2">
						Campagnes envoyées
					</h3>
					<p className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-dark">
						{campaigns.filter((c) => c.status === "SENT").length}
					</p>
				</div>
				<div className="bg-white rounded-lg p-3 sm:p-6 shadow-md border border-rose-light w-full sm:w-64">
					<h3 className="text-sm sm:text-lg font-semibold text-logo mb-2">
						Emails envoyés
					</h3>
					<p className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-dark">
						{campaigns.reduce((total, c) => total + c.sentCount, 0)}
					</p>
				</div>
			</div>

			{/* Onglets */}
			<div className="mb-4 sm:mb-6">
				<nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 overflow-x-auto">
					{[
						{ id: "campaigns", label: "Campagnes" },
						{ id: "create", label: "Créer une campagne" },
						{ id: "history", label: "Historique" },
						{ id: "subscribers", label: "Abonnés" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as any)}
							className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap ${
								activeTab === tab.id
									? "border-logo text-logo"
									: "border-transparent text-nude-dark hover:text-logo hover:border-rose-light"
							}`}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			{/* Contenu des onglets */}
			{activeTab === "campaigns" && (
				<div className="bg-white rounded-lg shadow-md -mx-1 sm:mx-0">
					<div className="p-2 sm:p-6">
						<h2 className="text-lg sm:text-xl font-semibold text-logo mb-4">
							Historique des campagnes
						</h2>
						<div className="space-y-2 sm:space-y-4">
							{campaigns.length === 0 ? (
								<p className="text-nude-dark text-center py-6 sm:py-8 text-sm sm:text-base">
									Aucune campagne pour le moment
								</p>
							) : (
								campaigns.map((campaign) => (
									<div
										key={campaign.id}
										className="border border-rose-light rounded-lg p-2 sm:p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-logo text-sm sm:text-base truncate">
													{campaign.subject}
												</h3>
												<p className="text-xs sm:text-sm text-nude-dark mt-1">
													{campaign.recipientCount} destinataires
												</p>
												{campaign.sentAt && (
													<p className="text-xs text-nude-dark-2 mt-1">
														Envoyé le{" "}
														{new Date(campaign.sentAt).toLocaleDateString(
															"fr-FR"
														)}
													</p>
												)}
											</div>
											<div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														campaign.status === "SENT"
															? "bg-green-100 text-green-800"
															: campaign.status === "FAILED"
																? "bg-red-100 text-red-800"
																: campaign.status === "SENDING"
																	? "bg-blue-100 text-blue-800"
																	: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{campaign.status === "SENT"
														? "Envoyé"
														: campaign.status === "FAILED"
															? "Échec"
															: campaign.status === "SENDING"
																? "En cours"
																: "Brouillon"}
												</span>
												{campaign.status === "DRAFT" && (
													<button
														onClick={() => sendCampaign(campaign.id)}
														className="px-2 sm:px-3 py-1 bg-logo text-white rounded text-xs sm:text-sm hover:bg-nude-dark transition-colors cursor-pointer"
													>
														Envoyer
													</button>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			)}

			{activeTab === "create" && (
				<div className="bg-white rounded-lg shadow-md -mx-1 sm:mx-0">
					<div className="p-2 sm:p-6">
						<h2 className="text-lg sm:text-xl font-semibold text-logo mb-4">
							Créer une nouvelle campagne
						</h2>

						{/* Templates rapides */}
						<div className="mb-4 sm:mb-6">
							<h3 className="text-base sm:text-lg font-medium text-nude-dark mb-3">
								Templates rapides
							</h3>
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
								<button
									onClick={() => applyTemplate("promo")}
									className="px-3 sm:px-4 py-2 border border-rose-light rounded-lg hover:bg-rose-light transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto"
								>
									🎉 Promotion
								</button>
								<button
									onClick={() => applyTemplate("new_product")}
									className="px-3 sm:px-4 py-2 border border-rose-light rounded-lg hover:bg-rose-light transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto"
								>
									✨ Nouveau produit
								</button>
								<button
									onClick={() => applyTemplate("general")}
									className="px-3 sm:px-4 py-2 border border-rose-light rounded-lg hover:bg-rose-light transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto"
								>
									📧 Général
								</button>
							</div>
						</div>

						<div className="space-y-3 sm:space-y-4">
							<div>
								<label className="block text-xs sm:text-sm font-medium text-nude-dark mb-1">
									Objet de l'email
								</label>
								<input
									type="text"
									value={newCampaign.subject}
									onChange={(e) =>
										setNewCampaign((prev) => ({
											...prev,
											subject: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-rose-light rounded-lg focus-ring-logo text-sm sm:text-base"
									placeholder="Entrez l'objet de votre email..."
								/>
							</div>

							<div>
								<label className="block text-xs sm:text-sm font-medium text-nude-dark mb-1">
									Type de campagne
								</label>
								<div className="relative" ref={typeMenuRef}>
									<button
										type="button"
										onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
										className="w-full px-3 py-2 border border-rose-light rounded-lg focus-ring-logo cursor-pointer text-left flex items-center justify-between text-sm sm:text-base"
									>
										<span className="text-nude-dark">
											{newCampaign.type === "general"
												? "Général"
												: newCampaign.type === "promo"
													? "Promotion"
													: "Nouveau produit"}
										</span>
										<svg
											className={`w-5 h-5 text-nude-dark transition-transform duration-200 ${
												isTypeMenuOpen ? "rotate-180" : ""
											}`}
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

									{/* Menu déroulant */}
									{isTypeMenuOpen && (
										<div className="absolute z-50 w-full mt-2 bg-white border border-rose-light rounded-lg shadow-lg">
											<button
												type="button"
												onClick={() => {
													setNewCampaign((prev) => ({
														...prev,
														type: "general" as const,
													}));
													setIsTypeMenuOpen(false);
												}}
												className={`w-full px-3 py-2 text-left hover:bg-rose-light transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${
													newCampaign.type === "general"
														? "bg-rose-light text-logo font-medium"
														: "text-nude-dark"
												}`}
											>
												📧 Général
											</button>
											<button
												type="button"
												onClick={() => {
													setNewCampaign((prev) => ({
														...prev,
														type: "promo" as const,
													}));
													setIsTypeMenuOpen(false);
												}}
												className={`w-full px-3 py-2 text-left hover:bg-rose-light transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${
													newCampaign.type === "promo"
														? "bg-rose-light text-logo font-medium"
														: "text-nude-dark"
												}`}
											>
												🎉 Promotion
											</button>
											<button
												type="button"
												onClick={() => {
													setNewCampaign((prev) => ({
														...prev,
														type: "new_product" as const,
													}));
													setIsTypeMenuOpen(false);
												}}
												className={`w-full px-3 py-2 text-left hover:bg-rose-light transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${
													newCampaign.type === "new_product"
														? "bg-rose-light text-logo font-medium"
														: "text-nude-dark"
												}`}
											>
												✨ Nouveau produit
											</button>
										</div>
									)}

									{/* Overlay pour fermer le menu en cliquant ailleurs */}
									{isTypeMenuOpen && (
										<div
											className="fixed inset-0 z-40"
											onClick={() => setIsTypeMenuOpen(false)}
										/>
									)}
								</div>
							</div>

							<div>
								<label className="block text-xs sm:text-sm font-medium text-nude-dark mb-1">
									Contenu de l'email
								</label>
								<textarea
									value={newCampaign.content}
									onChange={(e) =>
										setNewCampaign((prev) => ({
											...prev,
											content: e.target.value,
										}))
									}
									rows={8}
									className="w-full px-3 py-2 border border-rose-light rounded-lg focus-ring-logo text-sm sm:text-base resize-none"
									placeholder="Rédigez votre message..."
								/>
							</div>

							<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
								<button
									onClick={saveDraft}
									className="px-4 sm:px-6 py-2 border border-logo text-logo rounded-lg hover:bg-rose-light transition-colors cursor-pointer text-sm sm:text-base"
								>
									Sauvegarder brouillon
								</button>
								<button
									onClick={() => sendCampaign()}
									className="px-4 sm:px-6 py-2 bg-logo text-white rounded-lg hover:bg-nude-dark transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base"
									disabled={!newCampaign.subject || !newCampaign.content}
								>
									Envoyer maintenant
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === "subscribers" && (
				<div className="bg-white rounded-lg shadow-md -mx-1 sm:mx-0">
					<div className="p-2 sm:p-6">
						<h2 className="text-lg sm:text-xl font-semibold text-logo mb-4">
							Liste des abonnés
						</h2>
						<div className="overflow-x-auto">
							{/* Version mobile : cartes */}
							<div className="block sm:hidden space-y-2">
								{subscribers.length === 0 ? (
									<p className="text-nude-dark text-center py-6 text-sm">
										Aucun abonné pour le moment
									</p>
								) : (
									subscribers.map((subscriber) => (
										<div
											key={subscriber.id}
											className="border border-rose-light rounded-lg p-3 space-y-2"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm truncate">
														{subscriber.email}
													</p>
													{subscriber.name && (
														<p className="text-xs text-nude-dark">
															{subscriber.name}
														</p>
													)}
												</div>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
														subscriber.isActive
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{subscriber.isActive ? "Actif" : "Inactif"}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<p className="text-xs text-nude-dark">
													{new Date(subscriber.subscribedAt).toLocaleDateString(
														"fr-FR"
													)}
												</p>
												<button
													onClick={() => removeSubscriber(subscriber.id)}
													className="text-red-600 hover:text-red-800 text-xs cursor-pointer"
												>
													Supprimer
												</button>
											</div>
										</div>
									))
								)}
							</div>

							{/* Version desktop : tableau */}
							<div className="hidden sm:block">
								<table className="min-w-full">
									<thead>
										<tr className="border-b border-rose-light">
											<th className="text-left py-2 text-nude-dark font-medium text-sm">
												Email
											</th>
											<th className="text-left py-2 text-nude-dark font-medium text-sm">
												Nom
											</th>
											<th className="text-left py-2 text-nude-dark font-medium text-sm">
												Date d'inscription
											</th>
											<th className="text-left py-2 text-nude-dark font-medium text-sm">
												Statut
											</th>
											<th className="text-left py-2 text-nude-dark font-medium text-sm">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{subscribers.map((subscriber) => (
											<tr
												key={subscriber.id}
												className="border-b border-rose-light/50"
											>
												<td className="py-3 text-sm">{subscriber.email}</td>
												<td className="py-3 text-sm">
													{subscriber.name || "-"}
												</td>
												<td className="py-3 text-sm">
													{new Date(subscriber.subscribedAt).toLocaleDateString(
														"fr-FR"
													)}
												</td>
												<td className="py-3">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															subscriber.isActive
																? "bg-green-100 text-green-800"
																: "bg-red-100 text-red-800"
														}`}
													>
														{subscriber.isActive ? "Actif" : "Inactif"}
													</span>
												</td>
												<td className="py-3">
													<button
														onClick={() => removeSubscriber(subscriber.id)}
														className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
													>
														Supprimer
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{subscribers.length === 0 && (
									<p className="text-nude-dark text-center py-8 text-sm">
										Aucun abonné pour le moment
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === "history" && (
				<div className="bg-white rounded-lg shadow-md -mx-1 sm:mx-0">
					<div className="p-2 sm:p-6">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
							<h2 className="text-lg sm:text-xl font-semibold text-logo">
								Historique des campagnes
							</h2>

							{/* Section nettoyage */}
							{cleanupInfo && (
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
									{cleanupInfo.campaignsToDelete > 0 ? (
										<>
											<span className="text-xs sm:text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
												{cleanupInfo.campaignsToDelete} campagnes anciennes (6+
												mois)
											</span>
											<button
												onClick={performCleanup}
												className="px-3 py-1 bg-red-500 text-white rounded text-xs sm:text-sm hover:bg-red-600 transition-colors cursor-pointer"
											>
												🧹 Nettoyer
											</button>
										</>
									) : (
										<span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
											✅ Historique propre
										</span>
									)}
								</div>
							)}
						</div>
						<div className="space-y-2 sm:space-y-4">
							{campaigns.length === 0 ? (
								<p className="text-nude-dark text-center py-6 sm:py-8 text-sm sm:text-base">
									Aucune campagne envoyée pour le moment
								</p>
							) : (
								campaigns.map((campaign) => (
									<div
										key={campaign.id}
										className="border border-rose-light rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-logo text-sm sm:text-base mb-2">
													{campaign.subject}
												</h3>
												<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm text-nude-dark">
													<div>
														<span className="font-medium">Destinataires:</span>
														<br />
														{campaign.recipientCount}
													</div>
													<div>
														<span className="font-medium">Envoyés:</span>
														<br />
														<span className="text-green-600">
															{campaign.sentCount}
														</span>
													</div>
													<div>
														<span className="font-medium">Échecs:</span>
														<br />
														<span className="text-red-600">
															{campaign.failedCount}
														</span>
													</div>
													<div>
														<span className="font-medium">Taux de succès:</span>
														<br />
														<span className="font-semibold">
															{campaign.recipientCount > 0
																? Math.round(
																		(campaign.sentCount /
																			campaign.recipientCount) *
																			100
																	)
																: 0}
															%
														</span>
													</div>
												</div>
												{campaign.sentAt && (
													<p className="text-xs text-nude-dark-2 mt-2">
														Envoyé le{" "}
														{new Date(campaign.sentAt).toLocaleDateString(
															"fr-FR",
															{
																year: "numeric",
																month: "long",
																day: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</p>
												)}
											</div>
											<div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														campaign.status === "SENT"
															? "bg-green-100 text-green-800"
															: campaign.status === "FAILED"
																? "bg-red-100 text-red-800"
																: campaign.status === "SENDING"
																	? "bg-blue-100 text-blue-800"
																	: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{campaign.status === "SENT"
														? "Envoyé"
														: campaign.status === "FAILED"
															? "Échec"
															: campaign.status === "SENDING"
																? "En cours"
																: "Brouillon"}
												</span>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
