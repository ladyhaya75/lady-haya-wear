"use client";

import NotificationBadge from "@/components/Dashboard/NotificationBadge";
import StatsCard from "@/components/Dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { sanityClientNoCache } from "@/lib/sanity";
import dynamic from "next/dynamic";

// ✅ Lazy load du graphique (lourd)
const SalesChart = dynamic(() => import("@/components/Dashboard/SalesChart"), {
	ssr: false,
	loading: () => (
		<div className="h-80 bg-nude-light animate-pulse rounded-xl flex items-center justify-center">
			<p className="text-nude-dark">Chargement du graphique...</p>
		</div>
	),
});
import {
	AlertTriangle,
	Edit3,
	ExternalLink,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LowStockProduct {
	_id: string;
	name: string;
	colors: Array<{
		name: string;
		sizes: Array<{
			size: string;
			quantity: number;
		}>;
	}>;
}

export default function DashboardPage() {
	const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
		[]
	);
	const [loading, setLoading] = useState(true);

	// Charger les produits avec stock faible
	useEffect(() => {
		const fetchLowStockProducts = async () => {
			try {
				const products = await sanityClientNoCache.fetch(`
					*[_type == "productUnified"] {
						_id,
						name,
						colors[] {
							name,
							sizes[] {
								size,
								quantity
							}
						}
					}
				`);

				// Filtrer les produits avec stock faible ou rupture (quantité <= 5)
				const lowStock = products.filter((product: LowStockProduct) =>
					product.colors.some((color) =>
						color.sizes.some((size) => size.quantity >= 0 && size.quantity <= 5)
					)
				);

				setLowStockProducts(lowStock);
			} catch (error) {
				console.error(
					"Erreur lors du chargement des produits en stock faible:",
					error
				);
			} finally {
				setLoading(false);
			}
		};

		fetchLowStockProducts();
	}, []);

	// Données de test pour les statistiques
	const stats = [
		{
			title: "Utilisateurs totaux",
			value: "1,234",
			description: "Utilisateurs inscrits",
			icon: Users,
			trend: { value: 12, isPositive: true },
		},
		{
			title: "Produits en vente",
			value: "89",
			description: "Produits disponibles",
			icon: ShoppingCart,
			trend: { value: 5, isPositive: true },
		},
		{
			title: "Commandes ce mois",
			value: "156",
			description: "Commandes traitées",
			icon: Package,
			trend: { value: 8, isPositive: true },
		},
		{
			title: "Chiffre d'affaires",
			value: "€12,450",
			description: "Ce mois-ci",
			icon: TrendingUp,
			trend: { value: 15, isPositive: true },
		},
	];

	// Données de test pour le graphique des ventes
	const salesData = [
		{ period: "Jan", sales: 1200, salesNormal: 1200, salesHigh: 0 },
		{ period: "Fév", sales: 1800, salesNormal: 0, salesHigh: 1800 },
		{ period: "Mar", sales: 1400, salesNormal: 1400, salesHigh: 0 },
		{ period: "Avr", sales: 2200, salesNormal: 0, salesHigh: 2200 },
		{ period: "Mai", sales: 1900, salesNormal: 0, salesHigh: 1900 },
		{ period: "Juin", sales: 2500, salesNormal: 0, salesHigh: 2500 },
		{ period: "Juil", sales: 2100, salesNormal: 0, salesHigh: 2100 },
		{ period: "Août", sales: 2800, salesNormal: 0, salesHigh: 2800 },
		{ period: "Sep", sales: 2400, salesNormal: 0, salesHigh: 2400 },
		{ period: "Oct", sales: 3200, salesNormal: 0, salesHigh: 3200 },
		{ period: "Nov", sales: 2900, salesNormal: 0, salesHigh: 2900 },
		{ period: "Déc", sales: 3500, salesNormal: 0, salesHigh: 3500 },
	];

	return (
		<div className="space-y-6">
			{/* En-tête */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-logo">Tableau de bord</h1>
					<p className="text-nude-dark mt-2">
						Vue d'ensemble de votre boutique Lady Haya Wear
					</p>
				</div>

				{/* Actions rapides */}
				<div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
					<Link
						href="/studio"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 bg-nude-dark text-white px-4 py-2 rounded-lg hover:bg-nude-medium transition-colors text-sm font-medium"
					>
						<Edit3 className="w-4 h-4" />
						Studio Sanity
						<ExternalLink className="w-3 h-3" />
					</Link>
				</div>
			</div>

			{/* Cartes de statistiques */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				{stats.map((stat, index) => (
					<StatsCard
						key={index}
						title={stat.title}
						value={stat.value}
						description={stat.description}
						icon={stat.icon}
						trend={stat.trend}
					/>
				))}
			</div>

			{/* Alertes de stock faible */}
			{lowStockProducts.length > 0 && (
				<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-6">
					<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
						<div className="flex items-center gap-2">
							<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
							<h3 className="text-base sm:text-lg font-semibold text-orange-800">
								Alertes de Stock Faible
							</h3>
						</div>
						<NotificationBadge count={lowStockProducts.length} />
					</div>
					<div className="space-y-2 sm:space-y-3">
						{lowStockProducts.slice(0, 5).map((product) => (
							<Card key={product._id} className="shadow-sm">
								<CardContent className="p-2 sm:p-3">
									<div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
										<div className="flex-1 w-full">
											<p className="font-medium text-nude-dark text-sm sm:text-base">
												{product.name}
											</p>
											<div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
												{product.colors.map((color, colorIndex) =>
													color.sizes
														.filter(
															(size) => size.quantity >= 0 && size.quantity <= 5
														)
														.map((size, sizeIndex) => (
															<span
																key={`${colorIndex}-${sizeIndex}`}
																className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
																	size.quantity === 0
																		? "bg-red-100 text-red-800 font-bold"
																		: "bg-orange-100 text-orange-800"
																}`}
															>
																{color.name} {size.size}: {size.quantity}
																{size.quantity === 0 && " ⚠️"}
															</span>
														))
												)}
											</div>
										</div>
										<Link
											href="/studio"
											target="_blank"
											rel="noopener noreferrer"
											className="text-orange-600 hover:text-orange-800 text-xs sm:text-sm font-medium whitespace-nowrap self-end sm:self-auto"
										>
											Gérer le stock
										</Link>
									</div>
								</CardContent>
							</Card>
						))}
						{lowStockProducts.length > 5 && (
							<p className="text-xs sm:text-sm text-orange-700 text-center pt-1">
								Et {lowStockProducts.length - 5} autre
								{lowStockProducts.length - 5 > 1 ? "s" : ""} produit
								{lowStockProducts.length - 5 > 1 ? "s" : ""}...
							</p>
						)}
					</div>
				</div>
			)}

			{/* Graphique des ventes */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<SalesChart data={salesData} title="Ventes mensuelles 2024" />

				{/* Carte d'activité récente */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h3 className="text-lg lg:text-2xl font-semibold text-nude-dark mb-4">
						Activité récente
					</h3>
					<div className="space-y-4">
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<div>
								<p className="text-sm lg:text-base font-medium text-nude-dark">
									Nouvelle commande #1234
								</p>
								<p className="text-xs lg:text-sm text-nude-dark">
									Il y a 2 minutes
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
							<div>
								<p className="text-sm lg:text-base font-medium text-nude-dark">
									Nouveau produit ajouté
								</p>
								<p className="text-xs lg:text-sm text-nude-dark">
									Il y a 1 heure
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
							<div>
								<p className="text-sm lg:text-base font-medium text-nude-dark">
									Promotion créée
								</p>
								<p className="text-xs lg:text-sm text-nude-dark">
									Il y a 3 heures
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
