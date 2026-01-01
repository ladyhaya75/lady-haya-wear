import { randomBytes } from "crypto";
import { prisma } from "./prisma";

/**
 * Fonction pour déclencher automatiquement l'envoi d'email de demande d'avis
 * quand une commande est marquée comme livrée
 */
export async function triggerReviewRequestForOrder(orderId: string) {
	try {
		console.log(`🔄 Déclenchement de demande d'avis pour commande ${orderId}`);

		// Récupérer la commande avec tous les détails nécessaires
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				user: {
					select: {
						id: true,
						email: true,
					},
				},
				items: true,
				reviews: true, // Pour vérifier si des reviews existent déjà
			},
		});

		if (!order) {
			console.error(`❌ Commande ${orderId} non trouvée`);
			return { success: false, error: "Commande non trouvée" };
		}

		// Vérifier si la commande est bien livrée
		if (order.status !== "DELIVERED") {
			console.log(
				`⚠️ Commande ${order.orderNumber} n'est pas livrée (statut: ${order.status})`
			);
			return { success: false, error: "La commande n'est pas livrée" };
		}

		// Vérifier si des reviews ont déjà été créées pour cette commande
		if (order.reviews && order.reviews.length > 0) {
			console.log(
				`ℹ️ Des reviews existent déjà pour la commande ${order.orderNumber}`
			);
			return {
				success: false,
				error: "Des reviews existent déjà pour cette commande",
			};
		}

		// Générer un token unique pour toute la commande
		const reviewToken = randomBytes(32).toString("hex");
		console.log(
			`📝 Création des reviews pour ${order.items.length} produits avec token: ${reviewToken}`
		);

		// Créer les enregistrements Review pour chaque produit de la commande
		const reviewPromises = order.items.map(async (item) => {
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
					emailToken: reviewToken, // Même token pour tous les reviews de la commande
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
			reviewToken: reviewToken, // Utiliser le même token
		};

		// Envoyer l'email de demande d'avis
		console.log(`📧 Envoi email de demande d'avis à ${order.customerEmail}`);
		const { sendReviewRequestEmail } = await import("./brevo");
		await sendReviewRequestEmail(order.customerEmail, reviewData);

		console.log(
			`✅ Email de demande d'avis envoyé avec succès pour commande #${order.orderNumber}`
		);

		return {
			success: true,
			message: `Email de demande d'avis envoyé pour la commande #${order.orderNumber}`,
			reviewsCreated: order.items.length,
		};
	} catch (error) {
		console.error(
			`❌ Erreur lors de l'envoi de demande d'avis pour commande ${orderId}:`,
			error
		);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erreur inconnue",
		};
	}
}

/**
 * Fonction pour vérifier si une commande est éligible pour une demande d'avis
 */
export async function isOrderEligibleForReview(
	orderId: string
): Promise<boolean> {
	try {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				reviews: true,
			},
		});

		if (!order) return false;

		// Éligible si : commande livrée ET aucune review n'existe
		return (
			order.status === "DELIVERED" &&
			(!order.reviews || order.reviews.length === 0)
		);
	} catch (error) {
		console.error("Erreur lors de la vérification d'éligibilité:", error);
		return false;
	}
}
