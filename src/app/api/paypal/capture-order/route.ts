import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";
import { decrementStock } from "@/lib/stock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET : PayPal redirige ici après approbation du paiement
// URL : /api/paypal/capture-order?orderId=xxx&token=PAYPAL_ORDER_ID
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const paypalOrderId = searchParams.get("token"); // PayPal envoie 'token'
	const orderId = searchParams.get("orderId"); // Notre ID commande BDD

	const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

	if (!paypalOrderId || !orderId) {
		return NextResponse.redirect(`${baseUrl}/checkout?error=paypal_invalid`);
	}

	try {
		// ===== CAPTURE DU PAIEMENT PAYPAL =====
		const { status } = await capturePayPalOrder(paypalOrderId);

		if (status !== "COMPLETED") {
			console.error(`PayPal capture status inattendu: ${status}`);
			// Marquer la commande comme annulée
			await prisma.order.update({
				where: { id: orderId },
				data: { paymentStatus: "FAILED", status: "CANCELLED" },
			}).catch(() => {});
			return NextResponse.redirect(`${baseUrl}/checkout?error=paypal_failed`);
		}

		// ===== MISE À JOUR COMMANDE EN BDD =====
		const order = await prisma.order.update({
			where: { id: orderId },
			data: {
				paymentStatus: "PAID",
				status: "PENDING", // Prête à être préparée
			},
			include: {
				items: true,
				shippingAddress: true,
				user: { include: { profile: true } },
			},
		});

		// ===== DÉCRÉMENTATION DU STOCK =====
		try {
			const stockItems = order.items.map((item) => ({
				productId: item.productId,
				name: item.productName,
				color: item.colorName || "",
				size: item.sizeName || "",
				quantity: item.quantity,
				price: item.unitPrice,
			}));
			await decrementStock(stockItems);
		} catch (err) {
			// Le paiement est déjà capturé, on log mais on ne bloque pas
			console.error("Erreur décrémentation stock PayPal:", err);
		}

		// ===== VIDAGE DU PANIER =====
		await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

		// ===== NEWSLETTER =====
		try {
			const notes = order.notes ? JSON.parse(order.notes) : {};
			if (notes.subscribeNewsletter) {
				await prisma.user.update({
					where: { id: order.userId },
					data: { newsletterSubscribed: true },
				});
			}
		} catch {}

		// ===== EMAIL CLIENT (facture PDF) =====
		try {
			const { generateInvoicePDFAsBuffer } = await import(
				"@/lib/invoice-generator"
			);
			const { sendOrderConfirmationEmail } = await import("@/lib/brevo");

			const invoiceData = {
				orderNumber: order.orderNumber,
				orderDate: order.createdAt.toLocaleDateString("fr-FR"),
				customerName: order.customerName,
				customerEmail: order.customerEmail,
				customerPhone: order.customerPhone || undefined,
				shippingAddress: {
					...order.shippingAddress!,
					civility:
						order.shippingAddress?.civility === "MR"
							? ("MR" as const)
							: order.shippingAddress?.civility === "MME"
								? ("MME" as const)
								: undefined,
				},
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
				paymentMethod: "paypal",
			};

			const pdfBuffer = generateInvoicePDFAsBuffer(invoiceData);

			const orderData = {
				customerName: order.customerName,
				orderNumber: order.orderNumber,
				orderDate: order.createdAt.toLocaleDateString("fr-FR"),
				totalAmount: `${order.total.toFixed(2)}€`,
				items: order.items.map((item) => ({
					name: item.productName,
					quantity: item.quantity,
					price: `${item.totalPrice.toFixed(2)}€`,
				})),
				shippingAddress: order.shippingAddress || undefined,
				deliveryMethod: order.carrier || "domicile",
				paymentMethod: "PayPal",
			};

			await sendOrderConfirmationEmail(
				order.customerEmail,
				orderData,
				pdfBuffer
			);
			console.log("Email confirmation PayPal envoyé au client");
		} catch (err) {
			console.error("Erreur email confirmation PayPal:", err);
		}

		// ===== EMAIL VENDEUR =====
		try {
			const { sendCustomEmail } = await import("@/lib/brevo");
			const deliveryText =
				order.carrier === "domicile"
					? "À domicile (Colissimo)"
					: order.carrier === "relay"
						? "Point relais (Mondial Relay)"
						: "Livraison express (Chronopost)";

			await sendCustomEmail({
				to: "contact@ladyhaya-wear.fr",
				subject: `Nouvelle commande #${order.orderNumber} - À préparer (PayPal)`,
				htmlContent: `
          <html><body style="font-family: Arial, sans-serif;">
            <h1 style="color: #d9c4b5;">Nouvelle commande PayPal reçue !</h1>
            <h2>Commande #${order.orderNumber}</h2>
            <h3>Informations client :</h3>
            <p><strong>Nom :</strong> ${order.customerName}</p>
            <p><strong>Email :</strong> ${order.customerEmail}</p>
            <p><strong>Téléphone :</strong> ${order.customerPhone || "Non renseigné"}</p>
            <h3>Adresse de livraison :</h3>
            <p>
              ${order.shippingAddress?.civility === "MR" ? "M." : "Mme"}
              ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}<br/>
              ${order.shippingAddress?.street}<br/>
              ${order.shippingAddress?.zipCode} ${order.shippingAddress?.city}<br/>
              ${order.shippingAddress?.country}
            </p>
            <h3>Mode de livraison :</h3>
            <p>${deliveryText}</p>
            <h3>Articles à préparer :</h3>
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produit</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Couleur</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Taille</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qté</th>
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
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalPrice.toFixed(2)}€</td>
                  </tr>`
									)
									.join("")}
              </tbody>
            </table>
            <h3>Total TTC : <strong style="color: #d9c4b5;">${order.total.toFixed(2)}€</strong></h3>
            <p><strong>Mode de paiement :</strong> PayPal - CONFIRMÉ ET CAPTURÉ</p>
            <hr/>
            <p><em>Merci de préparer cette commande dans les plus brefs délais.</em></p>
          </body></html>
        `,
			});
		} catch (err) {
			console.error("Erreur email vendeur PayPal:", err);
		}

		// ===== REDIRECTION VERS LA PAGE DE SUCCÈS =====
		const successUrl = `${baseUrl}/checkout/success?paypal=true&orderNumber=${encodeURIComponent(order.orderNumber)}&amount=${order.total}&email=${encodeURIComponent(order.customerEmail)}`;
		return NextResponse.redirect(successUrl);
	} catch (error) {
		console.error("Erreur capture PayPal:", error);
		return NextResponse.redirect(
			`${baseUrl}/checkout?error=paypal_capture_failed`
		);
	}
}
