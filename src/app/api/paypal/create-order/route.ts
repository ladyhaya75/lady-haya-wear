import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { checkStockAvailability } from "@/lib/stock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	try {
		// ===== AUTH =====
		const token = req.cookies.get("auth-token")?.value;
		if (!token)
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			include: { profile: true, addresses: true },
		});
		if (!user)
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

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

		// ===== VALIDATION ADRESSE =====
		const shippingAddress = user.addresses.find(
			(a) => a.id === selectedAddressId
		);
		if (!shippingAddress)
			return NextResponse.json(
				{ error: "Adresse de livraison non trouvée" },
				{ status: 400 }
			);

		// ===== VÉRIFICATION STOCK =====
		const stockCheck = await checkStockAvailability(cartItems);
		const unavailable = stockCheck.filter((r) => !r.available);
		if (unavailable.length > 0) {
			const messages = unavailable.map(
				(r) => `${r.productName} (${r.color} - ${r.size}): ${r.message}`
			);
			return NextResponse.json(
				{ error: "Stock insuffisant", details: messages },
				{ status: 400 }
			);
		}

		// ===== CRÉATION COMMANDE EN ATTENTE =====
		// On crée la commande en BDD avec paymentStatus PENDING
		// Elle sera mise à jour à PAID après confirmation PayPal
		const orderNumber = `LHW-${Date.now()}`;

		const order = await prisma.order.create({
			data: {
				userId: user.id,
				orderNumber,
				status: "PENDING",
				customerEmail: user.email,
				customerName:
					`${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
					"Client",
				customerPhone: user.profile?.phone,
				subtotal,
				shippingCost,
				taxAmount,
				total,
				promoCodeId: promoCodeId || null,
				promoDiscount: promoDiscount || 0,
				paymentMethod: "paypal",
				paymentStatus: "PENDING",
				shippingAddressId: selectedAddressId,
				billingAddressId: selectedAddressId,
				carrier: selectedDelivery,
				// On stocke la préférence newsletter dans les notes
				notes: JSON.stringify({ subscribeNewsletter }),
				items: {
					create: cartItems.map((item: any) => ({
						productId: item.id,
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

		// ===== CRÉATION COMMANDE PAYPAL =====
		const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

		const { approvalUrl } = await createPayPalOrder({
			amount: total,
			currency: "EUR",
			description: `Commande Lady Haya Wear #${orderNumber}`,
			// On passe l'ID de notre commande en BDD dans l'URL de retour
			returnUrl: `${baseUrl}/api/paypal/capture-order?orderId=${order.id}`,
			cancelUrl: `${baseUrl}/checkout?paypal=cancelled&orderId=${order.id}`,
		});

		return NextResponse.json({ approvalUrl });
	} catch (error) {
		console.error("Erreur création commande PayPal:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la création de la commande PayPal" },
			{ status: 500 }
		);
	}
}
