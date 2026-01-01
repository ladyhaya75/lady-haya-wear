import { prisma } from "@/lib/prisma";
import { triggerReviewRequestForOrder } from "@/lib/review-automation";
import { incrementStock, type CartItem } from "@/lib/stock";
import { NextRequest, NextResponse } from "next/server";

// Forcer le mode dynamique pour éviter l'évaluation de Brevo au build
export const dynamic = 'force-dynamic';

// GET - Récupérer une commande spécifique
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				items: true,
				user: {
					select: {
						id: true,
						email: true,
					},
				},
				shippingAddress: true,
				billingAddress: true,
				promoCode: {
					select: {
						id: true,
						code: true,
						type: true,
						value: true,
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json(
				{ error: "Commande non trouvée" },
				{ status: 404 }
			);
		}

		return NextResponse.json(order);
	} catch (error) {
		console.error("Erreur lors de la récupération de la commande:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la récupération de la commande" },
			{ status: 500 }
		);
	}
}

// PUT - Mettre à jour le statut d'une commande
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const {
			status,
			notes,
			trackingNumber,
			carrier,
			sendEmail = true,
		} = await request.json();

		// Vérifier si la commande existe
		const existingOrder = await prisma.order.findUnique({
			where: { id },
		});

		if (!existingOrder) {
			return NextResponse.json(
				{ error: "Commande non trouvée" },
				{ status: 404 }
			);
		}

		// Préparer les données de mise à jour
		const updateData: any = {};

		if (status) {
			updateData.status = status;

			// Mettre à jour les dates selon le statut
			if (status === "SHIPPED" && !existingOrder.shippedAt) {
				updateData.shippedAt = new Date();
			} else if (status === "DELIVERED" && !existingOrder.deliveredAt) {
				updateData.deliveredAt = new Date();
			}

			// Si on revient à un statut antérieur, on peut réinitialiser les dates
			if (status === "PENDING") {
				updateData.shippedAt = null;
				updateData.deliveredAt = null;
			} else if (status === "SHIPPED") {
				updateData.deliveredAt = null;
			}
		}

		if (notes !== undefined) {
			updateData.notes = notes;
		}

		if (trackingNumber !== undefined) {
			updateData.trackingNumber = trackingNumber;
		}

		if (carrier !== undefined) {
			updateData.carrier = carrier;
		}

		// Mettre à jour la commande
		const order = await prisma.order.update({
			where: { id },
			data: updateData,
			include: {
				items: true,
				user: {
					select: {
						id: true,
						email: true,
					},
				},
				shippingAddress: true,
				billingAddress: true,
				promoCode: {
					select: {
						id: true,
						code: true,
					},
				},
			},
		});

		// Envoyer un email de notification au client si le statut a changé et si l'option est activée
		if (status && status !== existingOrder.status && sendEmail) {
			try {
				// Générer le lien de suivi si disponible
				let trackingUrl = "";
				if (trackingNumber && carrier) {
					switch (carrier) {
						case "colissimo":
							trackingUrl = `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`;
							break;
						case "chronopost":
							trackingUrl = `https://www.chronopost.fr/tracking-colis?listeNumerosLT=${trackingNumber}`;
							break;
						case "mondial-relay":
							trackingUrl = `https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=${trackingNumber}`;
							break;
						case "dpd":
							trackingUrl = `https://www.dpd.fr/tracer/${trackingNumber}`;
							break;
						case "ups":
							trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`;
							break;
						case "fedex":
							trackingUrl = `https://www.fedex.com/fr-fr/tracking.html?tracknumbers=${trackingNumber}`;
							break;
					}
				}

				const orderData = {
					customerName: order.customerName,
					orderNumber: order.orderNumber,
					status: status,
					trackingNumber: trackingNumber,
					carrier: carrier,
					trackingUrl: trackingUrl,
			};

			const { sendOrderStatusUpdateEmail } = await import("@/lib/brevo");
			await sendOrderStatusUpdateEmail(order.customerEmail, orderData);
			console.log(
				`Email de mise à jour de statut envoyé pour la commande #${order.orderNumber}`
				);
			} catch (error) {
				console.error(
					"Erreur lors de l'envoi de l'email de mise à jour:",
					error
				);
				// Ne pas faire échouer la mise à jour de la commande si l'email échoue
			}
		}

		// Déclencher automatiquement l'envoi d'email de demande d'avis si la commande passe à "DELIVERED"
		if (status === "DELIVERED" && existingOrder.status !== "DELIVERED") {
			try {
				console.log(
					`🚀 Déclenchement automatique de demande d'avis pour commande #${order.orderNumber}`
				);
				const reviewResult = await triggerReviewRequestForOrder(order.id);

				if (reviewResult.success) {
					console.log(
						`✅ ${reviewResult.message} - Reviews créées: ${reviewResult.reviewsCreated}`
					);
				} else {
					console.log(`⚠️ Demande d'avis non envoyée: ${reviewResult.error}`);
				}
			} catch (error) {
				console.error(
					`❌ Erreur lors du déclenchement automatique de demande d'avis pour commande #${order.orderNumber}:`,
					error
				);
				// Ne pas faire échouer la mise à jour de la commande si l'envoi de review échoue
			}
		}

		// ===== REMETTRE LE STOCK SI COMMANDE ANNULÉE OU REMBOURSÉE =====
		if (
			(status === "CANCELLED" || status === "REFUNDED") &&
			existingOrder.status !== "CANCELLED" &&
			existingOrder.status !== "REFUNDED"
		) {
			try {
				console.log(
					`🔄 Remise en stock des articles de la commande #${order.orderNumber}`
				);

				// Convertir les items de la commande au format CartItem pour incrementStock
				const cartItems: CartItem[] = order.items.map((item) => ({
					productId: item.productId,
					slug: "", // On utilisera productId pour la recherche dans incrementStock
					name: item.productName,
					color: item.colorName || "",
					size: item.sizeName || "",
					quantity: item.quantity,
					price: item.unitPrice,
				}));

				await incrementStock(cartItems);
				console.log(
					`✅ Stock remis avec succès pour la commande #${order.orderNumber}`
				);
			} catch (error) {
				console.error(
					`❌ Erreur lors de la remise en stock pour commande #${order.orderNumber}:`,
					error
				);
				// Ne pas faire échouer la mise à jour de la commande si la remise en stock échoue
			}
		}

		return NextResponse.json({
			message: "Statut de la commande mis à jour avec succès",
			order,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour de la commande:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la mise à jour de la commande" },
			{ status: 500 }
		);
	}
}
