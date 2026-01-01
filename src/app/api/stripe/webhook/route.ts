import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

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

			// Récupérer les informations client depuis la session Stripe
			const customerEmail = session.customer_details?.email || session.customer_email || "";
			const customerName = session.customer_details?.name || "Client";

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

