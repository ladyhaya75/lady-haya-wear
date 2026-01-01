import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { sendCustomEmail, sendOrderConfirmationEmail } from "@/lib/brevo";
import { generateInvoicePDFAsBuffer } from "@/lib/invoice-generator";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
	const body = await req.text();
	const signature = req.headers.get("stripe-signature");

	if (!signature) {
		return NextResponse.json(
			{ error: "Signature manquante" },
			{ status: 400 }
		);
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!
		);
	} catch (err: any) {
		console.error("Erreur webhook:", err.message);
		return NextResponse.json(
			{ error: `Webhook Error: ${err.message}` },
			{ status: 400 }
		);
	}

	// Gérer l'événement de paiement réussi
	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;

		try {
			const metadata = session.metadata!;
			const cartItems = JSON.parse(metadata.cartItems);

			// Récupérer les informations client depuis la BDD (pas depuis Stripe)
			const user = await prisma.user.findUnique({
				where: { id: metadata.userId },
				include: { profile: true },
			});

			if (!user) {
				throw new Error("Utilisateur non trouvé");
			}

			// Utiliser les infos du compte utilisateur, pas celles de la carte
			const customerEmail = user.email;
			const customerName = user.profile
				? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
				: session.customer_details?.name || "Client";

			// Créer la commande dans la base de données
			const order = await prisma.order.create({
				data: {
					userId: metadata.userId,
					orderNumber: `LHW-${Date.now()}`,
					customerEmail: customerEmail,
					customerName: customerName,
					shippingAddressId: metadata.selectedAddressId,
					carrier: metadata.selectedDelivery, // Stocker la méthode de livraison
					paymentMethod: "stripe",
					paymentStatus: "PAID",
					promoCodeId: metadata.promoCodeId || null,
					promoDiscount: parseFloat(metadata.promoDiscount) || 0,
					subtotal: session.amount_subtotal! / 100,
					shippingCost:
						(session.total_details?.amount_shipping || 0) / 100,
					taxAmount: (session.total_details?.amount_tax || 0) / 100,
					total: session.amount_total! / 100,
					status: "PENDING",
					stripeSessionId: session.id,
					stripePaymentIntentId: session.payment_intent as string,
					items: {
						create: cartItems.map((item: any) => ({
							productId: item.productId,
							productName: item.name,
							colorName: item.color,
							sizeName: item.size,
							quantity: item.quantity,
							unitPrice: item.price,
							totalPrice: item.price * item.quantity,
						})),
					},
				},
				include: {
					items: true,
					shippingAddress: true,
					billingAddress: true,
				},
			});

			// Gérer l'inscription à la newsletter si demandée
			if (metadata.subscribeNewsletter === "true") {
				const user = await prisma.user.findUnique({
					where: { id: metadata.userId },
				});

				if (user && !user.newsletterSubscribed) {
					await prisma.user.update({
						where: { id: metadata.userId },
						data: { newsletterSubscribed: true },
					});
				}
			}

			console.log("Commande créée avec succès:", order.orderNumber);

			// ===== ENVOI DES EMAILS =====
			
			// 1. Email de confirmation au client avec facture PDF
			try {
				console.log("Début de génération de la facture PDF...");

				// Générer la facture PDF
				const invoiceData = {
					orderNumber: order.orderNumber,
					orderDate: order.createdAt.toLocaleDateString("fr-FR"),
					customerName: customerName,
					customerEmail: customerEmail,
					customerPhone: user.profile?.phone || undefined,
					shippingAddress: order.shippingAddress
						? {
								...order.shippingAddress,
								civility:
									order.shippingAddress.civility === "MR"
										? "MR" as const
										: order.shippingAddress.civility === "MME"
											? "MME" as const
											: undefined,
							}
						: undefined,
					items: order.items.map((item) => ({
						name: item.productName,
						quantity: item.quantity,
						unitPrice: item.unitPrice,
						totalPrice: item.totalPrice,
						colorName: item.colorName || undefined,
						sizeName: item.sizeName || undefined,
					})),
					subtotal: order.subtotal,
					taxAmount: order.taxAmount,
					shippingCost: order.shippingCost,
					promoDiscount: order.promoDiscount,
					total: order.total,
					paymentMethod: "stripe",
				};

				console.log("Génération du PDF...");
				const pdfBuffer = generateInvoicePDFAsBuffer(invoiceData);
				console.log("PDF généré avec succès");

				console.log("Envoi de l'email de confirmation...");
				
				// Préparer les données pour l'email
				const orderData = {
					customerName: customerName,
					orderNumber: order.orderNumber,
					orderDate: order.createdAt.toLocaleDateString("fr-FR"),
					totalAmount: `${order.total.toFixed(2)}€`,
					items: order.items.map((item) => ({
						name: item.productName,
						quantity: item.quantity,
						price: `${item.totalPrice.toFixed(2)}€`,
					})),
					shippingAddress: order.shippingAddress || undefined,
					deliveryMethod: metadata.selectedDelivery,
					paymentMethod: "Stripe",
				};

				// Envoyer l'email avec la facture PDF en pièce jointe
				await sendOrderConfirmationEmail(customerEmail, orderData, pdfBuffer);
				console.log("Email de confirmation avec facture PDF envoyé au client");
			} catch (error) {
				console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
				// Ne pas faire échouer le webhook si l'email échoue
			}

			// 2. Email au vendeur avec les détails de la commande
			try {
				const deliveryMethodText =
					metadata.selectedDelivery === "domicile"
						? "À domicile (Colissimo)"
						: metadata.selectedDelivery === "relay"
							? "Point relais (Mondial Relay)"
							: "Livraison express (Chronopost)";

				const vendorEmailData = {
					to: "contact@ladyhaya-wear.fr",
					subject: `Nouvelle commande #${order.orderNumber} - À préparer (Stripe)`,
					htmlContent: `
            <html>
              <body>
                <h1>Nouvelle commande Stripe reçue !</h1>
                <h2>Commande #${order.orderNumber}</h2>
                
                <h3>Informations client :</h3>
                <p><strong>Nom :</strong> ${customerName}</p>
                <p><strong>Email :</strong> ${customerEmail}</p>
                <p><strong>Téléphone :</strong> ${user.profile?.phone || "Non renseigné"}</p>
                
                <h3>Adresse de livraison :</h3>
                <p>${order.shippingAddress?.civility === "MR" ? "M." : "Mme"} ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</p>
                <p>${order.shippingAddress?.street}</p>
                <p>${order.shippingAddress?.zipCode} ${order.shippingAddress?.city}</p>
                <p>${order.shippingAddress?.country}</p>
                
                <h3>Mode de livraison :</h3>
                <p>${deliveryMethodText}</p>
                
                <h3>Articles à préparer :</h3>
                <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produit</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Couleur</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Taille</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantité</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Prix unitaire</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items
											.map(
												(item) => `
                      <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.productName}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.colorName || "-"}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.sizeName || "-"}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.unitPrice.toFixed(2)}€</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalPrice.toFixed(2)}€</td>
                      </tr>
                    `
											)
											.join("")}
                  </tbody>
                </table>
                
                <h3>Récapitulatif financier :</h3>
                <p><strong>Sous-total HT :</strong> ${order.subtotal.toFixed(2)}€</p>
                <p><strong>TVA (20%) :</strong> ${order.taxAmount.toFixed(2)}€</p>
                <p><strong>Frais de livraison :</strong> ${order.shippingCost.toFixed(2)}€</p>
                ${order.promoDiscount > 0 ? `<p><strong>Réduction promo :</strong> -${order.promoDiscount.toFixed(2)}€</p>` : ""}
                <p><strong>Total TTC :</strong> <strong style="color: #d9c4b5; font-size: 1.2em;">${order.total.toFixed(2)}€</strong></p>
                
                <h3>Mode de paiement :</h3>
                <p>Stripe (Carte bancaire)</p>
                
                <hr style="margin: 30px 0;">
                <p><em>Cette commande a été automatiquement confirmée et payée via Stripe.</em></p>
                <p><em>Merci de préparer cette commande dans les plus brefs délais.</em></p>
              </body>
            </html>
          `,
				};

				await sendCustomEmail(vendorEmailData);
				console.log("Email de notification envoyé au vendeur");
			} catch (error) {
				console.error("Erreur lors de l'envoi de l'email au vendeur:", error);
			}
		} catch (error) {
			console.error("Erreur création commande:", error);
			return NextResponse.json(
				{ error: "Erreur création commande" },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json({ received: true });
}

