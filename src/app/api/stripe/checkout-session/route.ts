import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Forcer le mode dynamique et runtime nodejs
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
	try {
		const {
			cartItems,
			selectedAddressId,
			selectedDelivery,
			promoCodeId,
			promoDiscount,
			subtotal,
			shippingCost,
			taxAmount,
			total,
			subscribeNewsletter,
		} = await req.json();

		// Vérifier l'authentification
		const authRes = await fetch(
			`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/me`,
			{
				headers: {
					cookie: req.headers.get("cookie") || "",
				},
			}
		);

		if (!authRes.ok) {
			return NextResponse.json(
				{ error: "Non authentifié" },
				{ status: 401 }
			);
		}

		const { user } = await authRes.json();

	// Créer les line items pour Stripe
	const lineItems = cartItems.map((item: any) => {
		// Stripe n'accepte que des URLs HTTPS absolues
		const imageUrl = item.image?.startsWith('http') ? item.image : null;
		
		return {
			price_data: {
				currency: "eur",
				product_data: {
					name: item.name,
					description: `${item.color} - Taille ${item.size}`,
					// Ajouter l'image uniquement si c'est une URL valide
					...(imageUrl && { images: [imageUrl] }),
				},
				unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
			},
			quantity: item.quantity,
		};
	});

		// Ajouter les frais de livraison comme line item séparé
		if (shippingCost > 0) {
			lineItems.push({
				price_data: {
					currency: "eur",
					product_data: {
						name: "Frais de livraison",
						description:
							selectedDelivery === "chronopost"
								? "Livraison express (Chronopost)"
								: selectedDelivery === "relay"
									? "Point relais (Mondial Relay)"
									: "À domicile (Colissimo)",
					},
					unit_amount: Math.round(shippingCost * 100),
				},
				quantity: 1,
			});
		}

		// Créer la session Stripe Checkout
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout`,
			customer_email: user.email,
			metadata: {
				userId: user.id,
				selectedAddressId,
				selectedDelivery,
				promoCodeId: promoCodeId || "",
				promoDiscount: promoDiscount.toString(),
				subscribeNewsletter: subscribeNewsletter.toString(),
				cartItems: JSON.stringify(cartItems),
			},
			// Appliquer la réduction promo si applicable
			...(promoDiscount > 0 && {
				discounts: [
					{
						coupon: await stripe.coupons.create({
							amount_off: Math.round(promoDiscount * 100),
							currency: "eur",
							duration: "once",
						}).then((c) => c.id),
					},
				],
			}),
		});

		return NextResponse.json({ sessionId: session.id, url: session.url });
	} catch (error) {
		console.error("Erreur création session Stripe:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la création de la session de paiement" },
			{ status: 500 }
		);
	}
}

