import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Forcer le mode dynamique pour éviter l'évaluation de Brevo au build
export const dynamic = 'force-dynamic';

// GET - Job CRON pour envoyer les emails de demande d'avis
export async function GET(request: NextRequest) {
	try {
		// Vérifier l'autorisation (optionnel : ajouter une clé secrète)
		const authHeader = request.headers.get("authorization");
		const expectedAuth = `Bearer ${process.env.CRON_SECRET || "ma-cle-secrete-lady-haya-2024-newsletter-cleanup-xyz789"}`;

		console.log("🔐 Auth check - Header:", authHeader);
		console.log("🔐 Auth check - Expected:", expectedAuth);

		if (authHeader !== expectedAuth) {
			console.log("❌ Authorization failed");
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		console.log("✅ Authorization successful");

		// Pour le test, on prend les commandes DELIVERED récentes (dernières 72h)
		// En production, on utilisera exactement 48h
		const seventyTwoHoursAgo = new Date();
		seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

		console.log(
			"📅 Recherche des commandes livrées depuis:",
			seventyTwoHoursAgo
		);

		// Trouver les commandes livrées récemment qui n'ont pas encore reçu d'email de review
		const ordersToReview = await prisma.order.findMany({
			where: {
				status: "DELIVERED",
				deliveredAt: {
					gte: seventyTwoHoursAgo, // Dernières 72h pour le test
				},
				// Vérifier qu'aucun review n'a été créé pour cette commande
				reviews: {
					none: {},
				},
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
					},
				},
				items: true,
			},
		});

		console.log(
			`📦 Trouvé ${ordersToReview.length} commandes pour demande d'avis`
		);

		if (ordersToReview.length === 0) {
			console.log("ℹ️ Aucune commande éligible trouvée");
			return NextResponse.json({
				message: "Aucune commande éligible pour demande d'avis",
				processed: 0,
			});
		}

		let emailsSent = 0;
		let errors = 0;

		// Traiter chaque commande
		for (const order of ordersToReview) {
			try {
				console.log(
					`📧 Traitement commande ${order.orderNumber} pour ${order.user.email}`
				);
				// Créer les enregistrements Review pour chaque produit de la commande
				const reviewPromises = order.items.map(async (item) => {
					// Générer un token unique pour chaque review
					const reviewToken = randomBytes(32).toString("hex");

					return prisma.review.create({
						data: {
							userId: order.userId,
							orderId: order.id,
							productId: item.productId,
							productName: item.productName,
							rating: 0, // Sera mis à jour quand le client soumettra
							comment: "", // Sera mis à jour quand le client soumettra
							customerName: order.customerName,
							customerEmail: order.customerEmail,
							status: "PENDING",
							emailToken: reviewToken,
							emailSentAt: new Date(),
						},
					});
				});

				await Promise.all(reviewPromises);

				// Préparer les données pour l'email
				const reviewData = {
					customerName: order.customerName,
					orderNumber: order.orderNumber,
					orderDate: order.createdAt.toLocaleDateString("fr-FR", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					items: order.items.map((item) => ({
						id: item.productId,
						name: item.productName,
						quantity: item.quantity,
					})),
					reviewToken: randomBytes(32).toString("hex"), // Token global pour la commande
				};

				// Envoyer l'email
				const { sendReviewRequestEmail } = await import("@/lib/brevo");
				await sendReviewRequestEmail(order.customerEmail, reviewData);

				emailsSent++;
				console.log(
					`Email de demande d'avis envoyé pour la commande #${order.orderNumber}`
				);
			} catch (error) {
				console.error(`Erreur pour la commande #${order.orderNumber}:`, error);
				errors++;
			}
		}

		return NextResponse.json({
			message: "Job CRON exécuté avec succès",
			ordersProcessed: ordersToReview.length,
			emailsSent,
			errors,
			executedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Erreur dans le job CRON de demande d'avis:", error);
		return NextResponse.json(
			{
				error: "Erreur lors de l'exécution du job CRON",
				details: error instanceof Error ? error.message : "Erreur inconnue",
			},
			{ status: 500 }
		);
	}
}

// POST - Déclencher manuellement le job (pour les tests)
export async function POST(request: NextRequest) {
	try {
		// Réutiliser la logique du GET
		const response = await GET(request);
		return response;
	} catch (error) {
		console.error("Erreur lors du déclenchement manuel:", error);
		return NextResponse.json(
			{ error: "Erreur lors du déclenchement manuel" },
			{ status: 500 }
		);
	}
}
